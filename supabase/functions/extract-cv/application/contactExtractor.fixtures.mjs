// Run: node supabase/functions/extract-cv/application/contactExtractor.fixtures.mjs

const url = new URL("./contactExtractor.ts", import.meta.url).href;
const { extractContact } = await import(url);

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

const blocks = [
  block("John Doe"),
  block("john.doe@example.com"),
  block("+1 (555) 123-4567"),
  block("linkedin.com/in/johndoe"),
  block("github.com/johndoe"),
  block("Berlin, Germany"),
];

const result = extractContact(blocks);

assertEqual("email found", result.email?.value, "john.doe@example.com");
assertEqual("email is high confidence regex-exact", result.email?.confidence, "high");
assertEqual("email source points at the right block", result.email?.source.blockId, "john.doe@example.com");
assertEqual("phone found", result.phone?.value, "+1 (555) 123-4567");
assertEqual("two links found", result.links.map((l) => l.value), [
  "linkedin.com/in/johndoe",
  "github.com/johndoe",
]);

assertEqual("no contact info at all -> all null/empty", extractContact([block("Just a regular line.")]), {
  email: null,
  links: [],
  phone: null,
});

assertEqual(
  "a short number (zip code) is not mistaken for a phone",
  extractContact([block("10115 Berlin")]).phone,
  null,
);

assertEqual(
  "first email wins if multiple appear",
  extractContact([block("a@b.com"), block("c@d.com")]).email?.value,
  "a@b.com",
);

assertEqual(
  "duplicate link mentioned twice is only recorded once",
  extractContact([block("github.com/johndoe"), block("see github.com/johndoe again")]).links.length,
  1,
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
