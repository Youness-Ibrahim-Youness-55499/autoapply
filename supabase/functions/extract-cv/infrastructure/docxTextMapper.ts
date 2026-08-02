// Pure mapping from parsed WordprocessingML (word/document.xml) to our own
// domain-neutral LayoutTextBlock shape. Deliberately has zero dependency
// on any XML/ZIP library so it can be unit tested directly under plain
// Node -- see docxTextMapper.fixtures.mjs -- even though this project has
// no Deno CLI to test the real ZIP+XML-parsing wrapper (docxParser.ts)
// end to end.
//
// Unlike PDF, a .docx file has no native page or coordinate data at the
// XML level: pagination and on-screen position are computed by whichever
// application renders the document, not stored in the file. So every
// block reports page: 1 and x: 0, y: 0 -- the paragraph/run index encoded
// in blockId is the real DOCX-native locator, not a spatial one.

import type { LayoutTextBlock } from "./layout.ts";

// Shape produced by fast-xml-parser with { preserveOrder: true,
// ignoreAttributes: false, attributeNamePrefix: "@_" } -- verified
// directly against a real generated .docx (see docxTextMapper.fixtures.mjs).
// Element tags map to their children array; "#text" maps directly to a
// string; ":@" holds the element's own attributes.
export type XmlNode = {
  [tag: string]: XmlNode[] | string | undefined;
  ":@"?: Record<string, string>;
};

// Word's common default body size (11pt, stored in half-points) when a
// run's <w:rPr> doesn't specify <w:sz>. The real default is resolved by
// walking styles.xml's docDefaults / style inheritance chain, which is
// out of scope for this phase -- a run without an explicit size just gets
// this constant rather than that full resolution.
const DEFAULT_FONT_SIZE_HALF_POINTS = 22;

function childrenOf(node: XmlNode | undefined, tag: string): XmlNode[] {
  const value = node?.[tag];
  return Array.isArray(value) ? value : [];
}

function findByTag(nodes: XmlNode[], tag: string): XmlNode | undefined {
  return nodes.find((node) => tag in node);
}

function runProperties(run: XmlNode): { fontSize: number; isBold: boolean; isItalic: boolean } {
  const runChildren = childrenOf(run, "w:r");
  const propsNode = findByTag(runChildren, "w:rPr");
  const propsChildren = childrenOf(propsNode, "w:rPr");

  const isBold = propsChildren.some((child) => "w:b" in child);
  const isItalic = propsChildren.some((child) => "w:i" in child);

  const sizeNode = findByTag(propsChildren, "w:sz");
  const rawSize = sizeNode?.[":@"]?.["@_w:val"];
  const halfPoints = rawSize !== undefined ? Number(rawSize) : Number.NaN;

  return {
    fontSize: (Number.isFinite(halfPoints) ? halfPoints : DEFAULT_FONT_SIZE_HALF_POINTS) / 2,
    isBold,
    isItalic,
  };
}

function runText(run: XmlNode): string {
  const runChildren = childrenOf(run, "w:r");
  const textNode = findByTag(runChildren, "w:t");
  const textChildren = childrenOf(textNode, "w:t");
  const textLeaf = textChildren.find((child) => "#text" in child);
  const value = textLeaf?.["#text"];
  return typeof value === "string" ? value : "";
}

// One block per run -- WordprocessingML already segments text into runs
// by consistent formatting, the same granularity decision made for PDF
// text items. Nothing is merged into larger paragraphs here.
export function mapDocxParagraphs(paragraphs: XmlNode[]): LayoutTextBlock[] {
  const blocks: LayoutTextBlock[] = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const runs = childrenOf(paragraph, "w:p").filter((child) => "w:r" in child);

    runs.forEach((run, runIndex) => {
      const text = runText(run);
      if (!text.trim()) {
        return;
      }

      const { fontSize, isBold, isItalic } = runProperties(run);

      blocks.push({
        blockId: `p${paragraphIndex}-r${runIndex}`,
        fontSize,
        isBold,
        isItalic,
        page: 1,
        text,
        x: 0,
        y: 0,
      });
    });
  });

  return blocks;
}
