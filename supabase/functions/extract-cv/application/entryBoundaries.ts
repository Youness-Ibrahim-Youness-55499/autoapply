// Shared entry-boundary finder for experienceExtractor.ts and
// educationExtractor.ts. A parseable date range is the strongest, most
// reliable per-entry boundary signal (see both extractors); this finds
// each date line and attaches the adjacent header content (role/company,
// or institution/degree) to it.
//
// The header can sit either immediately BEFORE the date or immediately
// AFTER it -- confirmed necessary against a real CV that used "date,
// then role line" for its Experience section while using "institution
// line, then date" for Education, in the SAME document. "Before" is
// tried first (the more common convention); "after" is only tried when
// "before" comes up empty, e.g. because the line immediately preceding
// the date is a bullet point from the previous entry, not this entry's
// header.
//
// Bullet-marker-prefixed lines are never treated as header content --
// without that check, scanning backward from a date line would
// sometimes grab the PREVIOUS entry's trailing bullet as if it were
// THIS entry's role/company line, which is exactly the failure mode
// this was built to fix.
//
// That check alone isn't enough, though: when a bullet's text wraps
// onto a second visual line, that continuation line carries no marker
// of its own (only the bullet's first line does) -- confirmed against a
// real CV where a wrapped bullet tail ("Git." continuing "...DOORS,")
// was mistaken for the NEXT entry's header. isContinuationOfBullet walks
// backward from a candidate line to check whether it traces back to an
// actual bullet marker before hitting a date or already-claimed line --
// if so, the candidate is part of that bullet's wrapped text, not a
// header, regardless of lacking a marker itself.

import type { LayoutTextBlock } from "../infrastructure/layout.ts";
import { parseDateRange } from "../domain/rules.ts";

const MAX_HEADER_LINES = 2;
const BULLET_MARKER = /^[•\-*▪‣◦]\s*/;

export type EntryBoundary = {
  dateIndex: number;
  // Sorted ascending. Either all indices are < dateIndex (header before
  // the date) or all are > dateIndex (header after) -- never a mix,
  // since both scan directions stop at the first date/bullet/claimed
  // line they hit.
  headerIndices: number[];
};

function hasDateRange(text: string): boolean {
  const range = parseDateRange(text);
  return range.start !== null || range.end !== null || range.isCurrent;
}

export function isBulletLine(text: string): boolean {
  return BULLET_MARKER.test(text.trim());
}

// True if `index` is itself unmarked but traces back to a real bullet
// marker without crossing a date line or an already-claimed index --
// i.e. it's the wrapped tail of a bullet, not standalone content.
function isContinuationOfBullet(blocks: LayoutTextBlock[], index: number, claimed: Set<number>): boolean {
  let cursor = index - 1;

  while (cursor >= 0 && !claimed.has(cursor) && !hasDateRange(blocks[cursor].text)) {
    if (isBulletLine(blocks[cursor].text)) {
      return true;
    }
    cursor--;
  }

  return false;
}

export function findEntryBoundaries(blocks: LayoutTextBlock[]): EntryBoundary[] {
  const dateIndices: number[] = [];
  blocks.forEach((block, index) => {
    if (hasDateRange(block.text)) {
      dateIndices.push(index);
    }
  });

  const claimed = new Set<number>(dateIndices);
  const boundaries: EntryBoundary[] = [];

  for (const dateIndex of dateIndices) {
    const headerIndices: number[] = [];

    let cursor = dateIndex - 1;
    while (
      headerIndices.length < MAX_HEADER_LINES &&
      cursor >= 0 &&
      !claimed.has(cursor) &&
      !hasDateRange(blocks[cursor].text) &&
      !isBulletLine(blocks[cursor].text) &&
      !isContinuationOfBullet(blocks, cursor, claimed)
    ) {
      headerIndices.unshift(cursor);
      cursor--;
    }

    if (headerIndices.length === 0) {
      cursor = dateIndex + 1;
      while (
        headerIndices.length < MAX_HEADER_LINES &&
        cursor < blocks.length &&
        !claimed.has(cursor) &&
        !hasDateRange(blocks[cursor].text) &&
        !isBulletLine(blocks[cursor].text) &&
        !isContinuationOfBullet(blocks, cursor, claimed)
      ) {
        headerIndices.push(cursor);
        cursor++;
      }
    }

    headerIndices.forEach((index) => claimed.add(index));
    boundaries.push({ dateIndex, headerIndices });
  }

  return boundaries;
}

// The full contiguous range of indices this boundary occupies (its date
// plus whichever side its header landed on), used by callers to figure
// out which blocks fall between one entry and the next.
export function boundarySpan(boundary: EntryBoundary): { end: number; start: number } {
  const indices = [boundary.dateIndex, ...boundary.headerIndices];
  return { end: Math.max(...indices), start: Math.min(...indices) };
}
