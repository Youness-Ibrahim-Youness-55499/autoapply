// Run: node supabase/functions/extract-cv/application/extractedField.fixtures.mjs

const url = new URL("./extractedField.ts", import.meta.url).href;
const { field, toSourceRef } = await import(url);

let pass = 0;
let fail = 0;

function assertEqual(label, actual, expected) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    pass++;
  } else {
    fail++;
    console.log(`FAIL: ${label}\n  expected: ${expectedStr}\n  actual:   ${actualStr}`);
  }
}

const block = { blockId: "b1", fontSize: 10, isBold: false, isItalic: false, page: 2, text: "Python", x: 12, y: 34 };

assertEqual("toSourceRef extracts position fields", toSourceRef(block), { blockId: "b1", page: 2, x: 12, y: 34 });

assertEqual("field: regex-exact is high confidence", field("Python", block, "regex-exact"), {
  confidence: "high",
  extractionMethod: "regex-exact",
  source: { blockId: "b1", page: 2, x: 12, y: 34 },
  value: "Python",
});

assertEqual("field: unmatched is low confidence", field("", block, "unmatched").confidence, "low");

assertEqual(
  "field: passes fuzzyScore through to confidenceForMethod",
  field("Python", block, "dictionary-fuzzy", { fuzzyScore: 0.9 }).confidence,
  "medium",
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
