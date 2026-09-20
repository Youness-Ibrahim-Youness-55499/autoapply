import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MatchRing } from "../components/app/MatchRing";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  LocationIcon,
  SalaryIcon,
  SearchIcon,
  SupportIcon,
  WorkplaceIcon,
} from "../components/icons/BrandIcons";
import { Logo } from "../components/Logo";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { ErrorState } from "../components/states/ErrorState";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DemoBadge } from "../components/ui/DemoBadge";
import { useApplications } from "../features/applications/useApplications";
import { JobFilters } from "../features/jobs/JobFilters";
import {
  createEmptyJobFilters,
  hasActiveJobFilters,
  jobMatchesFilters,
  type JobFilterState,
} from "../features/jobs/jobFilterState";
import { matchJob } from "../features/jobs/matchJob";
import { matchLabelKey } from "../features/jobs/matchLabel";
import { mockJobs } from "../features/jobs/mockJobs";
import {
  MAX_SAVED_SEARCHES,
  createSavedSearch,
  deserializeFilters,
  loadSavedSearches,
  persistSavedSearches,
  savedSearchParts,
  type SavedSearch,
} from "../features/jobs/savedSearches";
import { useJobApplications } from "../features/jobs/useJobApplications";
import { useProfile } from "../features/profile/useProfile";
import { useTranslation } from "../i18n";

type SortMode = "match" | "salary";

const PAGE_SIZE = 8;
const VISIBLE_TAGS = 3;

const allLocations = Array.from(new Set(mockJobs.map((job) => job.location))).sort((a, b) =>
  a.localeCompare(b),
);

