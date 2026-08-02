// Groups an experience section's blocks into individual job entries and
// splits role/company. This is the most heuristic part of the whole
// pipeline -- real CVs vary a lot here -- so every uncertain decision is
// tagged with a correspondingly low/medium confidence rather than
// guessed with false certainty; ambiguous cases feed computeNeedsReview
// (see domain/rules.ts) rather than silently producing wrong data.
//
// Strategy: a parseable date range is the strongest, most reliable
// per-entry boundary signal available (far more reliable than bold/
// italic, which is frequently unavailable -- see pdfTextMapper.ts). Each
// date line found anchors one entry; the 1-2 lines immediately before it
// are that entry's role/company header, and everything between one
// entry's date line and the next entry's header is treated as bullets.

import type { LayoutTextBlock } from "../infrastructure/layout.ts";
import type { ExtractedExperience, ExtractedField, ExtractionMethod } from "../domain/types.ts";
import { confidenceForMethod, parseDateRange } from "../domain/rules.ts";

// Covers "Role - Company", "Role at Company", "Role, Company", and the
// German "Rolle bei Firma" -- the common single-line patterns.
const COMBINED_LINE_SEPARATOR = /\s*,\s*|\s+(?:at|bei)\s+|\s+(?:-|–|—|\||·)\s+/i;
// At most this many lines immediately before a date line are considered
// that entry's role/company header -- covers the common "role, then
// company" or "role" / "company" two-line patterns without reaching back
// into the previous entry's bullet points.
const MAX_HEADER_LINES = 2;

function toSourceRef(block: LayoutTextBlock) {
  return { blockId: block.blockId, page: block.page, x: block.x, y: block.y };
}

function field<T>(value: T, block: LayoutTextBlock, method: ExtractionMethod): ExtractedField<T> {
  return { confidence: confidenceForMethod(method), extractionMethod: method, source: toSourceRef(block), value };
}

function hasDateRange(text: string): boolean {
  const range = parseDateRange(text);
  return range.start !== null || range.end !== null || range.isCurrent;
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
    const [only] = headerBlocks;
    const match = COMBINED_LINE_SEPARATOR.exec(only.text);

    if (match) {
      const role = only.text.slice(0, match.index).trim();
      const company = only.text.slice(match.index + match[0].length).trim();
      return {
        company: field(company, only, "regex-exact"),
        role: field(role, only, "regex-exact"),
      };
    }

    // No separator found -- can't confidently tell role from company on
    // a single combined line. Keep the line as the role (the more
    // consequential of the two for matching purposes) and flag company
    // as unresolved rather than guess which part is which.
    return {
      company: field("", only, "unmatched"),
      role: field(only.text, only, "layout-heuristic"),
    };
  }

  // Two header lines: the larger font, or bold when sizes tie, is
  // treated as the role -- the common convention of the job title being
  // visually more prominent than the company name. When neither signal
  // distinguishes them, the assignment is a pure position guess and is
  // tagged accordingly.
  const [first, second] = headerBlocks;
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
  const dateIndices: number[] = [];
  blocks.forEach((block, index) => {
    if (hasDateRange(block.text)) {
      dateIndices.push(index);
    }
  });

  if (dateIndices.length === 0) {
    // No recognizable date line anywhere in the section -- can't
    // confidently segment into entries. Surface everything as one
    // heavily-flagged entry rather than silently dropping it.
    return blocks.length === 0 ? [] : [buildUnsegmentedEntry(blocks)];
  }

  const entries: ExtractedExperience[] = [];
  let previousBoundary = 0;

  dateIndices.forEach((dateIndex, i) => {
    const headerStart = Math.max(previousBoundary, dateIndex - MAX_HEADER_LINES);
    const leadingBullets = blocks.slice(previousBoundary, headerStart);
    const headerBlocks = blocks.slice(headerStart, dateIndex);
    const dateBlock = blocks[dateIndex];

    if (i > 0 && leadingBullets.length > 0) {
      entries[entries.length - 1].bullets.push(
        ...leadingBullets.map((block) => field(block.text, block, "layout-heuristic")),
      );
    }

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

    previousBoundary = dateIndex + 1;
  });

  const trailingBullets = blocks.slice(previousBoundary);
  if (trailingBullets.length > 0) {
    entries[entries.length - 1].bullets.push(
      ...trailingBullets.map((block) => field(block.text, block, "layout-heuristic")),
    );
  }

  return entries;
}
