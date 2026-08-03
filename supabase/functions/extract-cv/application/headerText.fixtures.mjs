// Run: node supabase/functions/extract-cv/application/headerText.fixtures.mjs

const url = new URL("./headerText.ts", import.meta.url).href;
const { joinWrappedText, looksLikeWrapContinuation } = await import(url);

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

// --- looksLikeWrapContinuation ---
assertEqual(
  "trailing comma looks like a wrap",
  looksLikeWrapContinuation("Master Thesis Embedded Functional Safety, Continental AG, Ingolstadt,"),
  true,
);
assertEqual("trailing hyphen looks like a wrap", looksLikeWrapContinuation("Technische Hochschule In-"), true);
assertEqual(
  "trailing conjunction looks like a wrap",
  looksLikeWrapContinuation("Misr University For Science and"),
  true,
);
assertEqual("a complete standalone line does not look like a wrap", looksLikeWrapContinuation("Senior Developer"), false);
assertEqual(
  "a complete line ending in a period does not look like a wrap",
  looksLikeWrapContinuation("Development Engineer, KPIT Technologies GmbH, Ingolstadt, Germany."),
  false,
);

// --- joinWrappedText ---
assertEqual(
  "comma-ending join adds a space",
  joinWrappedText("Master Thesis Embedded Functional Safety, Continental AG, Ingolstadt,", "Germany."),
  "Master Thesis Embedded Functional Safety, Continental AG, Ingolstadt, Germany.",
);
assertEqual(
  "hyphen-ending join drops the hyphen and adds no space",
  joinWrappedText("Technische Hochschule In-", "golstadt, Germany."),
  "Technische Hochschule Ingolstadt, Germany.",
);
assertEqual(
  "hyphen-ending join with a word-wrapped company name",
  joinWrappedText("Working Student Embedded Systems, EDAG Engineering GmbH, Ingol-", "stadt, Germany."),
  "Working Student Embedded Systems, EDAG Engineering GmbH, Ingolstadt, Germany.",
);
assertEqual(
  "conjunction-ending join adds a space",
  joinWrappedText("Misr University For Science and", "Technology, Egypt."),
  "Misr University For Science and Technology, Egypt.",
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
