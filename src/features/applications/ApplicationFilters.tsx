import { applicationStatusDetails } from "./applicationStatus";
import {
  applicationStatuses,
  type ApplicationStatus,
} from "./types";
import { useTranslation } from "../../i18n";

export type ApplicationStatusFilter = ApplicationStatus | "all";

type ApplicationFiltersProps = {
  onQueryChange: (query: string) => void;
  onReset: () => void;
  onStatusChange: (status: ApplicationStatusFilter) => void;
  query: string;
  status: ApplicationStatusFilter;
};

export function ApplicationFilters({
  onQueryChange,
  onReset,
  onStatusChange,
  query,
  status,
}: ApplicationFiltersProps) {
  const { t } = useTranslation();
  const hasActiveFilters = query.trim().length > 0 || status !== "all";

  return (
    <section
      aria-label={t("applications.filterSectionAria")}
      className="mb-6 rounded-card border border-line bg-surface p-4 shadow-card sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_13rem_auto] sm:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">
            {t("search.applications")}
          </span>
          <span className="relative block">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
            <input
              className="min-h-11 w-full rounded-xl border border-line bg-canvas py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={t("search.placeholder")}
              type="search"
              value={query}
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">
            {t("status.label")}
          </span>
          <select
            className="min-h-11 w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            onChange={(event) =>
              onStatusChange(event.target.value as ApplicationStatusFilter)
            }
            value={status}
          >
            <option value="all">{t("status.all")}</option>
            {applicationStatuses.map((applicationStatus) => (
              <option key={applicationStatus} value={applicationStatus}>
                {t(applicationStatusDetails[applicationStatus].labelKey)}
              </option>
            ))}
          </select>
        </label>

        <button
          className="min-h-11 rounded-full px-4 text-sm font-semibold text-brand-800 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!hasActiveFilters}
          onClick={onReset}
          type="button"
        >
          {t("filters.clear")}
        </button>
      </div>
    </section>
  );
}
