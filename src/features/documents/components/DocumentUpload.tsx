import { useRef, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import {
  acceptedDocumentTypes,
  formatFileSize,
  maxDocumentSize,
} from "../document.types";

type DocumentUploadProps = {
  isUploading: boolean;
  onUpload: (file: File) => Promise<boolean>;
};

export function DocumentUpload({
  isUploading,
  onUpload,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) return;

    const uploaded = await onUpload(selectedFile);

    if (uploaded) {
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section
      aria-labelledby="document-upload-title"
      className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8"
    >
      <p className="eyebrow">Private source file</p>
      <h2 className="mt-2 text-2xl font-semibold" id="document-upload-title">
        Upload your CV
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Files are stored in your private workspace. Autoapply does not make them
        public or submit them anywhere.
      </p>

      <form className="mt-6" onSubmit={handleSubmit}>
        <label className="block cursor-pointer rounded-xl border border-dashed border-brand-300 bg-brand-50/55 p-6 text-center transition hover:bg-brand-50">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-surface text-brand-800 shadow-sm">
            <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
              <path d="M12 16V5m0 0L8 9m4-4 4 4M5 15v4h14v-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </span>
          <span className="mt-4 block text-sm font-semibold">
            {selectedFile ? selectedFile.name : "Choose a PDF or DOCX file"}
          </span>
          <span className="mt-1 block text-xs text-ink-muted">
            Maximum size {formatFileSize(maxDocumentSize)}
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

        {selectedFile && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{selectedFile.name}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <Button disabled={isUploading} type="submit">
              {isUploading ? "Uploading..." : "Upload securely"}
            </Button>
          </div>
        )}
      </form>
    </section>
  );
}
