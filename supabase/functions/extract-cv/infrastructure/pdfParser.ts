// PDF layout extraction. This project has no Python anywhere, so
// PyMuPDF (the originally scoped library) isn't usable. Raw pdfjs-dist
// (the initial choice here) doesn't work either -- confirmed by direct
// deployment testing, not assumption: importing it at all, with zero
// function calls, crashes Supabase's Edge Runtime with a WORKER_ERROR at
// module load. unpdf (https://github.com/unjs/unpdf) wraps the same
// pdfjs engine in a build specifically meant for serverless/edge
// runtimes, avoiding whatever pdfjs-dist's own module does at import
// time that the sandbox rejects. getDocumentProxy() returns the same
// underlying pdfjs PDFDocumentProxy pdfjs-dist itself would have, so
// .getPage()/.getTextContent() behave identically -- confirmed directly:
// ran this exact call chain against a real deployed function with a real
// generated PDF and diffed the output against the ground-truth capture
// pdfTextMapper.fixtures.mjs was built from. Byte-for-byte the same
// shape (str/transform/fontName/height, the same zero-height placeholder
// items, the same "sans-serif" style fallback), so the pure mapper below
// needed zero changes.
import { getDocumentProxy } from "npm:unpdf@1.8.0";
import type { LayoutTextBlock } from "./layout.ts";
import { mapPdfTextItems, type RawPdfFontStyle, type RawPdfTextItem } from "./pdfTextMapper.ts";

export async function extractPdfLayout(bytes: Uint8Array): Promise<LayoutTextBlock[]> {
  const document = await getDocumentProxy(bytes);

  const blocks: LayoutTextBlock[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();

    const items = content.items.filter(
      (item: unknown): item is RawPdfTextItem =>
        !!item && typeof (item as RawPdfTextItem).str === "string",
    );

    blocks.push(
      ...mapPdfTextItems(items, content.styles as Record<string, RawPdfFontStyle>, pageNumber),
    );
  }

  return blocks;
}
