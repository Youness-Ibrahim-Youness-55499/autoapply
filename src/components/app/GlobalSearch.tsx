import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { applicationStatusDetails } from "../../features/applications/applicationStatus";
import type { Application } from "../../features/applications/types";
import { mockJobs } from "../../features/jobs/mockJobs";
import { useTranslation } from "../../i18n";
import { JobmanIcon } from "../icons/JobmanIcon";

const MAX_RESULTS = 5;

function matches(query: string, ...fields: string[]) {
  return fields.join(" ").toLowerCase().includes(query);
}

// Command-palette style search: an icon button (also Ctrl/Cmd+K and "/")
// opens an overlay that searches the jobs list and the user's applications.
export function GlobalSearch({ applications }: { applications: Application[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      } else if (event.key === "/" && !isTyping) {
        event.preventDefault();
        setIsOpen(true);
      } else if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
    else setQuery("");
  }, [isOpen]);

  const normalized = query.trim().toLowerCase();

  const jobResults = useMemo(
    () =>
      normalized
        ? mockJobs
            .filter((job) => matches(normalized, job.title, job.company, job.location, ...job.tags))
            .slice(0, MAX_RESULTS)
        : [],
    [normalized],
  );
  const applicationResults = useMemo(
    () =>
      normalized
        ? applications
            .filter((application) => matches(normalized, application.job_title, application.company_name, application.location ?? ""))
            .slice(0, MAX_RESULTS)
        : [],
    [applications, normalized],
  );

  function go(path: string) {
    setIsOpen(false);
    navigate(path);
  }

  return (
    <>
      <button
        aria-label={t("search.global")}
        className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-canvas text-ink-muted transition hover:bg-surface hover:text-ink"
        onClick={() => setIsOpen(true)}
        title={t("search.global")}
        type="button"
      >
        <JobmanIcon name="search" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[12vh] backdrop-blur-[2px]">
          <button aria-label={t("common.closeDialog")} className="absolute inset-0 cursor-default" onClick={() => setIsOpen(false)} type="button" />
          <div aria-label={t("search.global")} aria-modal="true" className="relative w-full max-w-xl overflow-hidden rounded-card border border-line bg-surface shadow-xl" role="dialog">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <JobmanIcon className="size-5 shrink-0 text-ink-muted" name="search" />
              <input
                className="min-h-14 w-full border-none bg-transparent text-sm outline-none placeholder:text-ink-muted"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("search.globalPlaceholder")}
                ref={inputRef}
                value={query}
              />
              <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[0.625rem] font-semibold text-ink-muted sm:block">Esc</kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {!normalized && <p className="px-3 py-6 text-center text-sm text-ink-muted">{t("search.globalHint")}</p>}

              {normalized && jobResults.length === 0 && applicationResults.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-ink-muted">{t("search.globalEmpty")}</p>
              )}

              {jobResults.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-muted">{t("search.groupJobs")}</p>
                  {jobResults.map((job) => (
                    <button
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-canvas"
                      key={job.id}
                      onClick={() => go(`/app/jobs/${job.id}`)}
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{job.title}</span>
                        <span className="block truncate text-xs text-ink-muted">{job.company} · {job.location}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {applicationResults.length > 0 && (
                <div>
                  <p className="px-3 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-muted">{t("search.groupApplications")}</p>
                  {applicationResults.map((application) => (
                    <button
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-canvas"
                      key={application.id}
                      onClick={() => go(`/app/applications#${application.id}`)}
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{application.job_title}</span>
                        <span className="block truncate text-xs text-ink-muted">{application.company_name}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold ${applicationStatusDetails[application.status].styles}`}>
                        {t(applicationStatusDetails[application.status].labelKey)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-line px-4 py-2.5 text-xs text-ink-muted">
              <Link className="font-semibold text-brand-700 hover:text-brand-800" onClick={() => setIsOpen(false)} to="/app/jobs">
                {t("search.browseJobs")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
