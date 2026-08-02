// Run: node supabase/functions/extract-cv/application/sectionDetector.fixtures.mjs

const url = new URL("./sectionDetector.ts", import.meta.url).href;
const { detectSections } = await import(url);

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

function block(text, { fontSize = 10, isBold = false, isItalic = false, page = 1, x = 0, y = 0 } = {}, id) {
  return { blockId: id ?? text, fontSize, isBold, isItalic, page, text, x, y };
}

// --- a realistic single-column EN CV ---
const enCvBlocks = [
  block("John Doe", { fontSize: 20 }),
  block("Software Engineer", { fontSize: 12 }),
  block("Experience", { fontSize: 14 }),
  block("Acme Corp - Senior Developer", { fontSize: 10, isBold: true }),
  block("Jan 2020 - Present", { fontSize: 10 }),
  block("Built things.", { fontSize: 10 }),
  block("Education", { fontSize: 14 }),
  block("State University", { fontSize: 10, isBold: true }),
  block("Skills", { fontSize: 14 }),
  block("Python, TypeScript", { fontSize: 10 }),
];

const enResult = detectSections(enCvBlocks);
assertEqual("EN: preamble has name+title", enResult.preamble.map((b) => b.text), ["John Doe", "Software Engineer"]);
assertEqual("EN: three sections detected", enResult.sections.map((s) => s.key), ["experience", "education", "skills"]);
assertEqual("EN: no unmatched sections", enResult.unmatched.length, 0);
assertEqual("EN: experience section body excludes the header itself", enResult.sections[0].blocks.map((b) => b.text), [
  "Acme Corp - Senior Developer",
  "Jan 2020 - Present",
  "Built things.",
]);
assertEqual(
  "EN: bold same-size company line does not fragment the section",
  enResult.sections[0].blocks.some((b) => b.text === "Acme Corp - Senior Developer"),
  true,
);

// --- German headers ---
const deCvBlocks = [
  block("Jane Schmidt", { fontSize: 20 }),
  block("Berufserfahrung", { fontSize: 14 }),
  block("Firma GmbH", { fontSize: 10, isBold: true }),
  block("Jan 2020 - Heute", { fontSize: 10 }),
  block("Ausbildung", { fontSize: 14 }),
  block("Universität Berlin", { fontSize: 10 }),
  block("2016 - 2019", { fontSize: 10 }),
];
const deResult = detectSections(deCvBlocks);
assertEqual("DE: sections detected via German headers", deResult.sections.map((s) => s.key), [
  "experience",
  "education",
]);

// --- unknown/creative header ---
const creativeCvBlocks = [
  block("Alex Rivera", { fontSize: 20 }),
  block("My Journey So Far", { fontSize: 14 }),
  block("Started as an intern...", { fontSize: 10 }),
  block("Learned a lot along the way.", { fontSize: 10 }),
  block("Skills", { fontSize: 14 }),
  block("Go, Rust", { fontSize: 10 }),
];
const creativeResult = detectSections(creativeCvBlocks);
assertEqual("creative header: goes to unmatched, not dropped", creativeResult.unmatched.length, 1);
assertEqual("creative header: unmatched header text preserved", creativeResult.unmatched[0].headerBlock.text, "My Journey So Far");
assertEqual("creative header: unmatched body preserved", creativeResult.unmatched[0].blocks.map((b) => b.text), [
  "Started as an intern...",
  "Learned a lot along the way.",
]);
assertEqual("creative header: known section after it still detected", creativeResult.sections.map((s) => s.key), ["skills"]);

// --- no headers at all (every block same size) ---
const flatBlocks = [block("Just some text", { fontSize: 10 }), block("More text", { fontSize: 10 })];
const flatResult = detectSections(flatBlocks);
assertEqual("no headers: everything falls into preamble", flatResult.preamble.length, 2);
assertEqual("no headers: no sections detected", flatResult.sections.length, 0);
assertEqual("no headers: no unmatched sections", flatResult.unmatched.length, 0);

// --- empty input ---
const emptyResult = detectSections([]);
assertEqual("empty input: empty preamble", emptyResult.preamble, []);
assertEqual("empty input: no sections", emptyResult.sections, []);

// --- a long, larger-font sentence is not mistaken for a header ---
const longSentenceBlocks = [
  block("Some intro line.", { fontSize: 10 }),
  block("Another body line.", { fontSize: 10 }),
  block(
    "This is a much longer sentence that happens to be rendered in a larger font size but is clearly not a section header by any reasonable reading",
    { fontSize: 14 },
  ),
  block("Skills", { fontSize: 14 }),
  block("Java", { fontSize: 10 }),
  block("Python", { fontSize: 10 }),
];
const longSentenceResult = detectSections(longSentenceBlocks);
assertEqual("long large-font sentence stays out of section detection (goes to preamble)", longSentenceResult.preamble.length, 3);
assertEqual("long sentence: real header after it still detected", longSentenceResult.sections.map((s) => s.key), ["skills"]);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
