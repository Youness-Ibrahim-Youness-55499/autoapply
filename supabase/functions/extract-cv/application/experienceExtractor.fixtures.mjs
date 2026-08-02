// Run: node supabase/functions/extract-cv/application/experienceExtractor.fixtures.mjs

const url = new URL("./experienceExtractor.ts", import.meta.url).href;
const { extractExperience } = await import(url);

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

function block(text, opts = {}, id = text) {
  return { blockId: id, fontSize: 10, isBold: false, isItalic: false, page: 1, text, x: 0, y: 0, ...opts };
}

// --- two-line header distinguished by font size ---
const bySize = extractExperience([
  block("Senior Developer", { fontSize: 13 }, "role"),
  block("Acme Corp", { fontSize: 10 }, "company"),
  block("Jan 2020 - Present", {}, "date"),
  block("Shipped things.", {}, "bullet1"),
]);
assertEqual("bySize: one entry", bySize.length, 1);
assertEqual("bySize: role from larger line", bySize[0].role.value, "Senior Developer");
assertEqual("bySize: company from smaller line", bySize[0].company.value, "Acme Corp");
assertEqual("bySize: role/company method is layout-heuristic", bySize[0].role.extractionMethod, "layout-heuristic");
assertEqual("bySize: dates parsed", { start: bySize[0].startDate.value, end: bySize[0].endDate.value, current: bySize[0].isCurrent }, {
  start: "2020-01",
  end: null,
  current: true,
});
assertEqual("bySize: date confidence high", bySize[0].startDate.confidence, "high");
assertEqual("bySize: bullet captured", bySize[0].bullets.map((b) => b.value), ["Shipped things."]);

// --- two-line header distinguished by bold, same size ---
const byBold = extractExperience([
  block("Product Designer", { isBold: true }, "role"),
  block("Daylight Studio", { isBold: false }, "company"),
  block("2019 - 2021", {}, "date"),
]);
assertEqual("byBold: role from bold line", byBold[0].role.value, "Product Designer");
assertEqual("byBold: company from non-bold line", byBold[0].company.value, "Daylight Studio");

// --- fully indeterminate two-line header (same size, same boldness) ---
const indeterminate = extractExperience([
  block("Line One", {}, "l1"),
  block("Line Two", {}, "l2"),
  block("2018 - 2019", {}, "date"),
]);
assertEqual("indeterminate: method is unmatched", indeterminate[0].role.extractionMethod, "unmatched");
assertEqual("indeterminate: confidence is low", indeterminate[0].role.confidence, "low");

// --- single combined line: "Role - Company" ---
const combinedDash = extractExperience([
  block("Backend Engineer - Voltiq", {}, "combined"),
  block("2021 - 2022", {}, "date"),
]);
assertEqual("combinedDash: role", combinedDash[0].role.value, "Backend Engineer");
assertEqual("combinedDash: company", combinedDash[0].company.value, "Voltiq");
assertEqual("combinedDash: method is regex-exact", combinedDash[0].role.extractionMethod, "regex-exact");

// --- single combined line: "Role at Company" ---
const combinedAt = extractExperience([
  block("Data Scientist at Kestrel", {}, "combined"),
  block("2022 - Present", {}, "date"),
]);
assertEqual("combinedAt: role", combinedAt[0].role.value, "Data Scientist");
assertEqual("combinedAt: company", combinedAt[0].company.value, "Kestrel");

// --- single combined line: "Role, Company" ---
const combinedComma = extractExperience([
  block("Product Manager, Reef Labs", {}, "combined"),
  block("2019 - 2021", {}, "date"),
]);
assertEqual("combinedComma: role", combinedComma[0].role.value, "Product Manager");
assertEqual("combinedComma: company", combinedComma[0].company.value, "Reef Labs");

// --- single combined line: German "Rolle bei Firma" ---
const combinedBei = extractExperience([
  block("Softwareentwicklerin bei Firma GmbH", {}, "combined"),
  block("Jan 2019 - Heute", {}, "date"),
]);
assertEqual("combinedBei: role", combinedBei[0].role.value, "Softwareentwicklerin");
assertEqual("combinedBei: company", combinedBei[0].company.value, "Firma GmbH");
assertEqual("combinedBei: Heute recognized as ongoing", combinedBei[0].isCurrent, true);

// --- single line, no separator: ambiguous ---
const ambiguous = extractExperience([
  block("Full Stack Engineer", {}, "combined"),
  block("2020 - 2021", {}, "date"),
]);
assertEqual("ambiguous: whole line kept as role", ambiguous[0].role.value, "Full Stack Engineer");
assertEqual("ambiguous: company left unresolved", ambiguous[0].company.value, "");
assertEqual("ambiguous: company confidence low", ambiguous[0].company.confidence, "low");

// --- two entries in sequence: bullets correctly attributed ---
const twoEntries = extractExperience([
  block("Senior Developer", { fontSize: 13 }, "role1"),
  block("Acme Corp", {}, "company1"),
  block("2020 - 2022", {}, "date1"),
  block("Did thing A.", {}, "b1"),
  block("Did thing B.", {}, "b2"),
  block("Backend Engineer", { fontSize: 13 }, "role2"),
  block("Voltiq", {}, "company2"),
  block("2022 - Present", {}, "date2"),
  block("Did thing C.", {}, "b3"),
]);
assertEqual("twoEntries: two entries found", twoEntries.length, 2);
assertEqual("twoEntries: first entry role", twoEntries[0].role.value, "Senior Developer");
assertEqual("twoEntries: first entry bullets, not bleeding into second header", twoEntries[0].bullets.map((b) => b.value), [
  "Did thing A.",
  "Did thing B.",
]);
assertEqual("twoEntries: second entry role", twoEntries[1].role.value, "Backend Engineer");
assertEqual("twoEntries: second entry company", twoEntries[1].company.value, "Voltiq");
assertEqual("twoEntries: second entry trailing bullet", twoEntries[1].bullets.map((b) => b.value), ["Did thing C."]);

// --- no date line anywhere: unsegmented fallback ---
const noDate = extractExperience([
  block("Some Role", {}, "r"),
  block("Some Company", {}, "c"),
  block("Did stuff.", {}, "b"),
]);
assertEqual("noDate: single fallback entry", noDate.length, 1);
assertEqual("noDate: role is the first line", noDate[0].role.value, "Some Role");
assertEqual("noDate: role confidence not high (heuristic fallback)", noDate[0].role.confidence !== "high", true);
assertEqual("noDate: dates unresolved", { start: noDate[0].startDate.value, end: noDate[0].endDate.value }, {
  start: null,
  end: null,
});

// --- empty input ---
assertEqual("empty input -> no entries", extractExperience([]), []);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
