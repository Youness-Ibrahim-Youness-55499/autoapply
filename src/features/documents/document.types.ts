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

export type CandidateDocument = {
  category: DocumentCategory;
  createdAt: string;
  displayName: string;
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

