import { useRef, useState } from "react";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";

// Throwaway test harness for evaluating docling
// (https://github.com/docling-project/docling) as a CV-parsing engine.
// Talks directly to a local docling-serve instance -- see
// docling-service/README.md for how to run it. Nothing here touches
// Supabase or any real document storage; uploads exist only in the
// browser for the duration of the request. English-only and
// intentionally unstyled-to-match-the-rest-of-the-app since this is a
// scratch page for evaluating the library, not a shipped feature.

const DOCLING_SERVE_URL = "http://localhost:5001/v1/convert/file";

type DoclingResult = {
  document: {
    json_content: unknown;
    md_content: string;
  };
  errors: unknown[];
  processing_time: number;
  status: string;
};

type OutputView = "json" | "markdown";

export function DoclingTestPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<DoclingResult | null>(null);
  const [outputView, setOutputView] = useState<OutputView>("markdown");

  async function handleProcess() {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage("");
    setResult(null);

    const formData = new FormData();
    formData.append("files", selectedFile);
    formData.append("to_formats", "md");
    formData.append("to_formats", "json");
    formData.append("do_ocr", "true");

    try {
      const response = await fetch(DOCLING_SERVE_URL, {
        body: formData,
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`docling-serve returned ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as DoclingResult;
      setResult(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `${error.message}. Is docling-serve running at ${DOCLING_SERVE_URL}? See docling-service/README.md.`
          : "Something went wrong talking to docling-serve.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
      <ProductPageHeader
        description="Test harness for evaluating docling as a CV-parsing engine. Requires a local docling-serve instance -- see docling-service/README.md."
        title="Docling test"
      />

      <div className="mt-8 max-w-4xl">
        <section className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
          <label className="block cursor-pointer rounded-xl border border-dashed border-brand-300 bg-brand-50/55 p-6 text-center transition hover:bg-brand-50">
            <span className="mx-auto grid size-11 place-items-center rounded-xl bg-surface text-brand-800 shadow-sm">
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
                <path d="M12 16V5m0 0L8 9m4-4 4 4M5 15v4h14v-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
            </span>
            <span className="mt-4 block text-sm font-semibold">
              {selectedFile ? selectedFile.name : "Choose a CV (PDF or DOCX)"}
            </span>
            <input
              accept=".pdf,.docx"
              className="sr-only"
              disabled={isProcessing}
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              ref={inputRef}
              type="file"
            />
          </label>

          <div className="mt-4 flex justify-end">
            <Button disabled={isProcessing || !selectedFile} onClick={() => void handleProcess()}>
              {isProcessing ? "Processing with docling…" : "Process with docling"}
            </Button>
          </div>

          {isProcessing && (
            <p className="mt-3 text-sm text-ink-muted">
              First run downloads model weights and can take a few minutes; later runs are much faster.
            </p>
          )}

          {errorMessage && (
            <p
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {errorMessage}
            </p>
          )}
        </section>

        {result && (
          <section className="mt-6 rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    result.status === "success"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.status}
                </span>
                <span className="text-ink-muted">
                  {result.processing_time.toFixed(2)}s
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setOutputView("markdown")}
                  size="sm"
                  variant={outputView === "markdown" ? "primary" : "secondary"}
                >
                  Markdown
                </Button>
                <Button
                  onClick={() => setOutputView("json")}
                  size="sm"
                  variant={outputView === "json" ? "primary" : "secondary"}
                >
                  JSON
                </Button>
              </div>
            </div>

            {result.errors.length > 0 && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {JSON.stringify(result.errors)}
              </p>
            )}

            <pre className="mt-4 max-h-[70vh] overflow-auto rounded-xl border border-line bg-canvas p-4 text-xs leading-relaxed whitespace-pre-wrap">
              {outputView === "markdown"
                ? result.document.md_content
                : JSON.stringify(result.document.json_content, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </PageContainer>
  );
}
