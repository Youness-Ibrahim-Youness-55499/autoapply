import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import {
  documentCategoryLabels,
  formatFileSize,
  type CandidateDocument,
  type DocumentMetadataInput,
} from "../document.types";
import { DocumentEditor } from "./DocumentEditor";

type DocumentListProps = {
  busyDocumentId: string;
  documents: CandidateDocument[];
  onDelete: (document: CandidateDocument) => Promise<boolean>;
  onEdit: (
    document: CandidateDocument,
    values: DocumentMetadataInput,
  ) => Promise<boolean>;
  onOpen: (document: CandidateDocument) => Promise<void>;
  onRetryExtraction: (document: CandidateDocument) => Promise<void>;
};

function ExtractionStatus({ document }: { document: CandidateDocument }) {
  if (document.category !== "cv") return null;

  if (document.processingStatus === "processing") {
    return (
      <p className="mt-2 text-xs font-semibold text-ink-muted">
        Reading your CV…
      </p>
    );
  }

  if (document.processingStatus === "failed") {
    return (
      <p className="mt-2 text-xs font-semibold text-red-700">
        Automatic reading failed. You can retry below.
      </p>
    );
  }

  if (document.processingStatus === "ready" && document.extraction) {
    const { educationCount, experienceCount, needsReview, skillsCount } = document.extraction;
    return (
      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-muted">
        <span>
          {experienceCount} experience · {educationCount} education · {skillsCount} skills found
        </span>
        {needsReview && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
            Needs review
          </span>
        )}
      </p>
    );
  }

  return null;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function DocumentList({
  busyDocumentId,
  documents,
  onDelete,
  onEdit,
  onOpen,
  onRetryExtraction,
}: DocumentListProps) {
  const [confirmingId, setConfirmingId] = useState("");
  const [editingId, setEditingId] = useState("");

  async function confirmDelete(document: CandidateDocument) {
    const deleted = await onDelete(document);
    if (deleted) setConfirmingId("");
  }

  return (
    <section aria-labelledby="document-list-title" className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your files</p>
          <h2 className="mt-2 text-xl font-semibold" id="document-list-title">
            Stored documents
          </h2>
        </div>
        <p className="text-sm font-semibold text-ink-muted">
          {documents.length} {documents.length === 1 ? "document" : "documents"}
        </p>
      </div>

      <ul className="mt-4 space-y-3">
        {documents.map((document) => {
          const isBusy = busyDocumentId === document.id;
          const isConfirming = confirmingId === document.id;

          return (
            <li
              className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
              key={document.id}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800">
                  <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
                    <path d="M7 3h7l4 4v14H7V3Zm7 0v5h4M10 13h5m-5 4h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  </svg>
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{document.displayName}</p>
                    {document.isDefault && (
                      <span className="rounded-full bg-brand-900 px-2.5 py-1 text-xs font-semibold text-white">
                        Default CV
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    {documentCategoryLabels[document.category]} ·{" "}
                    {formatFileSize(document.sizeBytes)} · Uploaded{" "}
                    <time dateTime={document.createdAt}>
                      {dateFormatter.format(new Date(document.createdAt))}
                    </time>
                  </p>
                  {document.notes && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                      {document.notes}
                    </p>
                  )}
                  <ExtractionStatus document={document} />
                </div>

                {!isConfirming ? (
                  <div className="flex flex-wrap gap-2">
                    {document.category === "cv" && document.processingStatus === "failed" && (
                      <Button
                        disabled={isBusy}
                        onClick={() => void onRetryExtraction(document)}
                        size="sm"
                        variant="secondary"
                      >
                        Retry reading
                      </Button>
                    )}
                    <Button
                      disabled={isBusy}
                      onClick={() => setEditingId(document.id)}
                      size="sm"
                      variant="secondary"
                    >
                      Edit details
                    </Button>
                    <Button
                      disabled={isBusy}
                      onClick={() => void onOpen(document)}
                      size="sm"
                      variant="secondary"
                    >
                      {isBusy ? "Opening..." : "Open"}
                    </Button>
                    <Button
                      disabled={isBusy}
                      onClick={() => setConfirmingId(document.id)}
                      size="sm"
                      variant="quiet"
                    >
                      Delete
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 sm:max-w-xs">
                    <p className="text-sm font-semibold text-red-900">
                      Delete this document permanently? Application links to it
                      will be cleared.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button disabled={isBusy} onClick={() => setConfirmingId("")} size="sm" variant="secondary">
                        Keep
                      </Button>
                      <Button disabled={isBusy} onClick={() => void confirmDelete(document)} size="sm" variant="danger">
                        {isBusy ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {editingId === document.id && (
                <DocumentEditor
                  document={document}
                  isSaving={isBusy}
                  onCancel={() => setEditingId("")}
                  onSave={onEdit}
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
