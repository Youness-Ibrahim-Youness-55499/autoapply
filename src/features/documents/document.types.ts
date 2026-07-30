export const acceptedDocumentTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const maxDocumentSize = 10 * 1024 * 1024;

export type DocumentStatus = "uploaded" | "processing" | "ready" | "failed";

export type CandidateDocument = {
  createdAt: string;
  id: string;
  mimeType: string;
  originalName: string;
  processingStatus: DocumentStatus;
  sizeBytes: number;
  storagePath: string;
};

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
