export const acceptedDocumentTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const maxDocumentSize = 10 * 1024 * 1024;

export type DocumentStatus = "uploaded" | "processing" | "ready" | "failed";
export const documentCategories = [
  "cv",
  "cover_letter",
  "certificate",
  "reference",
] as const;
export type DocumentCategory = (typeof documentCategories)[number];

// A lightweight summary derived from the extract-cv Edge Function's
// output, not the full ExtractedCV contract (see
// supabase/functions/extract-cv/domain/types.ts) -- the frontend only
// needs enough to show "N entries found, needs review or not," not every
// field. Kept as its own type rather than importing the Edge Function's
// domain type directly: that file targets Deno, this one targets the
// browser/Vite build, and treating structured_data as untyped JSON to be
// validated at the boundary matches how every other Supabase response in
// this codebase is handled (see normalizeDocument below).
export type CvExtractionSummary = {
  educationCount: number;
  experienceCount: number;
  needsReview: boolean;
  skillsCount: number;
};

export type CandidateDocument = {
  category: DocumentCategory;
  createdAt: string;
  displayName: string;
  extraction: CvExtractionSummary | null;
  // Not persisted -- only populated in local state right after a
  // triggerExtraction() call fails, so the user (or developer) sees why
  // instead of just "failed." Lost on reload, same as any other local-
  // only UI state; the durable signal is processingStatus.
  extractionError: string;
  id: string;
  isDefault: boolean;
  mimeType: string;
  notes: string;
  originalName: string;
  processingStatus: DocumentStatus;
  sizeBytes: number;
  storagePath: string;
};

export type DocumentMetadataInput = {
  category: DocumentCategory;
  displayName: string;
  isDefault: boolean;
  notes: string;
};

export const documentCategoryLabels: Record<DocumentCategory, string> = {
  certificate: "Certificate",
  cover_letter: "Cover letter",
  cv: "CV",
  reference: "Reference",
};

export function isDocumentCategory(value: unknown): value is DocumentCategory {
  return (
    typeof value === "string" &&
    documentCategories.includes(value as DocumentCategory)
  );
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
