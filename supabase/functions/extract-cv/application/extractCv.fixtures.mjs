// Run: node supabase/functions/extract-cv/application/extractCv.fixtures.mjs
//
// This is the end-to-end check: a full, realistic LayoutTextBlock[] --
// the exact shape both pdfParser.ts and docxParser.ts produce (verified
// against real files in Phases 2-3) -- run through the complete
// pipeline. Directly exercises several items from the master prompt's
// own manual test checklist: a single-column CV, German section headers,
// an unconventional section name, and a text-free (simulated scanned)
// document failing gracefully rather than crashing.

const url = new URL("./extractCv.ts", import.meta.url).href;
const { extractCv } = await import(url);

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

function assertTrue(label, actual) {
  assertEqual(label, actual, true);
}

let blockCounter = 0;
function block(text, opts = {}) {
  blockCounter++;
  return { blockId: `b${blockCounter}`, fontSize: 10, isBold: false, isItalic: false, page: 1, text, x: 0, y: 0, ...opts };
}

// --- realistic single-column EN CV ---
const enCv = extractCv([
  block("Jordan Lee", { fontSize: 22 }),
  block("Senior Backend Engineer", { fontSize: 12 }),
  block("jordan.lee@example.com"),
  block("+1 415 555 0134"),
  block("linkedin.com/in/jordanlee"),
  block("Experience", { fontSize: 14 }),
  block("Senior Backend Engineer", { fontSize: 12 }),
  block("Nordstack"),
  block("Jan 2021 - Present"),
  block("Led migration to a service-oriented architecture."),
  block("Mentored two junior engineers."),
  block("Backend Engineer", { fontSize: 12 }),
  block("Voltiq"),
  block("Jun 2018 - Dec 2020"),
  block("Built the payments processing pipeline."),
  block("Education", { fontSize: 14 }),
  block("State University"),
  block("Bachelor of Science, Computer Science"),
  block("2014 - 2018"),
  block("Skills", { fontSize: 14 }),
  block("Python, Go, PostgreSQL, Docker, Kubernetes"),
]);

assertEqual("EN: email extracted", enCv.contact.email?.value, "jordan.lee@example.com");
assertEqual("EN: phone extracted", enCv.contact.phone?.value, "+1 415 555 0134");
assertEqual("EN: link extracted", enCv.contact.links.map((l) => l.value), ["linkedin.com/in/jordanlee"]);
assertEqual("EN: two experience entries", enCv.experience.length, 2);
assertEqual("EN: first experience role", enCv.experience[0].role.value, "Senior Backend Engineer");
assertEqual("EN: first experience company", enCv.experience[0].company.value, "Nordstack");
assertEqual("EN: first experience is current", enCv.experience[0].isCurrent, true);
assertEqual("EN: first experience bullets", enCv.experience[0].bullets.map((b) => b.value), [
  "Led migration to a service-oriented architecture.",
  "Mentored two junior engineers.",
]);
assertEqual("EN: second experience role/company", {
  role: enCv.experience[1].role.value,
  company: enCv.experience[1].company.value,
}, { role: "Backend Engineer", company: "Voltiq" });
assertEqual("EN: one education entry", enCv.education.length, 1);
assertEqual("EN: education institution", enCv.education[0].institution.value, "State University");
assertEqual("EN: education degree/field split", {
  degree: enCv.education[0].degree?.value,
  fieldOfStudy: enCv.education[0].fieldOfStudy?.value,
}, { degree: "Bachelor of Science", fieldOfStudy: "Computer Science" });
assertEqual("EN: skills matched against dictionary", enCv.skills.map((s) => s.value), [
  "Python",
  "Go",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
]);
assertEqual("EN: no unmatched sections", enCv.unmatchedSections, []);
assertEqual("EN: every experience field has a non-null source", enCv.experience.every((entry) =>
  [entry.role, entry.company, entry.startDate, entry.endDate, ...entry.bullets].every((f) => f.source != null)
), true);
assertEqual("EN: needsReview is false when everything resolved to high/medium confidence", enCv.needsReview, false);

// --- German section headers ---
const deCv = extractCv([
  block("Anna Fischer", { fontSize: 22 }),
  block("anna.fischer@example.de"),
  block("Berufserfahrung", { fontSize: 14 }),
  block("Softwareentwicklerin", { fontSize: 12 }),
  block("Firma GmbH"),
  block("Jan 2019 - Heute"),
  block("Ausbildung", { fontSize: 14 }),
  block("Universität Berlin"),
  block("2015 - 2019"),
]);

assertEqual("DE: experience entry found under German header", deCv.experience.length, 1);
assertEqual("DE: experience company", deCv.experience[0].company.value, "Firma GmbH");
assertEqual("DE: 'Heute' recognized as ongoing", deCv.experience[0].isCurrent, true);
assertEqual("DE: education entry found under German header", deCv.education.length, 1);
assertEqual("DE: education institution", deCv.education[0].institution.value, "Universität Berlin");
assertEqual("DE: email still found", deCv.contact.email?.value, "anna.fischer@example.de");

// --- unconventional section name: preserved, not dropped or misassigned ---
const creativeCv = extractCv([
  block("Sam Rivera", { fontSize: 22 }),
  block("My Career Journey", { fontSize: 14 }),
  block("Started out as an intern and grew from there."),
  block("Learned a lot along the way about backend systems."),
  block("Skills", { fontSize: 14 }),
  block("Java, React"),
]);
assertEqual("creative: one unmatched section captured", creativeCv.unmatchedSections.length, 1);
assertEqual("creative: unmatched header text preserved", creativeCv.unmatchedSections[0].header, "My Career Journey");
assertTrue(
  "creative: unmatched raw text preserved, not dropped",
  creativeCv.unmatchedSections[0].rawText.includes("Started out as an intern"),
);
assertEqual("creative: known Skills section still detected despite the unknown one before it", creativeCv.skills.map((s) => s.value), [
  "Java",
  "React",
]);
assertEqual("creative: needsReview true because of the unmatched section", creativeCv.needsReview, true);

// --- text-free input (simulated scanned/image-only document): fails gracefully, not a crash ---
const blankCv = extractCv([]);
assertEqual("blank: no experience", blankCv.experience, []);
assertEqual("blank: no education", blankCv.education, []);
assertEqual("blank: no skills", blankCv.skills, []);
assertEqual("blank: no contact info", { email: blankCv.contact.email, phone: blankCv.contact.phone, links: blankCv.contact.links }, {
  email: null,
  phone: null,
  links: [],
});
assertEqual("blank: needsReview is true (nothing was extracted at all)", blankCv.needsReview, true);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
