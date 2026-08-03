// Groups an experience section's blocks into individual job entries and
// splits role/company. This is the most heuristic part of the whole
// pipeline -- real CVs vary a lot here -- so every uncertain decision is
// tagged with a correspondingly low/medium confidence rather than
// guessed with false certainty; ambiguous cases feed computeNeedsReview
// (see domain/rules.ts) rather than silently producing wrong data.
//
// Strategy: a parseable date range is the strongest, most reliable
// per-entry boundary signal available (far more reliable than bold/
// italic, which is frequently unavailable -- see pdfTextMapper.ts). Entry
// boundaries themselves (including the header-before-vs-after-date
// direction) are found by entryBoundaries.ts, shared with
// educationExtractor.ts; this file only splits the found header into
// role/company and assigns bullets to entries.

import type { LayoutTextBlock } from "../infrastructure/layout.ts";
import type { ExtractedExperience, ExtractedField, ExtractionMethod } from "../domain/types.ts";
import { confidenceForMethod, parseDateRange } from "../domain/rules.ts";
import { boundarySpan, findEntryBoundaries } from "./entryBoundaries.ts";
import { joinWrappedText, looksLikeWrapContinuation } from "./headerText.ts";

// Covers "Role - Company", "Role at Company", "Role, Company", and the
// German "Rolle bei Firma" -- the common single-line patterns.
const COMBINED_LINE_SEPARATOR = /\s*,\s*|\s+(?:at|bei)\s+|\s+(?:-|–|—|\||·)\s+/i;

function toSourceRef(block: LayoutTextBlock) {
  return { blockId: block.blockId, page: block.page, x: block.x, y: block.y };
}

function field<T>(value: T, block: LayoutTextBlock, method: ExtractionMethod): ExtractedField<T> {
  return { confidence: confidenceForMethod(method), extractionMethod: method, source: toSourceRef(block), value };
}

// Splits a single logical "Role, Company" (or "Role - Company", "Role at
// Company") string. Shared by the genuine one-line case and the
// wrapped-two-lines-that-are-really-one-sentence case below.
function splitCombinedText(
  text: string,
  sourceBlock: LayoutTextBlock,
): { company: ExtractedField<string>; role: ExtractedField<string> } {
  const match = COMBINED_LINE_SEPARATOR.exec(text);

  if (match) {
    const role = text.slice(0, match.index).trim();
    const company = text.slice(match.index + match[0].length).trim();
    return {
      company: field(company, sourceBlock, "regex-exact"),
      role: field(role, sourceBlock, "regex-exact"),
    };
  }

  // No separator found -- can't confidently tell role from company.
  // Keep the text as the role (the more consequential of the two for
  // matching purposes) and flag company as unresolved rather than guess
  // which part is which.
  return {
    company: field("", sourceBlock, "unmatched"),
    role: field(text, sourceBlock, "layout-heuristic"),
  };
}

function splitHeaderBlocks(
  headerBlocks: LayoutTextBlock[],
  fallbackBlock: LayoutTextBlock,
): { company: ExtractedField<string>; role: ExtractedField<string> } {
  if (headerBlocks.length === 0) {
    // No header content precedes this date line at all -- both fields
    // are explicitly empty and low-confidence rather than guessed.
    return {
      company: field("", fallbackBlock, "unmatched"),
      role: field("", fallbackBlock, "unmatched"),
    };
  }

  if (headerBlocks.length === 1) {
    return splitCombinedText(headerBlocks[0].text, headerBlocks[0]);
  }

  // Two header lines. If the first looks like it's mid-sentence (a
  // trailing comma or word-wrap hyphen), this is really ONE line that
  // wrapped, not two independently meaningful ones -- confirmed against
  // a real CV where treating a wrapped "...Continental AG, Ingolstadt,"
  // + "Germany." as separate role/company fields produced nonsense.
  // Join and split as a single combined line instead.
  const [first, second] = headerBlocks;
  if (looksLikeWrapContinuation(first.text)) {
    return splitCombinedText(joinWrappedText(first.text, second.text), first);
  }

  // Otherwise, these are two genuinely separate lines (e.g. "Senior
  // Developer" / "Acme Corp"): the larger font, or bold when sizes tie,
  // is treated as the role -- the common convention of the job title
  // being visually more prominent than the company name. When neither
  // signal distinguishes them, the assignment is a pure position guess
  // and is tagged accordingly.
  const sizesDiffer = first.fontSize !== second.fontSize;
  const boldnessDiffers = first.isBold !== second.isBold;
  const firstIsRole = sizesDiffer ? first.fontSize > second.fontSize : first.isBold;
  const [roleBlock, companyBlock] = firstIsRole ? [first, second] : [second, first];
  const method: ExtractionMethod = sizesDiffer || boldnessDiffers ? "layout-heuristic" : "unmatched";

  return {
    company: field(companyBlock.text, companyBlock, method),
    role: field(roleBlock.text, roleBlock, method),
  };
}

function buildUnsegmentedEntry(blocks: LayoutTextBlock[]): ExtractedExperience {
  const [first, ...rest] = blocks;
  return {
    bullets: rest.map((block) => field(block.text, block, "layout-heuristic")),
    company: field("", first, "unmatched"),
    endDate: field(null, first, "unmatched"),
    isCurrent: false,
    role: field(first.text, first, "layout-heuristic"),
    startDate: field(null, first, "unmatched"),
  };
}

export function extractExperience(blocks: LayoutTextBlock[]): ExtractedExperience[] {
  const boundaries = findEntryBoundaries(blocks);

  if (boundaries.length === 0) {
    // No recognizable date line anywhere in the section -- can't
    // confidently segment into entries. Surface everything as one
    // heavily-flagged entry rather than silently dropping it.
    return blocks.length === 0 ? [] : [buildUnsegmentedEntry(blocks)];
  }

  const entries: ExtractedExperience[] = [];
  let previousSpanEnd = -1;

  boundaries.forEach((boundary) => {
    const span = boundarySpan(boundary);
    const leadingBullets = blocks.slice(previousSpanEnd + 1, span.start);

    if (entries.length > 0 && leadingBullets.length > 0) {
      entries[entries.length - 1].bullets.push(
        ...leadingBullets.map((block) => field(block.text, block, "layout-heuristic")),
      );
    }

    const headerBlocks = boundary.headerIndices.map((index) => blocks[index]);
    const dateBlock = blocks[boundary.dateIndex];
    const { company, role } = splitHeaderBlocks(headerBlocks, dateBlock);
    const dateRange = parseDateRange(dateBlock.text);

    entries.push({
      bullets: [],
      company,
      endDate: field(dateRange.end, dateBlock, "regex-exact"),
      isCurrent: dateRange.isCurrent,
      role,
      startDate: field(dateRange.start, dateBlock, "regex-exact"),
    });

    previousSpanEnd = span.end;
  });

  const trailingBullets = blocks.slice(previousSpanEnd + 1);
  if (trailingBullets.length > 0) {
    entries[entries.length - 1].bullets.push(
      ...trailingBullets.map((block) => field(block.text, block, "layout-heuristic")),
    );
  }

  return entries;
}
