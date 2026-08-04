import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { useTranslation } from "../../../i18n";
import {
  documentCategories,
  documentCategoryLabelKeys,
  type CandidateDocument,
  type DocumentCategory,
  type DocumentMetadataInput,
} from "../document.types";

const inputClasses =
  "mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

type DocumentEditorProps = {
  document: CandidateDocument;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (
    document: CandidateDocument,
    values: DocumentMetadataInput,
  ) => Promise<boolean>;
};

export function DocumentEditor({
  document,
  isSaving,
  onCancel,
  onSave,
}: DocumentEditorProps) {
  const { t } = useTranslation();
  const [category, setCategory] = useState(document.category);
  const [displayName, setDisplayName] = useState(document.displayName);
  const [isDefault, setIsDefault] = useState(document.isDefault);
  const [notes, setNotes] = useState(document.notes);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSave(document, {
      category,
      displayName,
      isDefault: category === "cv" && isDefault,
      notes,
    });
    if (saved) onCancel();
  }

  return (
    <form
      className="mt-4 rounded-xl border border-brand-200 bg-brand-50/40 p-4"
      onSubmit={handleSubmit}
    >
      <fieldset disabled={isSaving}>
        <div className="grid gap-4 sm:grid-cols-2">
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
              onChange={(event) => {
                const nextCategory = event.target.value as DocumentCategory;
                setCategory(nextCategory);
                if (nextCategory !== "cv") setIsDefault(false);
              }}
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
            value={notes}
          />
        </label>

        {category === "cv" && (
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
            <input
              checked={isDefault}
              className="mt-0.5 size-4 accent-brand-900"
              onChange={(event) => setIsDefault(event.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="block font-semibold">{t("documents.editor.defaultCvLabel")}</span>
              <span className="mt-1 block text-ink-muted">
                {t("documents.editor.defaultCvDescription")}
              </span>
            </span>
          </label>
        )}
      </fieldset>

      <div className="mt-4 flex justify-end gap-3">
        <Button disabled={isSaving} onClick={onCancel} size="sm" variant="secondary">
          {t("documents.editor.cancel")}
        </Button>
        <Button disabled={isSaving || !displayName.trim()} size="sm" type="submit">
          {isSaving ? t("documents.editor.saving") : t("documents.editor.save")}
        </Button>
      </div>
    </form>
  );
}
