// Matches text against the controlled skill dictionary only -- exact
// match first, fuzzy (Levenshtein-ratio) match for typos/variants second.
// Nothing outside the dictionary is ever surfaced as a skill, per "nothing
// free-form is invented."

import type { LayoutTextBlock } from "../infrastructure/layout.ts";
import type { ExtractedField, ExtractionMethod } from "../domain/types.ts";
import { confidenceForMethod, normalizeForMatch, similarityRatio } from "../domain/rules.ts";
import { skillDictionary } from "../infrastructure/skillDictionary.ts";

// Skills are usually comma/bullet/pipe/slash-separated on one or more
// lines rather than one per LayoutTextBlock.
const SKILL_TOKEN_SPLIT = /[,;•|/]+/;
// Below this similarity, a "fuzzy" match is more likely a coincidence
// than a typo -- better to surface nothing than a wrong guess.
const MIN_FUZZY_SIMILARITY = 0.82;

type SkillMatch = {
  canonical: string;
  fuzzyScore?: number;
  method: ExtractionMethod;
};

function matchSkillToken(token: string): SkillMatch | null {
  const normalized = normalizeForMatch(token);
  if (!normalized) return null;

  for (const entry of skillDictionary) {
    if (entry.aliases.some((alias) => normalizeForMatch(alias) === normalized)) {
      return { canonical: entry.canonical, method: "dictionary-exact" };
    }
  }

  let best: { canonical: string; score: number } | null = null;
  for (const entry of skillDictionary) {
    for (const alias of entry.aliases) {
      const score = similarityRatio(normalized, normalizeForMatch(alias));
      if (score >= MIN_FUZZY_SIMILARITY && (!best || score > best.score)) {
        best = { canonical: entry.canonical, score };
      }
    }
  }

  return best ? { canonical: best.canonical, fuzzyScore: best.score, method: "dictionary-fuzzy" } : null;
}

export function extractSkills(blocks: LayoutTextBlock[]): ExtractedField<string>[] {
  const results: ExtractedField<string>[] = [];
  const seenCanonical = new Set<string>();

  for (const block of blocks) {
    const tokens = block.text
      .split(SKILL_TOKEN_SPLIT)
      .map((token) => token.trim())
      .filter(Boolean);

    for (const token of tokens) {
      const match = matchSkillToken(token);
      if (!match || seenCanonical.has(match.canonical)) {
        continue;
      }

      seenCanonical.add(match.canonical);
      results.push({
        confidence: confidenceForMethod(match.method, { fuzzyScore: match.fuzzyScore }),
        extractionMethod: match.method,
        source: { blockId: block.blockId, page: block.page, x: block.x, y: block.y },
        value: match.canonical,
      });
    }
  }

  return results;
}
