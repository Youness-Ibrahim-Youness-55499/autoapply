import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { useTranslation } from "../../../i18n";
import {
  documentCategoryLabelKeys,
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
};

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
}: DocumentListProps) {
  const { t } = useTranslation();
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
          <p className="eyebrow">{t("documents.list.eyebrow")}</p>
          <h2 className="mt-2 text-xl font-semibold" id="document-list-title">
            {t("documents.list.title")}
          </h2>
        </div>
        <p className="text-sm font-semibold text-ink-muted">
          {t(documents.length === 1 ? "documents.list.countOne" : "documents.list.countOther", {
            count: documents.length,
          })}
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
                        {t("documents.list.defaultCv")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    {t(documentCategoryLabelKeys[document.category])} ·{" "}
                    {formatFileSize(document.sizeBytes)} · {t("documents.list.uploaded")}{" "}
                    <time dateTime={document.createdAt}>
                      {dateFormatter.format(new Date(document.createdAt))}
                    </time>
                  </p>
                  {document.notes && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                      {document.notes}
                    </p>
                  )}
                </div>

                {!isConfirming ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={isBusy}
                      onClick={() => setEditingId(document.id)}
                      size="sm"
                      variant="secondary"
                    >
                      {t("documents.list.editDetails")}
                    </Button>
                    <Button
                      disabled={isBusy}
                      onClick={() => void onOpen(document)}
                      size="sm"
                      variant="secondary"
                    >
                      {isBusy ? t("documents.list.opening") : t("documents.list.open")}
                    </Button>
                    <Button
                      disabled={isBusy}
                      onClick={() => setConfirmingId(document.id)}
                      size="sm"
                      variant="quiet"
                    >
                      {t("documents.list.delete")}
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 sm:max-w-xs">
                    <p className="text-sm font-semibold text-red-900">
                      {t("documents.list.deleteConfirm")}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button disabled={isBusy} onClick={() => setConfirmingId("")} size="sm" variant="secondary">
                        {t("documents.list.keep")}
                      </Button>
                      <Button disabled={isBusy} onClick={() => void confirmDelete(document)} size="sm" variant="danger">
                        {isBusy ? t("documents.list.deleting") : t("documents.list.delete")}
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
