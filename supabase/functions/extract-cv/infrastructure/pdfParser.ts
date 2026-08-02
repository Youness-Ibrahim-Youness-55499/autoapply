// PDF layout extraction using pdfjs-dist. This project has no Python
// anywhere, so PyMuPDF (the originally scoped library) isn't usable --
// pdfjs-dist is the closest equivalent that runs under Deno (via the
// npm: specifier), and its getTextContent() API gives per-text-run
// position and font-size metadata without collapsing to plain text.
//
// Version pinned to what the pure mapping logic in pdfTextMapper.ts was
// verified against (see pdfTextMapper.fixtures.mjs, run under Node
// against a handcrafted sample PDF). No Deno CLI is available in this
// environment, so this file's own npm:-specifier import is unverified --
// only the pure mapper it delegates to has been tested.
import * as pdfjsLib from "npm:pdfjs-dist@6.2.108/legacy/build/pdf.mjs";
import type { LayoutTextBlock } from "./layout.ts";
import { mapPdfTextItems, type RawPdfFontStyle, type RawPdfTextItem } from "./pdfTextMapper.ts";

export async function extractPdfLayout(bytes: Uint8Array): Promise<LayoutTextBlock[]> {
  const document = await pdfjsLib.getDocument({
    data: bytes,
    isEvalSupported: false,
    useWorkerFetch: false,
  }).promise;

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