function companyInitials(company: string) {
  return company
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function JobsPage() {
  const { t } = useTranslation();
  const { applications, refresh } = useApplications();
  const { errorMessage, pendingJobId, statusFor, track } = useJobApplications(applications);

  const [filters, setFilters] = useState<JobFilterState>(createEmptyJobFilters);
  const [queryDraft, setQueryDraft] = useState("");
  const [locationDraft, setLocationDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState({ location: "", query: "" });
  const [sortMode, setSortMode] = useState<SortMode>("match");
  const [page, setPage] = useState(1);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(loadSavedSearches);
  const { profile } = useProfile();

  useEffect(() => {
    setPage(1);
  }, [appliedSearch, filters, sortMode]);

  const hasActiveSearch =
    appliedSearch.query.length > 0 || appliedSearch.location !== "" || hasActiveJobFilters(filters);

  function saveCurrentSearch() {
    if (savedSearches.length >= MAX_SAVED_SEARCHES) return;
    const next = [createSavedSearch(appliedSearch.query, appliedSearch.location, filters), ...savedSearches];
    setSavedSearches(next);
    persistSavedSearches(next);
  }

  function removeSavedSearch(id: string) {
    const next = savedSearches.filter((search) => search.id !== id);
    setSavedSearches(next);
    persistSavedSearches(next);
  }

  function applySavedSearch(search: SavedSearch) {
    setFilters(deserializeFilters(search.filters));
    setQueryDraft(search.query);
    setLocationDraft(search.location);
    setAppliedSearch({ location: search.location, query: search.query });
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch({ location: locationDraft, query: queryDraft.trim().toLowerCase() });
  }

  function clearAll() {
    setFilters(createEmptyJobFilters());
    setQueryDraft("");
    setLocationDraft("");
    setAppliedSearch({ location: "", query: "" });
  }

  const rankedJobs = useMemo(() => {
    return mockJobs
      .filter((job) => {
        const matchesQuery =
          appliedSearch.query.length === 0 ||
          [job.title, job.company, job.location, ...job.tags]
            .join(" ")
            .toLowerCase()
            .includes(appliedSearch.query);
        const matchesLocation = appliedSearch.location === "" || job.location === appliedSearch.location;

        return matchesQuery && matchesLocation && jobMatchesFilters(job, filters);
      })
      .map((job) => ({ job, match: matchJob(job, profile) }))
      .sort((a, b) =>
        sortMode === "salary" ? b.job.salaryMax - a.job.salaryMax : b.match.percent - a.match.percent,
      );
  }, [appliedSearch, filters, profile, sortMode]);

  const totalPages = Math.max(1, Math.ceil(rankedJobs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageJobs = rankedJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const usesPlaceholderScores = profile.skills.length === 0;

  const insights = useMemo(() => {
    const counts = new Map<string, number>();
    let salaryTotal = 0;
    for (const { job } of rankedJobs) {
      salaryTotal += (job.salaryMin + job.salaryMax) / 2;
      for (const tag of job.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    const topSkills = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5);
    const averageSalary = rankedJobs.length > 0 ? Math.round(salaryTotal / rankedJobs.length / 1000) : 0;

    return { averageSalary, topSkills };
  }, [rankedJobs]);

  async function handleSave(jobId: string) {
    const job = mockJobs.find((item) => item.id === jobId);
    if (!job) return;
    const success = await track(job, "saved");
    if (success) refresh();
  }

  return (
    <>
      <Seo description={t("jobs.description")} noIndex path="/app/jobs" title={t("jobs.title")} />
      <PageContainer className="py-6 sm:py-8 lg:px-8" size="wide">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t("jobs.title")}</h1>
            <p className="mt-1 text-sm text-ink-muted">{t("jobs.description")}</p>
          </div>

          <form className="flex w-full max-w-3xl flex-wrap items-stretch gap-3 sm:flex-nowrap lg:w-auto lg:flex-1" onSubmit={handleSearch}>
            <div className="flex min-h-12 flex-1 items-center rounded-card border border-line bg-surface shadow-card">
              <label className="flex flex-1 items-center gap-2.5 px-4">
                <SearchIcon className="size-5 shrink-0 text-ink-muted" />
                <input
                  className="w-full min-w-0 border-none bg-transparent text-sm outline-none placeholder:text-ink-muted"
                  onChange={(event) => setQueryDraft(event.target.value)}
                  placeholder={t("jobs.searchPlaceholder")}
                  value={queryDraft}
                />
              </label>
              <span aria-hidden="true" className="h-6 w-px bg-line" />
              <label className="flex items-center gap-2 px-4">
                <LocationIcon className="size-5 shrink-0 text-ink" />
                <select
                  aria-label={t("jobs.locationAria")}
                  className="cursor-pointer appearance-none border-none bg-transparent pr-1 text-sm font-medium outline-none"
                  onChange={(event) => setLocationDraft(event.target.value)}
                  value={locationDraft}
                >
                  <option value="">{t("jobs.allLocations")}</option>
                  {allLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="size-4 shrink-0 text-ink-muted" />
              </label>
            </div>
            <Button className="min-h-12 shrink-0 px-6" size="lg" type="submit">
              {t("jobs.findJobs")}
              <ArrowRightIcon className="size-4" />
            </Button>
          </form>
        </div>

        {errorMessage && (
          <div className="mt-4">
            <ErrorState compact description={errorMessage} title={t("jobs.errorTitle")} />
          </div>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <JobFilters filters={filters} jobs={mockJobs} onChange={setFilters} onClear={clearAll} />

            <Card padding="sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold">{t("jobs.insights.title")}</h2>
                <DemoBadge />
              </div>
              {rankedJobs.length === 0 ? (
                <p className="text-xs text-ink-muted">{t("jobs.insights.empty")}</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xl font-extrabold">{rankedJobs.length}</p>
                      <p className="text-[0.6875rem] font-semibold text-ink-muted">{t("jobs.insights.jobs")}</p>
                    </div>
                    <div>
                      <p className="text-xl font-extrabold">€{insights.averageSalary}K</p>
                      <p className="text-[0.6875rem] font-semibold text-ink-muted">{t("jobs.insights.avgSalary")}</p>
                    </div>
                  </div>
                  <p className="mb-2 mt-4 text-xs font-bold text-ink-muted">{t("jobs.insights.topSkills")}</p>
                  <ul className="space-y-2">
                    {insights.topSkills.map(([skill, count]) => (
                      <li key={skill}>
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{skill}</span>
                          <span className="text-ink-muted">{count}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-100">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${(count / rankedJobs.length) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>

            <div className="soft-card relative overflow-hidden rounded-card border border-line p-5">
              <p className="text-3xl font-extrabold leading-[1.05] tracking-tight">
                Apply
                <br />
                <span className="text-brand-600">Further.</span>
              </p>
              <p className="mt-3 max-w-[9rem] text-xs text-ink-muted">{t("jobs.promo")}</p>
              <Logo className="absolute right-3 top-4 h-16" variant="icon" />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-bold">
                {t(rankedJobs.length === 1 ? "jobs.countOne" : "jobs.countOther", {
                  count: rankedJobs.length,
                })}
              </p>
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                {t("jobs.sortBy")}
                <select
                  className="cursor-pointer rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none"
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  value={sortMode}
                >
                  <option value="match">{t("jobs.sort.match")}</option>
                  <option value="salary">{t("jobs.sort.salary")}</option>
                </select>
              </label>
            </div>

            {(savedSearches.length > 0 || hasActiveSearch) && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {savedSearches.length > 0 && (
                  <span className="text-xs font-bold text-ink-muted">{t("jobs.savedSearches.title")}</span>
                )}
                {savedSearches.map((search) => {
                  const name = savedSearchParts(search).slice(0, 3).join(" · ") || t("jobs.savedSearches.untitled");

                  return (
                    <span
                      className="inline-flex items-center overflow-hidden rounded-full border border-line bg-surface text-xs font-semibold"
                      key={search.id}
                    >
                      <button
                        aria-label={t("jobs.savedSearches.apply", { name })}
                        className="px-3 py-1.5 transition hover:bg-brand-50"
                        onClick={() => applySavedSearch(search)}
                        type="button"
                      >
                        {name}
                      </button>
                      <button
                        aria-label={t("jobs.savedSearches.remove", { name })}
                        className="border-l border-line px-2 py-1.5 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeSavedSearch(search.id)}
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
                {hasActiveSearch && savedSearches.length < MAX_SAVED_SEARCHES && (
                  <button
                    className="rounded-full border border-dashed border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-800 transition hover:bg-brand-50"
                    onClick={saveCurrentSearch}
                    type="button"
                  >
                    + {t("jobs.savedSearches.save")}
                  </button>
                )}
                {hasActiveSearch && savedSearches.length >= MAX_SAVED_SEARCHES && (
                  <span className="text-xs text-ink-muted">
                    {t("jobs.savedSearches.full", { count: MAX_SAVED_SEARCHES })}
                  </span>
                )}
              </div>
            )}

            {usesPlaceholderScores && <p className="mb-3 text-xs text-ink-muted">{t("jobs.matchHint")}</p>}

            <div className="space-y-3">
              {pageJobs.map(({ job, match }) => {
                const status = statusFor(job);
                const isPending = pendingJobId === job.id;

                return (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-card border border-line bg-surface p-4 sm:p-5" key={job.id}>
                    <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-line bg-canvas text-lg font-extrabold text-ink">
                      {companyInitials(job.company)}
                    </span>

                    <div className="min-w-0 flex-1 basis-64">
                      <h3 className="text-base font-bold">{job.title}</h3>
                      <p className="text-sm font-semibold text-ink-muted">{job.company}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
                        <span className="inline-flex items-center gap-1">
                          <LocationIcon className="size-4" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <WorkplaceIcon className="size-4" />
                          {job.workMode}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <SalaryIcon className="size-4" />
                          €{Math.round(job.salaryMin / 1000)}K – €{Math.round(job.salaryMax / 1000)}K
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{job.description}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {job.tags.slice(0, VISIBLE_TAGS).map((tag) => (
                          <span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-ink" key={tag}>
                            {tag}
                          </span>
                        ))}
                        {job.tags.length > VISIBLE_TAGS && (
                          <span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-ink-muted">
                            {t("jobs.moreTags", { count: job.tags.length - VISIBLE_TAGS })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <MatchRing percent={match.percent} />
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-brand-700">{t(matchLabelKey(match.percent))}</p>
                        {!match.isPlaceholder && (
                          <ul className="space-y-0.5 font-medium text-ink-muted">
                            <li className="flex items-center gap-1.5">
                              <span aria-hidden="true" className={match.matchedSkills.length > 0 ? "text-brand-600" : "text-amber-500"}>
                                {match.matchedSkills.length > 0 ? "✓" : "!"}
                              </span>
                              {t("jobs.fit.skills")}
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span aria-hidden="true" className={match.locationFit ? "text-brand-600" : "text-amber-500"}>
                                {match.locationFit ? "✓" : "!"}
                              </span>
                              {t("jobs.fit.location")}
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span aria-hidden="true" className={match.missingSkills.length === 0 ? "text-brand-600" : "text-amber-500"}>
                                {match.missingSkills.length === 0 ? "✓" : "!"}
                              </span>
                              {match.missingSkills.length === 0
                                ? t("jobs.fit.noGaps")
                                : t(match.missingSkills.length === 1 ? "jobs.fit.gapOne" : "jobs.fit.gapOther", {
                                    count: match.missingSkills.length,
                                  })}
                            </li>
                          </ul>
                        )}
                      </div>
                    </div>

                    <button
                      aria-label={t("jobs.saveAria", { title: job.title })}
                      aria-pressed={status === "saved"}
                      className={`grid size-10 shrink-0 place-items-center rounded-full border transition ${
                        status === "saved"
                          ? "border-red-200 bg-red-50 text-red-500"
                          : "border-line bg-surface text-ink-muted hover:bg-canvas"
                      }`}
                      disabled={isPending || status !== null}
                      onClick={() => void handleSave(job.id)}
                      type="button"
                    >
                      <SupportIcon className={status === "saved" ? "size-5 fill-current" : "size-5"} />
                    </button>

                    <Link
                      className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-brand-800 bg-[linear-gradient(180deg,#07825f,var(--color-brand-800))] px-5 button-text text-white shadow-button transition-colors duration-200 hover:brightness-105"
                      to={`/app/jobs/${job.id}`}
                    >
                      {t("jobs.viewJob")}
                      <ArrowRightIcon className="size-4" />
                    </Link>
                  </div>
                );
              })}

              {rankedJobs.length === 0 && (
                <div className="rounded-card border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-muted">
                  {t("jobs.noResults")}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <nav aria-label={t("jobs.pagination.aria")} className="mt-5 flex items-center justify-center gap-3">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  size="sm"
                  variant="secondary"
                >
                  {t("jobs.pagination.prev")}
                </Button>
                <span className="text-sm font-semibold text-ink-muted">
                  {t("jobs.pagination.page", { page: currentPage, total: totalPages })}
                </span>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  size="sm"
                  variant="secondary"
                >
                  {t("jobs.pagination.next")}
                </Button>
              </nav>
            )}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
