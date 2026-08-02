// Ad-hoc fixture verification for docxTextMapper.ts. Run:
//
//   node supabase/functions/extract-cv/infrastructure/docxTextMapper.fixtures.mjs
//
// realCaptureParagraphs below is not synthetic -- it's the actual parsed
// output of running fast-xml-parser (preserveOrder, attributeNamePrefix
// "@_") against word/document.xml from a handcrafted, real .docx (a real
// ZIP built with fflate, unzipped with fflate) containing bold/italic/
// sized runs across five paragraphs, one with two runs, one with an empty
// <w:t></w:t>. Captured once via a throwaway scratch script since this
// project has no Deno CLI to test docxParser.ts's real ZIP+XML wrapper
// end to end, so this is the strongest available verification that the
// mapping logic matches the parser's real output shape.

const mapperUrl = new URL("./docxTextMapper.ts", import.meta.url).href;
const { mapDocxParagraphs } = await import(mapperUrl);

let pass = 0;
let fail = 0;

function assertEqual(label, actual, expected) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    pass++;
  } else {
    fail++;
    console.log(`FAIL: ${label}`);
    console.log(`  expected: ${expectedStr}`);
    console.log(`  actual:   ${actualStr}`);
  }
}

// --- real fast-xml-parser capture (see file header) ---
const realCaptureParagraphs = [
  { "w:p": [{ "w:r": [{ "w:rPr": [{ "w:b": [] }, { "w:sz": [], ":@": { "@_w:val": "36" } }] }, { "w:t": [{ "#text": "John Doe" }] }] }] },
  { "w:p": [{ "w:r": [{ "w:rPr": [{ "w:sz": [], ":@": { "@_w:val": "22" } }] }, { "w:t": [{ "#text": "Software Engineer" }] }] }] },
  { "w:p": [{ "w:r": [{ "w:rPr": [{ "w:b": [] }, { "w:sz": [], ":@": { "@_w:val": "28" } }] }, { "w:t": [{ "#text": "Experience" }] }] }] },
  {
    "w:p": [
      { "w:r": [{ "w:rPr": [{ "w:i": [] }, { "w:sz": [], ":@": { "@_w:val": "20" } }] }, { "w:t": [{ "#text": "Acme Corp - Senior Developer" }] }] },
      { "w:r": [{ "w:rPr": [{ "w:sz": [], ":@": { "@_w:val": "20" } }] }, { "w:t": [{ "#text": ", remote" }], ":@": { "@_xml:space": "preserve" } }] },
    ],
  },
  { "w:p": [{ "w:r": [{ "w:rPr": [{ "w:sz": [], ":@": { "@_w:val": "20" } }] }, { "w:t": [] }] }] },
];

const realBlocks = mapDocxParagraphs(realCaptureParagraphs);

assertEqual("real capture: drops the empty <w:t></w:t> paragraph", realBlocks.length, 5);
assertEqual("real capture: bold heading, half-points converted to points", realBlocks[0], {
  blockId: "p0-r0",
  fontSize: 18,
  isBold: true,
  isItalic: false,
  page: 1,
  text: "John Doe",
  x: 0,
  y: 0,
});
assertEqual("real capture: plain run", realBlocks[1], {
  blockId: "p1-r0",
  fontSize: 11,
  isBold: false,
  isItalic: false,
  page: 1,
  text: "Software Engineer",
  x: 0,
  y: 0,
});
assertEqual("real capture: italic run", {
  fontSize: realBlocks[3].fontSize,
  isBold: realBlocks[3].isBold,
  isItalic: realBlocks[3].isItalic,
  text: realBlocks[3].text,
}, {
  fontSize: 10,
  isBold: false,
  isItalic: true,
  text: "Acme Corp - Senior Developer",
});
assertEqual("real capture: two runs in one paragraph get distinct blockIds", [
  realBlocks[3].blockId,
  realBlocks[4].blockId,
], ["p3-r0", "p3-r1"]);
assertEqual("real capture: second run in the paragraph", realBlocks[4].text, ", remote");

// --- synthetic edge cases ---
assertEqual("empty paragraph list -> empty blocks", mapDocxParagraphs([]), []);

assertEqual(
  "paragraph with no runs -> no blocks",
  mapDocxParagraphs([{ "w:p": [] }]),
  [],
);

assertEqual(
  "whitespace-only text is dropped",
  mapDocxParagraphs([{ "w:p": [{ "w:r": [{ "w:t": [{ "#text": "   " }] }] }] }]),
  [],
);

assertEqual(
  "missing w:sz falls back to the default body size (11pt)",
  mapDocxParagraphs([{ "w:p": [{ "w:r": [{ "w:t": [{ "#text": "No size set" }] }] }] }])[0].fontSize,
  11,
);

assertEqual(
  "missing w:rPr entirely is treated as non-bold/non-italic default size",
  mapDocxParagraphs([{ "w:p": [{ "w:r": [{ "w:t": [{ "#text": "Plain" }] }] }] }])[0],
  {
    blockId: "p0-r0",
    fontSize: 11,
    isBold: false,
    isItalic: false,
    page: 1,
    text: "Plain",
    x: 0,
    y: 0,
  },
);

assertEqual(
  "bold and italic together",
  (() => {
    const result = mapDocxParagraphs([
      { "w:p": [{ "w:r": [{ "w:rPr": [{ "w:b": [] }, { "w:i": [] }] }, { "w:t": [{ "#text": "Both" }] }] }] },
    ])[0];
    return { isBold: result.isBold, isItalic: result.isItalic };
  })(),
  { isBold: true, isItalic: true },
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
