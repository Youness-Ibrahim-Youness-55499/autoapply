import { useRef, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { useTranslation } from "../../../i18n";
import { acceptedDocumentTypes } from "../../documents/document.types";
import { useDocuments } from "../../documents/useDocuments";

type StepUploadCvProps = {
  onContinue: () => void;
  onSkip: () => void;
};

export function StepUploadCv({ onContinue, onSkip }: StepUploadCvProps) {
  const { t } = useTranslation();
  const { actionErrorMessage, isUploading, uploadDocument } = useDocuments();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleUpload() {
    if (!selectedFile) return;

    const uploaded = await uploadDocument(selectedFile, {
      category: "cv",
      displayName: selectedFile.name.replace(/\.[^.]+$/, ""),
      notes: "",
    });

    if (uploaded) onContinue();
  }

  return (
    <div>
      <p className="eyebrow">{t("onboarding.upload.eyebrow")}</p>
      <h2 className="mt-2 text-2xl font-semibold">{t("onboarding.upload.title")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {t("onboarding.upload.description")}
      </p>

      <label className="mt-6 block cursor-pointer rounded-xl border border-dashed border-brand-300 bg-brand-50/55 p-6 text-center transition hover:bg-brand-50">
        <span className="mx-auto grid size-11 place-items-center rounded-xl bg-surface text-brand-800 shadow-sm">
          <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
            <path d="M12 16V5m0 0L8 9m4-4 4 4M5 15v4h14v-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
        </span>
        <span className="mt-4 block text-sm font-semibold">
          {selectedFile ? selectedFile.name : t("onboarding.upload.choosePlaceholder")}
        </span>
        <input
          accept={acceptedDocumentTypes.join(",")}
          className="sr-only"
          disabled={isUploading}
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          ref={inputRef}
          type="file"
        />
      </label>

      {actionErrorMessage && (
        <p
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {actionErrorMessage}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button disabled={isUploading} onClick={onSkip} type="button" variant="secondary">
          {t("onboarding.skip")}
        </Button>
        <Button disabled={isUploading || !selectedFile} onClick={() => void handleUpload()}>
          {isUploading ? t("onboarding.upload.uploading") : t("onboarding.continue")}
        </Button>
      </div>
    </div>
  );
}
