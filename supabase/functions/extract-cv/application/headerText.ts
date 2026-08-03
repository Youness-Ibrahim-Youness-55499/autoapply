// Shared helpers for experienceExtractor.ts and educationExtractor.ts:
// detecting when a "2-line header" is actually ONE sentence that wrapped
// across two visual lines (e.g. a long "Role, Company, City, Country."
// or "Degree, Institution, City, Country." line), rather than two
// independently meaningful lines (e.g. "Senior Developer" / "Acme Corp"
// as a real, separate role/company pair -- also a common, valid
// convention already relied on elsewhere in this file).
//
// Confirmed necessary against a real CV where treating a wrapped
// sentence as two separate fields produced nonsense: a role/company line
// that wrapped mid-list ("...Continental AG, Ingolstadt," / "Germany.")
// got its two halves treated as independent role and company fields
// instead of one sentence to split properly.
//
// The signal: a line that's about to wrap almost always ends either
// mid-list (a trailing comma), mid-word (a trailing hyphen from the
// renderer's own line-breaking), or mid-phrase on a conjunction/
// preposition ("Misr University For Science and" / "Technology,
// Egypt.") -- confirmed against a real CV that wrapped exactly there. A
// genuinely separate, complete line (like a standalone "Senior
// Developer") ends with none of these.
const TRAILING_CONJUNCTION = /\b(?:and|or|of|for|the|in|with|at|by|to)$/i;

export function looksLikeWrapContinuation(firstLineText: string): boolean {
  const trimmed = firstLineText.trim();
  return trimmed.endsWith(",") || trimmed.endsWith("-") || TRAILING_CONJUNCTION.test(trimmed);
}

// Joins a wrapped line pair back into one logical string. A trailing
// hyphen means the word itself was split (e.g. "Technische Hochschule
// In-" + "golstadt" -> "Technische Hochschule Ingolstadt"), so the
// hyphen is dropped and the halves are joined with no space; anything
// else (typically a trailing comma mid-list) joins with a space.
export function joinWrappedText(first: string, second: string): string {
  const trimmedFirst = first.trim();

  if (trimmedFirst.endsWith("-")) {
    return trimmedFirst.slice(0, -1) + second.trim();
  }

  return `${trimmedFirst} ${second.trim()}`;
}
