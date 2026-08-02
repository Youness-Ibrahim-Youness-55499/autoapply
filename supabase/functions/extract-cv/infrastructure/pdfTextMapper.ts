// Pure mapping from raw pdfjs text-content data to our own domain-neutral
// LayoutTextBlock shape. Deliberately has zero dependency on pdfjs itself
// (or any Deno-specific API) so it can be unit tested directly under plain
// Node -- see pdfTextMapper.fixtures.mjs -- even though this project has
// no Deno CLI available to test the real pdfjs-calling wrapper
// (pdfParser.ts) end to end.

import type { LayoutTextBlock } from "./layout.ts";

// Minimal structural shape of what we read off a pdfjs TextItem + its
// style entry, kept separate from pdfjs's own types for the same reason.
export type RawPdfTextItem = {
  fontName: string;
  height: number;
  str: string;
  transform: number[];
};

export type RawPdfFontStyle = {
  fontFamily: string;
};

// Real PDFs almost always use standard fonts without embedded font
// programs for body text -- verified directly against pdfjs-dist that it
// then only exposes a generic CSS fallback family ("sans-serif"), not the
// real font name, so this returns false for those. Embedded fonts (common
// when exported from Word/LibreOffice/Canva/LaTeX) often keep a
// descriptive family name, which this does catch.
export function looksBold(fontFamily: string): boolean {
  return /bold|black|heavy/i.test(fontFamily);
}

export function looksItalic(fontFamily: string): boolean {
  return /italic|oblique/i.test(fontFamily);
}

// One block per text run pdfjs already segments by consistent styling --
// nothing is merged into larger paragraphs here, per "never collapse to
// plain text early." That merging is a section/field-extraction concern
// for a later phase, not this one.
export function mapPdfTextItems(
  items: RawPdfTextItem[],
  styles: Record<string, RawPdfFontStyle>,
  pageNumber: number,
): LayoutTextBlock[] {
  const blocks: LayoutTextBlock[] = [];
  let blockIndex = 0;

  for (const item of items) {
    // pdfjs-dist emits zero-height placeholder items alongside real text
    // runs (confirmed empirically against a real generated PDF); these
    // carry no usable content and would otherwise show up as spurious
    // empty blocks.
    if (!item.str.trim() || item.height <= 0) {
      continue;
    }

    const fontFamily = styles[item.fontName]?.fontFamily ?? "";

    blocks.push({
      blockId: `p${pageNumber}-b${blockIndex}`,
      fontSize: item.height,
      isBold: looksBold(fontFamily),
      isItalic: looksItalic(fontFamily),
      page: pageNumber,
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
    });
    blockIndex++;
  }

  return blocks;
}
