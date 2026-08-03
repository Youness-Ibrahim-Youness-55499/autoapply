// Shared ExtractedField<T> builder for every extractor in this pipeline
// (contact/skill/experience/education). Extracted after the same
// {confidence, extractionMethod, source, value} construction turned up,
// independently reimplemented, in four different files -- one of them
// even inlining the object literal directly rather than writing a local
// helper at all.

import type { LayoutTextBlock } from "../infrastructure/layout.ts";
import type { ExtractedField, ExtractionMethod, SourceRef } from "../domain/types.ts";
import { confidenceForMethod } from "../domain/rules.ts";

export function toSourceRef(block: LayoutTextBlock): SourceRef {
  return { blockId: block.blockId, page: block.page, x: block.x, y: block.y };
}

export function field<T>(
  value: T,
  block: LayoutTextBlock,
  method: ExtractionMethod,
  options?: { fuzzyScore?: number },
): ExtractedField<T> {
  return {
    confidence: confidenceForMethod(method, options),
    extractionMethod: method,
    source: toSourceRef(block),
    value,
  };
}
