// Domain contract for deterministic CV extraction. Pure types only -- no
// I/O, no framework imports, no Deno-specific APIs. This is the ONLY shape
// the rest of the pipeline (and eventually the frontend) should depend on;
// never pass raw parser output upward past the application layer.

export type Confidence = "high" | "medium" | "low";

// Controlled union rather than a free string, so confidenceForMethod (see
// rules.ts) can exhaustively map every case at the type level.
export type ExtractionMethod =
  | "dictionary-exact"
  | "dictionary-fuzzy"
  | "layout-heuristic"
  | "regex-exact"
  | "regex-fuzzy"
  | "unmatched";

export type SourceRef = {
  blockId: string;
  page: number;
  x: number;
  y: number;
};

export type ExtractedField<T> = {
  confidence: Confidence;
  extractionMethod: ExtractionMethod;
  source: SourceRef;
  value: T;
};

export type ExtractedExperience = {
  bullets: ExtractedField<string>[];
  company: ExtractedField<string>;
  endDate: ExtractedField<string | null>;
  // Distinguishes "ongoing role, no end date because it's the present
  // job" from "an end date exists but could not be parsed" -- the two
  // are otherwise indistinguishable if endDate.value is just `null`.
  isCurrent: boolean;
  role: ExtractedField<string>;
  startDate: ExtractedField<string | null>;
};

export type ExtractedEducation = {
  degree: ExtractedField<string> | null;
  endDate: ExtractedField<string | null>;
  fieldOfStudy: ExtractedField<string> | null;
  institution: ExtractedField<string>;
  isCurrent: boolean;
  startDate: ExtractedField<string | null>;
};

export type UnmatchedSection = {
  header: string;
  rawText: string;
};

export type ExtractedCV = {
  contact: {
    email: ExtractedField<string> | null;
    links: ExtractedField<string>[];
    phone: ExtractedField<string> | null;
  };
  education: ExtractedEducation[];
  experience: ExtractedExperience[];
  needsReview: boolean;
  skills: ExtractedField<string>[];
  unmatchedSections: UnmatchedSection[];
};
