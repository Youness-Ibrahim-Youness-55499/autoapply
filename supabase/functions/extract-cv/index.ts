// Thin HTTP handler: validates the request, downloads the referenced
// document from Storage, runs it through the matching parser and the
// pure extraction pipeline, and writes the result back onto the
// documents row. No extraction logic of its own lives here -- everything
// in this file is request/response and Supabase I/O; the actual work is
// domain/application/infrastructure, all independently tested (see the
// .fixtures.mjs files throughout this module).
//
// Not verified against a real deployment. This environment has no Deno
// CLI and no Supabase CLI/service-role credentials to deploy or invoke
// this function against a live project (the same standing caveat as
// every un-applied migration elsewhere in this repo). Deploy with:
//   supabase functions deploy extract-cv
// before src/features/documents/useDocuments.ts's calls to it will do
// anything but fail.
import { createClient } from "npm:@supabase/supabase-js@2.111.0";
import { extractDocxLayout } from "./infrastructure/docxParser.ts";
import { extractPdfLayout } from "./infrastructure/pdfParser.ts";
import { extractCv } from "./application/extractCv.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Origin": "*",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    status,
  });
}

const PDF_MIME_TYPE = "application/pdf";
const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header." }, 401);
  }

  let documentId: string;
  try {
    const body = await request.json();
    if (typeof body !== "object" || body === null || typeof body.documentId !== "string" || !body.documentId) {
      throw new Error("documentId is required.");
    }
    documentId = body.documentId;
  } catch {
    return jsonResponse({ error: "Request body must be JSON with a documentId field." }, 400);
  }

  // Uses the caller's own JWT rather than a service-role key, so the
  // existing RLS policies on documents/storage.objects (see
  // supabase/migrations/20260731090000_create_private_documents.sql)
  // apply exactly as they do everywhere else -- this function can only
  // ever read/write documents the calling user already owns.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, mime_type, storage_path")
    .eq("id", documentId)
    .single();

  if (documentError || !document) {
    return jsonResponse({ error: "Document not found." }, 404);
  }

  try {
    const { data: file, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(document.storage_path);

    if (downloadError || !file) {
      throw new Error(downloadError?.message ?? "Could not download the file.");
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    let blocks;
    if (document.mime_type === PDF_MIME_TYPE) {
      blocks = await extractPdfLayout(bytes);
    } else if (document.mime_type === DOCX_MIME_TYPE) {
      blocks = extractDocxLayout(bytes);
    } else {
      throw new Error(`Unsupported file type: ${document.mime_type}`);
    }

    const extracted = extractCv(blocks);

    const { error: updateError } = await supabase
      .from("documents")
      .update({ processing_status: "ready", structured_data: extracted })
      .eq("id", documentId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return jsonResponse({ data: extracted });
  } catch (error) {
    // Mirrors the pipeline's own "fail gracefully, never silently" rule
    // at the HTTP boundary: a scanned/image-only PDF, a corrupt file, or
    // a genuine parser exception all land here rather than leaving the
    // document stuck showing "processing" forever.
    await supabase
      .from("documents")
      .update({ processing_status: "failed" })
      .eq("id", documentId);

    const message = error instanceof Error ? error.message : "Extraction failed.";
    return jsonResponse({ error: message }, 500);
  }
});
