// Run: node supabase/functions/extract-cv/application/skillExtractor.fixtures.mjs

const url = new URL("./skillExtractor.ts", import.meta.url).href;
const { extractSkills } = await import(url);

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

function block(text, id = text) {
  return { blockId: id, fontSize: 10, isBold: false, isItalic: false, page: 1, text, x: 0, y: 0 };
}

const commaSeparated = extractSkills([block("Python, TypeScript, React")]);
assertEqual("comma-separated skills all matched", commaSeparated.map((s) => s.value), [
  "Python",
  "TypeScript",
  "React",
]);
assertEqual("exact matches are high confidence", commaSeparated.every((s) => s.confidence === "high"), true);
assertEqual(
  "exact matches use dictionary-exact",
  commaSeparated.every((s) => s.extractionMethod === "dictionary-exact"),
  true,
);

assertEqual(
  "alias resolves to canonical name",
  extractSkills([block("JS, k8s, node")]).map((s) => s.value),
  ["JavaScript", "Kubernetes", "Node.js"],
);

assertEqual(
  "bullet and pipe separated",
  extractSkills([block("Python • Go | Rust")]).map((s) => s.value),
  ["Python", "Go", "Rust"],
);

const typo = extractSkills([block("Javscript")]);
assertEqual("close typo resolves via fuzzy match", typo[0]?.value, "JavaScript");
assertEqual("fuzzy match confidence is not high", typo[0]?.confidence !== "high", true);
assertEqual("fuzzy match uses dictionary-fuzzy", typo[0]?.extractionMethod, "dictionary-fuzzy");

assertEqual(
  "unrelated word is not force-matched",
  extractSkills([block("Baking sourdough bread")]),
  [],
);

assertEqual(
  "duplicate mentions across blocks are deduped",
  extractSkills([block("Python", "b1"), block("Python", "b2")]).length,
  1,
);
assertEqual(
  "duplicate mention within the dictionary's own token boundary is deduped",
  extractSkills([block("Python, Python")]).length,
  1,
);

assertEqual("empty input -> empty result", extractSkills([]), []);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
