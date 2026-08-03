// Groups a flat list of layout-aware text blocks into CV sections. Pure
// function: takes the LayoutTextBlock[] that either parser produces,
// returns section groupings -- no I/O, no knowledge of PDF vs DOCX.
//
// Header detection deliberately requires a real font-size jump over the
// document's body-text baseline, not "isBold alone." Bold, body-sized
// text (a common style for company/role lines inside an experience
// entry -- see experienceExtractor.ts) would otherwise get misread as a
// new top-level section on every such line, fragmenting one section into
// many spurious "unmatched sections." A CV whose section headers are
// marked by boldness alone with no size increase won't be detected as
// having section boundaries at all; its content falls into whichever
// section (or the preamble) precedes it -- a known limitation, not a
// crash, consistent with "don't attempt every layout, flag the rest."
//
// Font size alone isn't always enough either -- confirmed against a real
// CV where every job entry's "Role, Company, Location." line was styled
// at the EXACT same font size as the genuine "Education"/"Working
// Experience" headers, fragmenting one experience section into eight
// spurious ones (each wrapped city/country fragment like "Germany."
// becoming its own "header"). What actually distinguished them: real
// headers sat in a left-margin column at a meaningfully smaller x than
// the main content column those entry lines (and all body text) used.
// detectSections cross-checks font-size candidates against the
// x-position of confirmed (dictionary-matched) headers for exactly this
// reason -- see HEADER_X_TOLERANCE below.

import type { LayoutTextBlock } from "../infrastructure/layout.ts";
import { matchSectionHeader, type SectionKey } from "../infrastructure/sectionDictionary.ts";

export type DetectedSection = {
  blocks: LayoutTextBlock[];
  headerBlock: LayoutTextBlock;
  key: SectionKey;
};

export type UnmatchedSectionCandidate = {
  blocks: LayoutTextBlock[];
  headerBlock: LayoutTextBlock;
};

export type SectionDetectionResult = {
  // Blocks before the first detected header -- typically name/title/
  // contact-info preamble. If no headers are found at all, every block
  // ends up here.
  preamble: LayoutTextBlock[];
  sections: DetectedSection[];
  unmatched: UnmatchedSectionCandidate[];
};

// Headers are short by nature; this guards against a long, larger-font
// pull-quote-style sentence being mistaken for one.
const MAX_HEADER_LENGTH = 60;
const FONT_SIZE_EPSILON = 0.01;
// How far a header-sized block's x-position may sit from a confirmed
// header's x and still count as "the same margin column." Chosen from a
// real CV where genuine headers spanned a ~50-unit x range among
// themselves while sitting 60+ units away from the content column --
// wide enough to cover natural header-to-header variance, narrow enough
// to still exclude that content column.
const HEADER_X_TOLERANCE = 30;

// The most common font size across all blocks, used as the body-text
// baseline. Mode rather than mean/median: CVs mix many small font sizes
// (dates, meta text) that would skew an average downward.
function computeBodyFontSize(blocks: LayoutTextBlock[]): number {
  const counts = new Map<number, number>();

  for (const block of blocks) {
    counts.set(block.fontSize, (counts.get(block.fontSize) ?? 0) + 1);
  }

  let mode = 0;
  let modeCount = 0;
  for (const [size, count] of counts) {
    if (count > modeCount) {
      mode = size;
      modeCount = count;
    }
  }

  return mode;
}

// The font size used for section headers, distinct from the (usually
// larger) size used for the candidate's name at the very top of the
// document. A name is a one-off: it appears once, often as the single
// largest size in the file. Section headers recur -- one per section --
// so a larger-than-body size that appears at least twice is a much
// better estimate of "the header tier" than "anything bigger than body
// text," which would misclassify the name (and often the job title under
// it) as a section header.
//
// Among sizes that recur, the LARGEST is preferred, not the smallest:
// true section headers are the most visually prominent recurring tier.
// A smaller size can recur too for incidental reasons (e.g. the same job
// title text appearing in a preamble line and again inside an experience
// entry at the same size) without being a header tier at all -- picking
// the largest recurring size avoids being misled by that coincidence.
// Falls back to the smallest larger size when nothing recurs (e.g. a CV
// with a single section).
function computeHeaderFontSize(blocks: LayoutTextBlock[], bodyFontSize: number): number | null {
  const counts = new Map<number, number>();

  for (const block of blocks) {
    if (block.fontSize > bodyFontSize) {
      counts.set(block.fontSize, (counts.get(block.fontSize) ?? 0) + 1);
    }
  }

  if (counts.size === 0) return null;

  const recurringSizes = [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([size]) => size);

  if (recurringSizes.length > 0) {
    return Math.max(...recurringSizes);
  }

  return Math.min(...counts.keys());
}

function looksLikeHeaderShape(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_HEADER_LENGTH;
}

export function detectSections(blocks: LayoutTextBlock[]): SectionDetectionResult {
  const bodyFontSize = computeBodyFontSize(blocks);
  const headerFontSize = computeHeaderFontSize(blocks, bodyFontSize);

  function isHeaderSized(block: LayoutTextBlock): boolean {
    return (
      headerFontSize !== null &&
      Math.abs(block.fontSize - headerFontSize) < FONT_SIZE_EPSILON &&
      looksLikeHeaderShape(block.text)
    );
  }

  // Confirmed headers are ones whose text actually matches the
  // dictionary -- a much stronger signal than font size alone. Their
  // x-positions define the trusted "margin column" range; a
  // header-sized-but-unmatched block (a real section using unusual
  // wording, or -- the bug this exists to prevent -- a same-size entry
  // line) only counts as a header candidate if it falls inside that
  // range too. With no confirmed headers to anchor on at all, there's no
  // position signal to cross-check against, so every header-sized block
  // is accepted as before.
  const confirmedHeaderXs = blocks
    .filter((block) => isHeaderSized(block) && matchSectionHeader(block.text) !== null)
    .map((block) => block.x);

  const trustedXRange =
    confirmedHeaderXs.length > 0
      ? {
          max: Math.max(...confirmedHeaderXs) + HEADER_X_TOLERANCE,
          min: Math.min(...confirmedHeaderXs) - HEADER_X_TOLERANCE,
        }
      : null;

  function isHeaderCandidate(block: LayoutTextBlock): boolean {
    if (!isHeaderSized(block)) return false;
    if (!trustedXRange) return true;
    return block.x >= trustedXRange.min && block.x <= trustedXRange.max;
  }

  const preamble: LayoutTextBlock[] = [];
  const sections: DetectedSection[] = [];
  const unmatched: UnmatchedSectionCandidate[] = [];
  let current: { blocks: LayoutTextBlock[]; headerBlock: LayoutTextBlock; key: SectionKey | null } | null = null;

  function flushCurrent() {
    if (!current) return;
    if (current.key) {
      sections.push({ blocks: current.blocks, headerBlock: current.headerBlock, key: current.key });
    } else {
      unmatched.push({ blocks: current.blocks, headerBlock: current.headerBlock });
    }
  }

  for (const block of blocks) {
    if (isHeaderCandidate(block)) {
      flushCurrent();
      current = { blocks: [], headerBlock: block, key: matchSectionHeader(block.text) };
      continue;
    }

    if (current) {
      current.blocks.push(block);
    } else {
      preamble.push(block);
    }
  }

  flushCurrent();

  return { preamble, sections, unmatched };
}
