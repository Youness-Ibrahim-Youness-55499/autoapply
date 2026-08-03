// Run: node supabase/functions/extract-cv/application/entryBoundaries.fixtures.mjs

const url = new URL("./entryBoundaries.ts", import.meta.url).href;
const { boundarySpan, findEntryBoundaries, isBulletLine } = await import(url);

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

function block(text) {
  return { blockId: text, fontSize: 10, isBold: false, isItalic: false, page: 1, text, x: 0, y: 0 };
}

// --- isBulletLine ---
assertEqual("bullet: dot marker", isBulletLine("• Did a thing"), true);
assertEqual("bullet: dash marker", isBulletLine("- Did a thing"), true);
assertEqual("bullet: asterisk marker", isBulletLine("* Did a thing"), true);
assertEqual("bullet: plain text is not a bullet", isBulletLine("Senior Developer"), false);
assertEqual("bullet: a real date range is not a bullet", isBulletLine("2020 - 2022"), false);

// --- header BEFORE the date (existing convention) ---
const headerBefore = [
  block("Senior Developer"),
  block("Acme Corp"),
  block("2020 - 2022"),
  block("• Did a thing"),
];
const beforeBoundaries = findEntryBoundaries(headerBefore);
assertEqual("header-before: one boundary found", beforeBoundaries.length, 1);
assertEqual("header-before: header attached before the date", beforeBoundaries[0].headerIndices, [0, 1]);
assertEqual("header-before: span covers header + date", boundarySpan(beforeBoundaries[0]), { end: 2, start: 0 });

// --- header AFTER the date (the real-CV pattern this was built to fix) ---
const headerAfter = [
  block("2024 - Present"),
  block("Development Engineer, Example Corp, Some City, Country."),
  block("• Did a thing"),
  block("• Did another thing"),
];
const afterBoundaries = findEntryBoundaries(headerAfter);
assertEqual("header-after: one boundary found", afterBoundaries.length, 1);
assertEqual("header-after: header attached after the date", afterBoundaries[0].headerIndices, [1]);
assertEqual("header-after: span covers date + header", boundarySpan(afterBoundaries[0]), { end: 1, start: 0 });

// --- bullet immediately before a date does not get grabbed as a header ---
// This is the exact real bug: without the bullet check, scanning
// backward from the second date would land on "• Did the first thing"
// (the first entry's trailing bullet) and misread it as the second
// entry's header.
const bulletBeforeNextDate = [
  block("2020 - 2021"),
  block("First Role, First Corp."),
  block("• Did the first thing"),
  block("2021 - 2022"),
  block("Second Role, Second Corp."),
  block("• Did the second thing"),
];
const mixedBoundaries = findEntryBoundaries(bulletBeforeNextDate);
assertEqual("mixed: two boundaries found", mixedBoundaries.length, 2);
assertEqual("mixed: first entry header is after its date", mixedBoundaries[0].headerIndices, [1]);
assertEqual(
  "mixed: second entry header is after its date too, not the first entry's bullet",
  mixedBoundaries[1].headerIndices,
  [4],
);

// --- a document that mixes both conventions across entries ---
// Confirmed necessary against a real CV: Education used "header, then
// date" while Experience used "date, then header," in the same file.
const mixedConventions = [
  block("State University"),
  block("2016 - 2020"),
  block("2020 - 2022"),
  block("Software Engineer, Example Inc."),
];
const mixedConventionBoundaries = findEntryBoundaries(mixedConventions);
assertEqual("mixed conventions: two boundaries found", mixedConventionBoundaries.length, 2);
assertEqual("mixed conventions: first uses header-before", mixedConventionBoundaries[0].headerIndices, [0]);
assertEqual("mixed conventions: second uses header-after", mixedConventionBoundaries[1].headerIndices, [3]);

// --- a wrapped bullet continuation (no marker) is not mistaken for the
// next entry's header ---
// The exact real bug: a bullet's text wrapped onto a second visual line
// ("...DOORS," then "Git." on its own line, no marker on the
// continuation). Scanning backward from the next date used to land on
// "Git." and misread it as that entry's role/company.
const wrappedBulletTail = [
  block("2023 - 2024"),
  block("First Role, First Corp."),
  block("• Tools: A, B, C,"),
  block("Git."),
  block("2024 - 2025"),
  block("Second Role, Second Corp."),
  block("• Did the second thing"),
];
const wrappedTailBoundaries = findEntryBoundaries(wrappedBulletTail);
assertEqual("wrapped tail: two boundaries found", wrappedTailBoundaries.length, 2);
assertEqual(
  "wrapped tail: second entry's header is its own line, not the wrapped bullet tail",
  wrappedTailBoundaries[1].headerIndices,
  [5],
);

// --- no header available on either side ---
const noHeaderAvailable = [block("2020 - 2021"), block("• Just a bullet")];
const noHeaderBoundaries = findEntryBoundaries(noHeaderAvailable);
assertEqual("no header available: header indices empty, not a bullet mistaken for one", noHeaderBoundaries[0].headerIndices, []);

// --- empty input ---
assertEqual("empty input -> no boundaries", findEntryBoundaries([]), []);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
