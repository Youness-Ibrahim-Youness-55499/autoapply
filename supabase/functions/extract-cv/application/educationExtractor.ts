// Groups an education section's blocks into entries, using the same
// date-range-as-boundary strategy as experienceExtractor.ts. Simpler
// output shape than experience (no bullets) since ExtractedEducation
// itself only models institution/degree/fieldOfStudy/dates -- any
// trailing content in an entry beyond that (e.g. an honors/GPA line) is
// not captured in this phase.

import type { LayoutTextBlock } from "../infrastructure/layout.ts";
import type { ExtractedEducation, ExtractedField, ExtractionMethod } from "../domain/types.ts";
import { confidenceForMethod, parseDateRange } from "../domain/rules.ts";
import { findEntryBoundaries } from "./entryBoundaries.ts";

// Splits a combined "Degree, Field" or "Degree in Field" line. A plain
// comma or the word "in" covers the large majority of real phrasing
// ("Bachelor of Science, Computer Science" / "Bachelor of Science in
// Computer Science") without trying to parse every degree-naming style.
const DEGREE_FIELD_SEPARATOR = /\s*,\s*|\s+in\s+/i;

function toSourceRef(block: LayoutTextBlock) {
  return { blockId: block.blockId, page: block.page, x: block.x, y: block.y };
}

function field<T>(value: T, block: LayoutTextBlock, method: ExtractionMethod): ExtractedField<T> {
  return { confidence: confidenceForMethod(method), extractionMethod: method, source: toSourceRef(block), value };
}

function splitDegreeAndField(
  block: LayoutTextBlock,
): { degree: ExtractedField<string>; fieldOfStudy: ExtractedField<string> | null } {
  const match = DEGREE_FIELD_SEPARATOR.exec(block.text);

  if (!match) {
    // A single unsplit phrase -- keep it as the degree, leave field of
    // study unresolved rather than guess a split point that isn't there.
    return { degree: field(block.text, block, "layout-heuristic"), fieldOfStudy: null };
  }

  const degreeText = block.text.slice(0, match.index).trim();
  const fieldText = block.text.slice(match.index + match[0].length).trim();

  return {
    degree: field(degreeText, block, "regex-exact"),
    fieldOfStudy: fieldText ? field(fieldText, block, "regex-exact") : null,
  };
}

function buildUnsegmentedEntry(blocks: LayoutTextBlock[]): ExtractedEducation {
  const [first] = blocks;
  return {
    degree: null,
    endDate: field(null, first, "unmatched"),
    fieldOfStudy: null,
    institution: field(first.text, first, "layout-heuristic"),
    isCurrent: false,
    startDate: field(null, first, "unmatched"),
  };
}

export function extractEducation(blocks: LayoutTextBlock[]): ExtractedEducation[] {
  const boundaries = findEntryBoundaries(blocks);

  if (boundaries.length === 0) {
    return blocks.length === 0 ? [] : [buildUnsegmentedEntry(blocks)];
  }

  const entries: ExtractedEducation[] = [];

  boundaries.forEach((boundary) => {
    const headerBlocks = boundary.headerIndices.map((index) => blocks[index]);
    const dateBlock = blocks[boundary.dateIndex];
    const dateRange = parseDateRange(dateBlock.text);

    let institution: ExtractedField<string>;
    let degree: ExtractedField<string> | null = null;
    let fieldOfStudy: ExtractedField<string> | null = null;

    if (headerBlocks.length === 0) {
      institution = field("", dateBlock, "unmatched");
    } else if (headerBlocks.length === 1) {
      // Only one header line: it's ambiguous whether it names the
      // institution or the degree. Institution is treated as the default
      // reading (the more common "Institution name" first convention).
      institution = field(headerBlocks[0].text, headerBlocks[0], "layout-heuristic");
    } else {
      const [institutionBlock, degreeLineBlock] = headerBlocks;
      institution = field(institutionBlock.text, institutionBlock, "layout-heuristic");
      const split = splitDegreeAndField(degreeLineBlock);
      degree = split.degree;
      fieldOfStudy = split.fieldOfStudy;
    }

    entries.push({
      degree,
      endDate: field(dateRange.end, dateBlock, "regex-exact"),
      fieldOfStudy,
      institution,
      isCurrent: dateRange.isCurrent,
      startDate: field(dateRange.start, dateBlock, "regex-exact"),
    });
  });

  return entries;
}
