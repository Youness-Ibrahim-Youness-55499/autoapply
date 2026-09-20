import { useTranslation } from "../../i18n";

type ApplicationFiltersProps = {
  onQueryChange: (query: string) => void;
  onReset: () => void;
  query: string;
};

export function ApplicationFilters({
  onQueryChange,
  onReset,
  query,
}: ApplicationFiltersProps) {
  const { t } = useTranslation();
  const hasActiveFilters = query.trim().length > 0;

  return (
    <section
      aria-label={t("applications.filterSectionAria")}
      className="mb-6 rounded-card border border-line bg-surface p-4 shadow-card sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
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
