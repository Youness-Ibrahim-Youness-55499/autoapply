// Ad-hoc fixture verification for pdfTextMapper.ts. Run:
//
//   node supabase/functions/extract-cv/infrastructure/pdfTextMapper.fixtures.mjs
//
// The realCapture fixture below is not synthetic -- it's the actual
// content.items/content.styles output from running pdfjs-dist 6.2.108
// (legacy Node build) against a handcrafted single-page PDF with two
// fonts (one named Helvetica-Bold) and four text lines at different
// sizes. Captured once via a throwaway scratch script since this project
// has no Deno CLI to test pdfParser.ts's real npm:-specifier import path,
// so this is the strongest available verification that the mapping logic
// matches pdfjs's real output shape.

const mapperUrl = new URL("./pdfTextMapper.ts", import.meta.url).href;
const { looksBold, looksItalic, mapPdfTextItems } = await import(mapperUrl);

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

// --- looksBold / looksItalic ---
assertEqual("bold: matches Bold", looksBold("Helvetica-Bold"), true);
assertEqual("bold: matches Black", looksBold("Roboto Black"), true);
assertEqual("bold: generic fallback -> false", looksBold("sans-serif"), false);
assertEqual("italic: matches Italic", looksItalic("Times-Italic"), true);
assertEqual("italic: matches Oblique", looksItalic("Arial-Oblique"), true);
assertEqual("italic: generic fallback -> false", looksItalic("serif"), false);

// --- real pdfjs-dist 6.2.108 capture (see file header) ---
const realCaptureItems = [
  { str: "John Doe", transform: [18, 0, 0, 18, 72, 700], fontName: "g_d0_f1", height: 18 },
  { str: "", transform: [11, 0, 0, 11, 72, 680], fontName: "g_d0_f2", height: 0 },
  { str: "Software Engineer", transform: [11, 0, 0, 11, 72, 680], fontName: "g_d0_f2", height: 11 },
  { str: "", transform: [14, 0, 0, 14, 72, 640], fontName: "g_d0_f1", height: 0 },
  { str: "Experience", transform: [14, 0, 0, 14, 72, 640], fontName: "g_d0_f1", height: 14 },
  { str: "", transform: [10, 0, 0, 10, 72, 620], fontName: "g_d0_f2", height: 0 },
  {
    str: "Acme Corp - Senior Developer",
    transform: [10, 0, 0, 10, 72, 620],
    fontName: "g_d0_f2",
    height: 10,
  },
];
const realCaptureStyles = {
  g_d0_f1: { fontFamily: "sans-serif" },
  g_d0_f2: { fontFamily: "sans-serif" },
};

const realBlocks = mapPdfTextItems(realCaptureItems, realCaptureStyles, 1);

assertEqual("real capture: drops zero-height placeholder items", realBlocks.length, 4);
assertEqual("real capture: first block", realBlocks[0], {
  blockId: "p1-b0",
  fontSize: 18,
  isBold: false,
  isItalic: false,
  page: 1,
  text: "John Doe",
  x: 72,
  y: 700,
});
assertEqual("real capture: last block position+size", {
  fontSize: realBlocks[3].fontSize,
  text: realBlocks[3].text,
  x: realBlocks[3].x,
  y: realBlocks[3].y,
}, {
  fontSize: 10,
  text: "Acme Corp - Senior Developer",
  x: 72,
  y: 620,
});
assertEqual(
  "real capture: standard fonts never look bold (documented limitation)",
  realBlocks.every((block) => !block.isBold),
  true,
);

// --- synthetic edge cases ---
assertEqual("empty items -> empty blocks", mapPdfTextItems([], {}, 1), []);

assertEqual(
  "whitespace-only text is dropped",
  mapPdfTextItems([{ str: "   ", transform: [10, 0, 0, 10, 0, 0], fontName: "f1", height: 10 }], {}, 1),
  [],
);

assertEqual(
  "missing style entry defaults to non-bold/non-italic",
  mapPdfTextItems(
    [{ str: "Hello", transform: [12, 0, 0, 12, 5, 5], fontName: "unknown-font", height: 12 }],
    {},
    2,
  ),
  [
    {
      blockId: "p2-b0",
      fontSize: 12,
      isBold: false,
      isItalic: false,
      page: 2,
      text: "Hello",
      x: 5,
      y: 5,
    },
  ],
);

assertEqual(
  "embedded bold font name is detected",
  mapPdfTextItems(
    [{ str: "Jane Smith", transform: [16, 0, 0, 16, 72, 700], fontName: "f1", height: 16 }],
    { f1: { fontFamily: "ArialMT-Bold" } },
    1,
  )[0].isBold,
  true,
);

assertEqual(
  "blockIndex increments only for kept blocks",
  mapPdfTextItems(
    [
      { str: "", transform: [10, 0, 0, 10, 0, 0], fontName: "f1", height: 0 },
      { str: "A", transform: [10, 0, 0, 10, 0, 0], fontName: "f1", height: 10 },
      { str: "B", transform: [10, 0, 0, 10, 0, 10], fontName: "f1", height: 10 },
    ],
    {},
    3,
  ).map((block) => block.blockId),
  ["p3-b0", "p3-b1"],
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
