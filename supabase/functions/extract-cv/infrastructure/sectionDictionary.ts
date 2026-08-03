// Controlled dictionary of known CV section headers, EN + German only
// (the project doesn't target other languages yet -- see the phase
// constraints). Not exhaustive: covers common real-world header wording,
// documented as a starter list meant to grow, not a claim of completeness.
// Anything that looks header-shaped but isn't in here becomes an
// "unmatched section" upstream (see sectionDetector.ts) -- it is never
// silently dropped or guessed into the wrong bucket.

import { normalizeForMatch } from "../domain/rules.ts";

export type SectionKey =
  | "certifications"
  | "contact"
  | "education"
  | "experience"
  | "languages"
  | "projects"
  | "references"
  | "skills"
  | "summary";

// Keys are the normalizeForMatch()-ed header text (lowercase, diacritics
// folded, whitespace collapsed) so lookups don't need to re-derive it.
const SECTION_HEADERS: Record<string, SectionKey> = {
  // experience
  "experience": "experience",
  "work experience": "experience",
  "working experience": "experience",
  "professional experience": "experience",
  "employment history": "experience",
  "work history": "experience",
  "career history": "experience",
  "berufserfahrung": "experience",
  "praktische erfahrung": "experience",
  "beruflicher werdegang": "experience",
  "werdegang": "experience",

  // education
  "education": "education",
  "education and training": "education",
  "academic background": "education",
  "academic history": "education",
  "ausbildung": "education",
  "bildungsweg": "education",
  "schulbildung": "education",

  // skills
  "skills": "skills",
  "technical skills": "skills",
  "core competencies": "skills",
  "key skills": "skills",
  "skills and competencies": "skills",
  "kenntnisse": "skills",
  "fahigkeiten": "skills",
  "kompetenzen": "skills",
  "qualifikationen": "skills",

  // summary
  "summary": "summary",
  "profile": "summary",
  "professional summary": "summary",
  "about me": "summary",
  "objective": "summary",
  "career objective": "summary",
  "profil": "summary",
  "zusammenfassung": "summary",
  "uber mich": "summary",
  "kurzprofil": "summary",

  // certifications
  "certifications": "certifications",
  "certificates": "certifications",
  "licenses": "certifications",
  "licenses and certifications": "certifications",
  "zertifikate": "certifications",
  "zertifizierungen": "certifications",

  // languages
  "languages": "languages",
  "language skills": "languages",
  "sprachen": "languages",
  "sprachkenntnisse": "languages",

  // projects
  "projects": "projects",
  "personal projects": "projects",
  "selected projects": "projects",
  "projekte": "projects",

  // references
  "references": "references",
  "referenzen": "references",

  // contact
  "contact": "contact",
  "contact information": "contact",
  "contact details": "contact",
  "kontakt": "contact",
  "kontaktdaten": "contact",
  "kontaktinformationen": "contact",
};

export function matchSectionHeader(text: string): SectionKey | null {
  return SECTION_HEADERS[normalizeForMatch(text)] ?? null;
}
