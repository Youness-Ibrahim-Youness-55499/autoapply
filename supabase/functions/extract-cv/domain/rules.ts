// Pure domain rules: date-range parsing and confidence scoring. No I/O, no
// framework imports, no Deno-specific APIs -- these run identically under
// Deno (the eventual Edge Function runtime) or plain Node, which is what
// lets them be verified today even though this project has no Deno CLI
// available and no test runner wired up yet.

import type { Confidence, ExtractedCV, ExtractedField, ExtractionMethod } from "./types";

// EN + DE tokens meaning "this is still ongoing" -- matches the source
// spec's "Present"/"Heute" requirement. Matched case-insensitively against
// the whole trimmed token.
const ONGOING_TOKENS = new Set([
  "present",
  "current",
  "currently",
  "now",
  "ongoing",
  "heute",
  "aktuell",
  "laufend",
  "bis heute",
]);

// Month name -> 1-12, EN + DE, short and long forms. Keys are lowercase
// with German umlauts folded to their base vowel (a/o/u) so lookups can
// normalize input the same way before matching.
const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1, januar: 1,
  feb: 2, february: 2, februar: 2,
  // "marz" is what foldDiacritics produces from "März"; "maerz" is kept
  // too since some people type the umlaut as a literal "ae" digraph.
  mar: 3, march: 3, marz: 3, maerz: 3,
  apr: 4, april: 4,
  may: 5, mai: 5,
  jun: 6, june: 6, juni: 6,
  jul: 7, july: 7, juli: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10, okt: 10, oktober: 10,
  nov: 11, november: 11,
  dec: 12, december: 12, dez: 12, dezember: 12,
};

const RANGE_SEPARATOR = /\s*(?:-|–|—|\bto\b|\bbis\b)\s*/i;

function foldDiacritics(value: string) {
  return value
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss");
}

export function isOngoingToken(raw: string): boolean {
  const normalized = foldDiacritics(raw.trim().toLowerCase());
  return ONGOING_TOKENS.has(normalized);
}

// Parses a single date token into "YYYY-MM" or "YYYY". Returns null
// rather than guessing when the format isn't recognized -- per the "flag
// for review instead of auto-correcting" constraint, an unparseable date
// must surface as null, never a best-effort guess.
export function parseDateToken(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const isoMatch = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}`;
  }

  const numericMatch = /^(\d{1,2})[./](\d{4})$/.exec(trimmed);
  if (numericMatch) {
    const month = Number(numericMatch[1]);
    if (month >= 1 && month <= 12) {
      return `${numericMatch[2]}-${String(month).padStart(2, "0")}`;
    }
    return null;
  }

  const namedMonthMatch = /^([a-zA-Zäöü.]+)\.?\s+(\d{4})$/.exec(trimmed);
  if (namedMonthMatch) {
    const key = foldDiacritics(namedMonthMatch[1].replace(/\.$/, "").toLowerCase());
    const month = MONTH_NAMES[key];
    if (month) {
      return `${namedMonthMatch[2]}-${String(month).padStart(2, "0")}`;
    }
    return null;
  }

  const yearMatch = /^(\d{4})$/.exec(trimmed);
  if (yearMatch) {
    return yearMatch[1];
  }

  return null;
}

export type DateRange = {
  end: string | null;
  isCurrent: boolean;
  start: string | null;
};

export function parseDateRange(raw: string): DateRange {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { end: null, isCurrent: false, start: null };
  }

  const parts = trimmed
    .split(RANGE_SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    if (isOngoingToken(parts[0])) {
      return { end: null, isCurrent: true, start: null };
    }
    return { end: null, isCurrent: false, start: parseDateToken(parts[0]) };
  }

  if (parts.length === 2) {
    const [startRaw, endRaw] = parts;
    const isCurrent = isOngoingToken(endRaw);
    return {
      end: isCurrent ? null : parseDateToken(endRaw),
      isCurrent,
      start: parseDateToken(startRaw),
    };
  }

  // More than 2 parts is ambiguous (e.g. a stray separator bled in from
  // adjacent text) -- don't guess which two are the real range.
  return { end: null, isCurrent: false, start: null };
}

// A fuzzy match score is expected as 0-1 (e.g. a normalized rapidfuzz-style
// ratio), independent of which fuzzy-matching library the infrastructure
// layer ends up using.
const FUZZY_HIGH_CONFIDENCE_THRESHOLD = 0.85;

export function confidenceForMethod(
  method: ExtractionMethod,
  options: { fuzzyScore?: number } = {},
): Confidence {
  switch (method) {
    case "regex-exact":
    case "dictionary-exact":
      return "high";
    case "layout-heuristic":
      return "medium";
    case "regex-fuzzy":
    case "dictionary-fuzzy":
      return (options.fuzzyScore ?? 0) >= FUZZY_HIGH_CONFIDENCE_THRESHOLD
        ? "medium"
        : "low";
    case "unmatched":
      return "low";
  }
}

function collectFields(cv: ExtractedCV): ExtractedField<unknown>[] {
  return [
    ...(cv.contact.email ? [cv.contact.email] : []),
    ...(cv.contact.phone ? [cv.contact.phone] : []),
    ...cv.contact.links,
    ...cv.skills,
    ...cv.experience.flatMap((item) => [
      item.company,
      item.role,
      item.startDate,
      item.endDate,
      ...item.bullets,
    ]),
    ...cv.education.flatMap((item) => [
      item.institution,
      ...(item.degree ? [item.degree] : []),
      ...(item.fieldOfStudy ? [item.fieldOfStudy] : []),
      item.startDate,
      item.endDate,
    ]),
  ];
}

// True if any field fell below "high"/"medium" confidence, or a section
// couldn't be classified at all -- either case means a human should
// confirm before this data is trusted, per the "never silently accept
// low-confidence data" constraint.
export function computeNeedsReview(cv: ExtractedCV): boolean {
  if (cv.unmatchedSections.length > 0) {
    return true;
  }

  return collectFields(cv).some((field) => field.confidence === "low");
}
