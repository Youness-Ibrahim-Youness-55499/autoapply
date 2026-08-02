// Run: node supabase/functions/extract-cv/infrastructure/sectionDictionary.fixtures.mjs

const url = new URL("./sectionDictionary.ts", import.meta.url).href;
const { matchSectionHeader } = await import(url);

let pass = 0;
let fail = 0;

function assertEqual(label, actual, expected) {
  if (actual === expected) {
    pass++;
  } else {
    fail++;
    console.log(`FAIL: ${label}\n  expected: ${expected}\n  actual:   ${actual}`);
  }
}

assertEqual("EN experience", matchSectionHeader("Experience"), "experience");
assertEqual("EN work experience", matchSectionHeader("Work Experience"), "experience");
assertEqual("DE experience", matchSectionHeader("Berufserfahrung"), "experience");
assertEqual("DE experience, extra whitespace+case", matchSectionHeader("  berufserfahrung  "), "experience");
assertEqual("EN education", matchSectionHeader("Education"), "education");
assertEqual("DE education", matchSectionHeader("Ausbildung"), "education");
assertEqual("EN skills", matchSectionHeader("Skills"), "skills");
assertEqual("DE skills with umlaut", matchSectionHeader("Fähigkeiten"), "skills");
assertEqual("DE summary with umlaut", matchSectionHeader("Über mich"), "summary");
assertEqual("EN languages", matchSectionHeader("Languages"), "languages");
assertEqual("DE contact", matchSectionHeader("Kontakt"), "contact");
assertEqual("unknown/creative header -> null", matchSectionHeader("My Journey So Far"), null);
assertEqual("body text, not a header -> null", matchSectionHeader("I led a team of five engineers."), null);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
