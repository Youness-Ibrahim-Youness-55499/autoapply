// Ad-hoc fixture verification for rules.ts. There's no test framework in
// this repo yet, so this runs via Node's native TS execution instead:
//
//   node supabase/functions/extract-cv/domain/rules.fixtures.mjs
//
// This file itself is plain JS (no TS syntax) so it runs on any Node
// version; only the import target (rules.ts) relies on type stripping.

const rulesUrl = new URL("./rules.ts", import.meta.url).href;

const {
  confidenceForMethod,
  computeNeedsReview,
  isOngoingToken,
  normalizeForMatch,
  parseDateRange,
  parseDateToken,
  similarityRatio,
} = await import(rulesUrl);

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

// --- parseDateToken ---
assertEqual("token: named month EN", parseDateToken("Jan 2020"), "2020-01");
assertEqual("token: named month EN long", parseDateToken("January 2020"), "2020-01");
assertEqual("token: named month DE", parseDateToken("März 2021"), "2021-03");
assertEqual("token: named month DE folded", parseDateToken("Marz 2021"), "2021-03");
assertEqual("token: named month DE long", parseDateToken("Dezember 2019"), "2019-12");
assertEqual("token: numeric slash", parseDateToken("01/2020"), "2020-01");
assertEqual("token: numeric dot", parseDateToken("06.2019"), "2019-06");
assertEqual("token: iso passthrough", parseDateToken("2020-01"), "2020-01");
assertEqual("token: year only", parseDateToken("2022"), "2022");
assertEqual("token: garbage", parseDateToken("Q3 whenever"), null);
assertEqual("token: empty", parseDateToken(""), null);
assertEqual("token: invalid month number", parseDateToken("13/2020"), null);

// --- isOngoingToken ---
assertEqual("ongoing: present", isOngoingToken("Present"), true);
assertEqual("ongoing: heute", isOngoingToken("Heute"), true);
assertEqual("ongoing: aktuell", isOngoingToken(" aktuell "), true);
assertEqual("ongoing: not ongoing", isOngoingToken("March 2020"), false);

// --- parseDateRange ---
assertEqual("range: named EN to present", parseDateRange("Jan 2020 - Present"), {
  end: null,
  isCurrent: true,
  start: "2020-01",
});
assertEqual("range: en dash long names", parseDateRange("January 2020 – March 2022"), {
  end: "2022-03",
  isCurrent: false,
  start: "2020-01",
});
assertEqual("range: em dash numeric", parseDateRange("01/2019 — 03/2021"), {
  end: "2021-03",
  isCurrent: false,
  start: "2019-01",
});
assertEqual("range: bare years", parseDateRange("2020-2022"), {
  end: "2022",
  isCurrent: false,
  start: "2020",
});
assertEqual("range: year to present", parseDateRange("2020 - Present"), {
  end: null,
  isCurrent: true,
  start: "2020",
});
assertEqual("range: german heute", parseDateRange("März 2021 – Heute"), {
  end: null,
  isCurrent: true,
  start: "2021-03",
});
assertEqual("range: to keyword", parseDateRange("Jan 2018 to Dec 2019"), {
  end: "2019-12",
  isCurrent: false,
  start: "2018-01",
});
assertEqual("range: bis keyword", parseDateRange("06.2019 bis 09.2021"), {
  end: "2021-09",
  isCurrent: false,
  start: "2019-06",
});
assertEqual("range: single ongoing token", parseDateRange("Present"), {
  end: null,
  isCurrent: true,
  start: null,
});
assertEqual("range: single unparseable", parseDateRange("sometime last year"), {
  end: null,
  isCurrent: false,
  start: null,
});
assertEqual("range: empty", parseDateRange(""), { end: null, isCurrent: false, start: null });
assertEqual("range: three parts is ambiguous", parseDateRange("2019 - 2020 - 2021"), {
  end: null,
  isCurrent: false,
  start: null,
});

// --- confidenceForMethod ---
assertEqual("confidence: regex-exact", confidenceForMethod("regex-exact"), "high");
assertEqual("confidence: dictionary-exact", confidenceForMethod("dictionary-exact"), "high");
assertEqual("confidence: layout-heuristic", confidenceForMethod("layout-heuristic"), "medium");
assertEqual(
  "confidence: fuzzy high score",
  confidenceForMethod("dictionary-fuzzy", { fuzzyScore: 0.9 }),
  "medium",
);
assertEqual(
  "confidence: fuzzy low score",
  confidenceForMethod("regex-fuzzy", { fuzzyScore: 0.4 }),
  "low",
);
assertEqual(
  "confidence: fuzzy no score given",
  confidenceForMethod("dictionary-fuzzy"),
  "low",
);
assertEqual("confidence: unmatched", confidenceForMethod("unmatched"), "low");

// --- computeNeedsReview ---
function field(value, confidence) {
  return {
    confidence,
    extractionMethod: "regex-exact",
    source: { blockId: "b1", page: 1, x: 0, y: 0 },
    value,
  };
}

const highConfidenceCv = {
  contact: { email: field("a@b.com", "high"), links: [], phone: null },
  education: [],
  experience: [
    {
      bullets: [],
      company: field("Acme", "high"),
      endDate: field(null, "high"),
      isCurrent: true,
      role: field("Engineer", "high"),
      startDate: field("2020-01", "high"),
    },
  ],
  needsReview: false,
  skills: [field("TypeScript", "medium")],
  unmatchedSections: [],
};
assertEqual("needsReview: all high/medium -> false", computeNeedsReview(highConfidenceCv), false);

const lowConfidenceCv = {
  ...highConfidenceCv,
  skills: [field("Mystery Skill", "low")],
};
assertEqual("needsReview: one low field -> true", computeNeedsReview(lowConfidenceCv), true);

const unmatchedSectionCv = {
  ...highConfidenceCv,
  unmatchedSections: [{ header: "Hobbies", rawText: "..." }],
};
assertEqual(
  "needsReview: unmatched section -> true",
  computeNeedsReview(unmatchedSectionCv),
  true,
);

// --- normalizeForMatch ---
assertEqual("normalize: case+trim", normalizeForMatch("  Berufserfahrung  "), "berufserfahrung");
assertEqual("normalize: umlaut folding", normalizeForMatch("Ausbildung"), "ausbildung");
assertEqual("normalize: collapses internal whitespace", normalizeForMatch("Work   History"), "work history");
assertEqual("normalize: folds ß", normalizeForMatch("Straße"), "strasse");

// --- similarityRatio ---
assertEqual("similarity: identical strings", similarityRatio("python", "python"), 1);
assertEqual("similarity: completely different, same length", similarityRatio("abc", "xyz"), 0);
assertEqual("similarity: one-char typo", Math.round(similarityRatio("javscript", "javascript") * 100) / 100, 0.9);
assertEqual("similarity: empty vs empty", similarityRatio("", ""), 1);
assertEqual("similarity: empty vs non-empty", similarityRatio("", "abc"), 0);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
