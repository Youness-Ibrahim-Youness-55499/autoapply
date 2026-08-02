// Run: node supabase/functions/extract-cv/application/educationExtractor.fixtures.mjs

const url = new URL("./educationExtractor.ts", import.meta.url).href;
const { extractEducation } = await import(url);

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

// --- two header lines, degree+field split via comma ---
const withComma = extractEducation([
  block("State University", {}, "inst"),
  block("Bachelor of Science, Computer Science", {}, "degree"),
  block("2016 - 2020", {}, "date"),
]);
assertEqual("withComma: one entry", withComma.length, 1);
assertEqual("withComma: institution", withComma[0].institution.value, "State University");
assertEqual("withComma: degree", withComma[0].degree?.value, "Bachelor of Science");
assertEqual("withComma: fieldOfStudy", withComma[0].fieldOfStudy?.value, "Computer Science");
assertEqual("withComma: dates", { start: withComma[0].startDate.value, end: withComma[0].endDate.value }, {
  start: "2016",
  end: "2020",
});

// --- two header lines, degree+field split via "in" ---
const withIn = extractEducation([
  block("Tech Institute", {}, "inst"),
  block("Bachelor of Science in Computer Science", {}, "degree"),
  block("2015 - 2019", {}, "date"),
]);
assertEqual("withIn: degree", withIn[0].degree?.value, "Bachelor of Science");
assertEqual("withIn: fieldOfStudy", withIn[0].fieldOfStudy?.value, "Computer Science");

// --- single header line: treated as institution, degree/field left null ---
const singleLine = extractEducation([
  block("Design Academy", {}, "inst"),
  block("2018 - 2021", {}, "date"),
]);
assertEqual("singleLine: institution", singleLine[0].institution.value, "Design Academy");
assertEqual("singleLine: degree is null (not fabricated)", singleLine[0].degree, null);
assertEqual("singleLine: fieldOfStudy is null (not fabricated)", singleLine[0].fieldOfStudy, null);

// --- degree line with no separator: kept whole as degree, no fieldOfStudy ---
const noSeparator = extractEducation([
  block("University of Somewhere", {}, "inst"),
  block("MBA", {}, "degree"),
  block("2012 - 2014", {}, "date"),
]);
assertEqual("noSeparator: degree kept whole", noSeparator[0].degree?.value, "MBA");
assertEqual("noSeparator: fieldOfStudy left null", noSeparator[0].fieldOfStudy, null);

// --- two entries in sequence ---
const twoEntries = extractEducation([
  block("State University", {}, "inst1"),
  block("Bachelor of Science, Computer Science", {}, "degree1"),
  block("2016 - 2020", {}, "date1"),
  block("City College", {}, "inst2"),
  block("Master of Science, Data Science", {}, "degree2"),
  block("2020 - 2022", {}, "date2"),
]);
assertEqual("twoEntries: count", twoEntries.length, 2);
assertEqual("twoEntries: first institution", twoEntries[0].institution.value, "State University");
assertEqual("twoEntries: second institution", twoEntries[1].institution.value, "City College");
assertEqual("twoEntries: second degree", twoEntries[1].degree?.value, "Master of Science");

// --- no date line at all: unsegmented fallback ---
const noDate = extractEducation([block("Some School", {}, "s")]);
assertEqual("noDate: single fallback entry", noDate.length, 1);
assertEqual("noDate: institution from the only line", noDate[0].institution.value, "Some School");
assertEqual("noDate: dates unresolved", { start: noDate[0].startDate.value, end: noDate[0].endDate.value }, {
  start: null,
  end: null,
});

// --- empty input ---
assertEqual("empty input -> no entries", extractEducation([]), []);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
