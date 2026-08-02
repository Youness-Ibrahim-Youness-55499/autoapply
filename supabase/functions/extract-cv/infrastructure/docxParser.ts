// DOCX layout extraction. This project has no Python anywhere, so
// python-docx (the originally scoped library) isn't usable. A .docx file
// is a ZIP of XML parts, so this uses fflate (ZIP) + fast-xml-parser
// (WordprocessingML) instead -- both plain JS with no native bindings,
// so they run under Deno via the npm: specifier the same as under Node.
//
// Versions pinned to what the navigation logic and the pure mapper it
// delegates to (docxTextMapper.ts) were verified against, via a real
// generated .docx run through the same fflate + fast-xml-parser calls
// under Node (see docxTextMapper.fixtures.mjs and the scratch
// verification in this phase's commit message) -- no Deno CLI is
// available in this environment to test the actual npm:-specifier import
// path end to end.
import { strFromU8, unzipSync } from "npm:fflate@0.8.2";
import { XMLParser } from "npm:fast-xml-parser@4.5.1";
import type { LayoutTextBlock } from "./layout.ts";
import { mapDocxParagraphs, type XmlNode } from "./docxTextMapper.ts";

const parser = new XMLParser({
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
  preserveOrder: true,
});

export function extractDocxLayout(bytes: Uint8Array): LayoutTextBlock[] {
  const files = unzipSync(bytes);
  const documentXml = files["word/document.xml"];

  if (!documentXml) {
    throw new Error("Not a valid DOCX file: missing word/document.xml.");
  }

  const parsed = parser.parse(strFromU8(documentXml)) as XmlNode[];
  const documentNode = parsed.find((node) => "w:document" in node);
  const bodyChildren = (documentNode?.["w:document"] as XmlNode[] | undefined) ?? [];
  const bodyNode = bodyChildren.find((node) => "w:body" in node);
  const bodyContent = (bodyNode?.["w:body"] as XmlNode[] | undefined) ?? [];
  const paragraphs = bodyContent.filter((node) => "w:p" in node);

  return mapDocxParagraphs(paragraphs);
}
