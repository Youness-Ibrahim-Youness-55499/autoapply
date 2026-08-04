import { useRef, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { useTranslation } from "../../../i18n";
import {
  acceptedDocumentTypes,
  documentCategories,
  documentCategoryLabelKeys,
  formatFileSize,
  maxDocumentSize,
  type DocumentCategory,
} from "../document.types";

type DocumentUploadProps = {
  isUploading: boolean;
  onUpload: (
    file: File,
    metadata: {
      category: DocumentCategory;
      displayName: string;
      notes: string;
    },
  ) => Promise<boolean>;
};

const inputClasses =
  "mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function DocumentUpload({
  isUploading,
  onUpload,
}: DocumentUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>("cv");
  const [displayName, setDisplayName] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) return;

    const uploaded = await onUpload(selectedFile, {
      category,
      displayName: displayName.trim() || selectedFile.name.replace(/\.[^.]+$/, ""),
      notes,
    });

    if (uploaded) {
      setSelectedFile(null);
      setCategory("cv");
      setDisplayName("");
      setNotes("");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section
      aria-labelledby="document-upload-title"
      className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8"
    >
      <p className="eyebrow">{t("documents.upload.eyebrow")}</p>
      <h2 className="mt-2 text-2xl font-semibold" id="document-upload-title">
        {t("documents.upload.title")}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
        {t("documents.upload.description")}
      </p>

      <form className="mt-6" onSubmit={handleSubmit}>
        <label className="block cursor-pointer rounded-xl border border-dashed border-brand-300 bg-brand-50/55 p-6 text-center transition hover:bg-brand-50">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-surface text-brand-800 shadow-sm">
            <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
              <path d="M12 16V5m0 0L8 9m4-4 4 4M5 15v4h14v-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </span>
          <span className="mt-4 block text-sm font-semibold">
            {selectedFile ? selectedFile.name : t("documents.upload.choosePlaceholder")}
          </span>
          <span className="mt-1 block text-xs text-ink-muted">
            {t("documents.upload.maxSize", { size: formatFileSize(maxDocumentSize) })}
          </span>
          <input
            accept={acceptedDocumentTypes.join(",")}
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
              if (file && !displayName) {
                setDisplayName(file.name.replace(/\.[^.]+$/, ""));
              }
            }}
            ref={inputRef}
            type="file"
          />
        </label>

        {selectedFile && (
          <div className="mt-4 rounded-xl border border-line bg-canvas p-4">
            <div className="min-w-0 border-b border-line pb-4">
              <p className="truncate text-sm font-semibold">{selectedFile.name}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                {t("documents.upload.displayNameLabel")}
                <input
                  className={inputClasses}
                  maxLength={160}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                  value={displayName}
                />
              </label>
              <label className="text-sm font-semibold">
                {t("documents.upload.categoryLabel")}
                <select
                  className={inputClasses}
                  onChange={(event) =>
                    setCategory(event.target.value as DocumentCategory)
                  }
                  value={category}
                >
                  {documentCategories.map((value) => (
                    <option key={value} value={value}>
                      {t(documentCategoryLabelKeys[value])}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-4 block text-sm font-semibold">
              {t("documents.upload.notesLabel")}{" "}
              <span className="font-normal text-ink-muted">{t("documents.upload.notesOptional")}</span>
              <textarea
                className={`${inputClasses} min-h-24 py-3`}
                maxLength={5000}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t("documents.upload.notesPlaceholder")}
                value={notes}
              />
            </label>
            <div className="mt-4 flex justify-end">
              <Button disabled={isUploading || !displayName.trim()} type="submit">
                {isUploading ? t("documents.upload.submitting") : t("documents.upload.submit")}
              </Button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}
