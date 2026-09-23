import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { MatchRing } from "../components/app/MatchRing";
import { BarChart } from "../components/charts/BarChart";
import {
  BookmarkIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CloseIcon,
  SearchIcon,
  SparkleIcon,
} from "../components/icons/BrandIcons";
import { PageContainer } from "../components/layout/PageContainer";
import { Seo } from "../components/Seo";
import { ErrorState } from "../components/states/ErrorState";
import { ArrowLink } from "../components/ui/ArrowLink";
import { Card } from "../components/ui/Card";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { DemoBadge } from "../components/ui/DemoBadge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useToast } from "../components/ui/Toast";
import { buildWeeklyActivity, sum } from "../features/applications/activityStats";
import { applicationStatusDetails } from "../features/applications/applicationStatus";
import { useWorkspaceEvents } from "../features/applications/useWorkspaceEvents";
import { useApplications } from "../features/applications/useApplications";
import { pickQuoteIndex } from "../features/dashboard/motivationalQuote";
import { loadDismissedJobIds, persistDismissedJobIds } from "../features/jobs/dismissedJobs";
import { createEmptyJobFilters, jobMatchesFilters, type JobFilterState } from "../features/jobs/jobFilterState";
import { matchJob } from "../features/jobs/matchJob";
import { matchLabelKey } from "../features/jobs/matchLabel";
import {
  allJobLocations,
  experienceLevels,
  jobTypes,
  jobWorkModes,
  mockJobs,
  type MockJob,
} from "../features/jobs/mockJobs";
import { useJobApplications, type TrackableJob } from "../features/jobs/useJobApplications";
import { useRecommendedJobs } from "../features/jobs/useRecommendedJobs";
import { getProfileCompletion } from "../features/profile/profile.utils";
import { READINESS_LABEL_KEYS, READINESS_ORDER } from "../features/profile/profileSectionLabels";
import { useProfile } from "../features/profile/useProfile";
import { useTranslation } from "../i18n";

const ACTIVITY_WEEKS = 8;
const TOP_MATCH_COUNT = 4;
const RECENT_APPLICATION_COUNT = 5;
// Keep in sync with the "dashboard.quote.0".."dashboard.quote.N" keys in i18n.tsx.
const QUOTE_COUNT = 8;

const ACTIVITY_COLORS = { applications: "#10b981", interviews: "#f4b400", responses: "#065f46" } as const;

function greetingKey(hour: number) {
  if (hour < 12) return "dashboard.greetingMorning";
  if (hour < 18) return "dashboard.greetingAfternoon";
  return "dashboard.greetingEvening";
}

// Purely decorative -- a rotating accent per card so the list doesn't read as
// one grey block. Colors carry no meaning (they aren't tied to match score or
// job data), so cycling through them by position is fine. Class names are
// spelled out in full (not built from a template) so Tailwind's scanner picks
// them up. Shared by both the ranked (mock) and live job rows below so the
// panel reads the same regardless of which data source is showing.
const CARD_ACCENTS = [
  { bar: "bg-emerald-400", mark: "bg-emerald-100 text-emerald-800", ring: "border-emerald-200", tint: "bg-emerald-50/50" },
  { bar: "bg-sky-400", mark: "bg-sky-100 text-sky-800", ring: "border-sky-200", tint: "bg-sky-50/50" },
  { bar: "bg-violet-400", mark: "bg-violet-100 text-violet-800", ring: "border-violet-200", tint: "bg-violet-50/50" },
  { bar: "bg-amber-400", mark: "bg-amber-100 text-amber-800", ring: "border-amber-200", tint: "bg-amber-50/50" },
  { bar: "bg-rose-400", mark: "bg-rose-100 text-rose-800", ring: "border-rose-200", tint: "bg-rose-50/50" },
  { bar: "bg-teal-400", mark: "bg-teal-100 text-teal-800", ring: "border-teal-200", tint: "bg-teal-50/50" },
] as const;

// Shared row chrome (accent bar/tint, hover lift+shadow) for both a ranked
// mock job and a live job from the registry -- keeps the panel visually
// consistent no matter which data source is showing.
const JOB_CARD_CLASSNAME =
  "relative flex items-center gap-3 overflow-hidden rounded-xl border p-3 pl-4 transition-[translate,box-shadow] duration-[var(--duration-fast)] ease-[var(--easing-standard)] hover:-translate-y-1 hover:shadow-card";

function Panel({ action, children, title }: { action?: ReactNode; children: ReactNode; title: string }) {
  return (
    <Card className="h-full" padding="sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

type FilterOption = { label: string; value: string };

// The plain filter fields (work mode, job type, ...) show the raw value as
// both the option's value and its label; asOptions() is the shorthand for that.
function asOptions(values: readonly string[]): FilterOption[] {
  return values.map((value) => ({ label: value, value }));
}

// Computed once at module load -- every input is a static (or module-level
// derived) list, so there's no reason to rebuild these arrays on every render.
const WORK_MODE_OPTIONS = asOptions(jobWorkModes);
const JOB_TYPE_OPTIONS = asOptions(jobTypes);
const EXPERIENCE_OPTIONS = asOptions(experienceLevels);
const LOCATION_OPTIONS = asOptions(allJobLocations);

// A single-select dropdown for one filter field, styled as a pill so the row
// reads as a toolbar rather than a form. Filled in (brand tint + a small (x))
// once a value is picked; otherwise a quiet outline showing the field's name.
// Kept separate from the multi-select checkbox filters on the Jobs page --
// the Overview card favors compact single-choice rows over that page's full
// sidebar. Only meaningful against the ranked mock catalog (work
// mode/experience/etc. aren't fields the live job registry exposes), so this
// card only renders when live jobs aren't available -- see hasLiveJobs below.
function FilterSelect({
  clearLabel,
  label,
  onChange,
  options,
  value,
}: {
  clearLabel: string;
  label: string;
  onChange: (value: string) => void;
  options: readonly FilterOption[];
  value: string;
}) {
  const isActive = value.length > 0;

  return (
    <div
      className={`inline-flex items-center rounded-full border py-1 pl-3.5 pr-1.5 transition ${
        isActive ? "border-brand-200 bg-brand-50" : "border-line bg-surface hover:border-brand-200 hover:bg-canvas"
      }`}
    >
      <div className="relative flex items-center">
        <select
          aria-label={label}
          className={`min-h-8 cursor-pointer appearance-none bg-transparent py-1 pr-5 text-sm font-semibold outline-none ${
            isActive ? "text-brand-900" : "text-ink-muted"
          }`}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">{label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className={`pointer-events-none absolute right-0 size-3.5 ${isActive ? "text-brand-600" : "text-ink-muted"}`}
        />
      </div>
      {isActive && (
        <button
          aria-label={clearLabel}
          className="ml-1 grid size-6 shrink-0 place-items-center rounded-full text-brand-700 transition hover:bg-brand-100"
          onClick={() => onChange("")}
          type="button"
        >
          <CloseIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// A yes/no filter (e.g. visa sponsorship) only ever has one useful state to
// pick, so a dropdown + separate (x) is one control too many. The whole pill
// is the control here: click it on, click the same pill again to clear it --
// no hunting for a small (x).
function FilterToggle({ active, label, onToggle }: { active: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border py-1.5 pl-3 pr-3.5 text-sm font-semibold transition ${
        active
          ? "border-brand-200 bg-brand-50 text-brand-900"
          : "border-line bg-surface text-ink-muted hover:border-brand-200 hover:bg-canvas"
      }`}
      onClick={onToggle}
      type="button"
    >
      {active ? (
        <CheckCircleIcon className="size-4 shrink-0 text-brand-600" />
      ) : (
        <span aria-hidden="true" className="size-4 shrink-0 rounded-full border-2 border-line" />
      )}
      {label}
    </button>
  );
}

type SingleSelectFilterKey = "workModes" | "jobTypes" | "experienceLevels" | "locations";

function CompanyMark({ accentClassName, company }: { accentClassName: string; company: string }) {
  return (
    <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${accentClassName}`}>
      {company
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </span>
  );
}

export function ProductHomePage() {
  const { locale, t } = useTranslation();
  const { toast } = useToast();
  const { session } = useAuth();
  const { applications, errorMessage, refresh } = useApplications();
  const { activity } = useWorkspaceEvents();
  const { profile } = useProfile();
  const { pendingJobId, statusFor, track } = useJobApplications(applications);
  // Live openings from the job service; the sample listings are only a fallback
  // (service offline or empty), and are labelled as such.
  const { jobs: liveJobs } = useRecommendedJobs();
  const [dismissedJobIds, setDismissedJobIds] = useState<Set<string>>(loadDismissedJobIds);
  const [applyTarget, setApplyTarget] = useState<MockJob | null>(null);

  const metadataName = session?.user.user_metadata.name;
  const name = typeof metadataName === "string" && metadataName.trim() ? metadataName.trim() : "";
  // Seeded by the login timestamp (not random), so the quote is stable while
  // browsing but changes the next time the user actually signs in.
  const quoteIndex = useMemo(
    () => pickQuoteIndex(session?.user.last_sign_in_at ?? session?.user.id ?? "", QUOTE_COUNT),
    [session?.user.last_sign_in_at, session?.user.id],
  );

  const weekly = useMemo(
    () => buildWeeklyActivity(applications, activity, ACTIVITY_WEEKS),
    [applications, activity],
  );
  const completion = useMemo(() => getProfileCompletion(profile), [profile]);
  const [filters, setFilters] = useState<JobFilterState>(createEmptyJobFilters);
  const [searchQuery, setSearchQuery] = useState("");

  // Ranked sample listings -- the fallback shown when the live job service is
  // offline or has nothing to return (see hasLiveJobs below).
  const ranked = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return mockJobs
      .filter((job) => {
        const matchesQuery =
          query.length === 0 ||
          [job.title, job.company, job.location, ...job.tags].join(" ").toLowerCase().includes(query);

        return matchesQuery && jobMatchesFilters(job, filters);
      })
      .map((job) => ({ job, match: matchJob(job, profile) }))
      .sort((a, b) => b.match.percent - a.match.percent);
  }, [filters, profile, searchQuery]);
  const hasLiveJobs = liveJobs.length > 0;
  const { topMatches, usesPlaceholderScores } = useMemo(() => {
    const visible = ranked.filter(({ job }) => !dismissedJobIds.has(job.id)).slice(0, TOP_MATCH_COUNT);
    return { topMatches: visible, usesPlaceholderScores: visible.some((item) => item.match.isPlaceholder) };
  }, [ranked, dismissedJobIds]);
  const visibleLiveJobs = useMemo(
    () => liveJobs.filter((job) => !dismissedJobIds.has(job.id)).slice(0, TOP_MATCH_COUNT),
    [liveJobs, dismissedJobIds],
  );
  const recentApplications = useMemo(
    () =>
      [...applications]
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
        .slice(0, RECENT_APPLICATION_COUNT),
    [applications],
  );

  // Counts only the fields this card exposes (a subset of JobFilterState --
  // salary/skills/industry/company size live only in the Jobs page sidebar),
  // so this is deliberately its own tally rather than hasActiveJobFilters().
  const activeFilterCount = [
    filters.workModes.size > 0,
    filters.jobTypes.size > 0,
    filters.experienceLevels.size > 0,
    filters.locations.size > 0,
    filters.visaSponsorshipOnly,
  ].filter(Boolean).length;

  const singleSelectFilters: { key: SingleSelectFilterKey; label: string; options: FilterOption[] }[] = [
    { key: "workModes", label: t("jobs.filters.workMode"), options: WORK_MODE_OPTIONS },
    { key: "jobTypes", label: t("jobs.filters.jobType"), options: JOB_TYPE_OPTIONS },
    { key: "experienceLevels", label: t("jobs.filters.experience"), options: EXPERIENCE_OPTIONS },
    { key: "locations", label: t("jobs.filters.location"), options: LOCATION_OPTIONS },
  ];

  function handleSingleSelectChange(key: SingleSelectFilterKey, value: string) {
    setFilters({ ...filters, [key]: value ? new Set([value]) : new Set() });
  }

  async function handleSave(job: TrackableJob) {
    const success = await track(job, "saved");
    if (success) refresh();
  }

  // Confirm-before-tracking (mirrors Job Detail's Apply flow) is only wired up
  // for the ranked sample listings -- a live opening's "apply" is the
  // external applyUrl link, not an in-app status to confirm.
  async function handleConfirmApply() {
    if (!applyTarget) return;

    const success = await track(applyTarget, "applied");
    setApplyTarget(null);

    if (success) {
      refresh();
      toast({ title: t("jobs.detail.appliedToast"), type: "success" });
    }
  }

  function handleDismiss(jobId: string) {
    setDismissedJobIds((current) => {
      const next = new Set(current);
      next.add(jobId);
      persistDismissedJobIds(next);
      return next;
    });
  }

  const legend = [
    { color: ACTIVITY_COLORS.applications, key: "applications", label: t("dashboard.activityApplications") },
    { color: ACTIVITY_COLORS.responses, key: "responses", label: t("dashboard.activityResponses") },
    { color: ACTIVITY_COLORS.interviews, key: "interviews", label: t("dashboard.activityInterviews") },
  ] as const;

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  return (
    <>
      <Seo description={t("seo.overview.description")} noIndex path="/app" title={t("nav.overview")} />
      <PageContainer className="space-y-5 py-6 sm:py-8 lg:px-8" size="wide">
        {errorMessage && <ErrorState compact description={errorMessage} title={t("dashboard.errorOverviewTitle")} />}

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
          <p className="text-lg font-bold tracking-tight">
            {t(greetingKey(new Date().getHours()), { name: name || t("dashboard.thereFallback") })}
          </p>
          <span aria-hidden="true" className="text-ink-muted">·</span>
          <p className="text-sm italic text-ink-muted">“{t(`dashboard.quote.${quoteIndex}`)}”</p>
        </div>

        {!hasLiveJobs && (
          <Card padding="sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">{t("jobs.filters.title")}</h2>
                {activeFilterCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-brand-800 text-[0.6875rem] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {(activeFilterCount > 0 || searchQuery.length > 0) && (
                <button
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                  onClick={() => {
                    setFilters(createEmptyJobFilters());
                    setSearchQuery("");
                  }}
                  type="button"
                >
                  {t("jobs.filters.clearAll")}
                </button>
              )}
            </div>

            <label className="flex min-h-11 items-center gap-2.5 rounded-xl border border-line bg-canvas px-3.5 transition focus-within:border-brand-300 focus-within:bg-surface focus-within:ring-2 focus-within:ring-brand-100">
              <SearchIcon className="size-4.5 shrink-0 text-ink-muted" />
              <input
                className="w-full min-w-0 border-none bg-transparent text-sm outline-none placeholder:text-ink-muted"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("jobs.searchPlaceholder")}
                type="search"
                value={searchQuery}
              />
            </label>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {singleSelectFilters.map(({ key, label, options }) => (
                <FilterSelect
                  clearLabel={t("filters.clear")}
                  key={key}
                  label={label}
                  onChange={(value) => handleSingleSelectChange(key, value)}
                  options={options}
                  value={[...filters[key]][0] ?? ""}
                />
              ))}
              <FilterToggle
                active={filters.visaSponsorshipOnly}
                label={t("jobs.filters.visaSponsorshipYes")}
                onToggle={() => setFilters({ ...filters, visaSponsorshipOnly: !filters.visaSponsorshipOnly })}
              />
            </div>
          </Card>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <Panel
            action={
              <span className="flex items-center gap-3">
                {!hasLiveJobs && <DemoBadge />}
                <ArrowLink to="/app/jobs">{t("dashboard.viewAll")}</ArrowLink>
              </span>
            }
            title={hasLiveJobs ? t("dashboard.nextOpportunities") : t("dashboard.topMatches")}
          >
            {hasLiveJobs ? (
              visibleLiveJobs.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">
                  {t("dashboard.noMatches")}
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {visibleLiveJobs.map((job, index) => {
                    const status = statusFor(job);
                    const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

                    return (
                      <li className={`${JOB_CARD_CLASSNAME} ${accent.ring} ${accent.tint}`} key={job.id}>
                        <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${accent.bar}`} />
                        <CompanyMark accentClassName={accent.mark} company={job.company} />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{job.title}</span>
                          <span className="block truncate text-xs text-ink-muted">{job.company} · {job.location}</span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {job.tags.map((chip) => (
                              <span className="rounded-full bg-surface px-2 py-0.5 text-[0.6875rem] font-semibold text-ink" key={chip}>
                                {chip}
                              </span>
                            ))}
                            {job.applyUrl && (
                              <a
                                className="text-[0.6875rem] font-semibold text-brand-700 hover:text-brand-800"
                                href={job.applyUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                {t("dashboard.viewJob")} →
                              </a>
                            )}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            aria-label={t("jobs.saveAria", { title: job.title })}
                            aria-pressed={status === "saved"}
                            className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
                              status === "saved" ? "text-brand-700" : "text-ink-muted hover:bg-surface hover:text-ink"
                            }`}
                            disabled={pendingJobId === job.id || status !== null}
                            onClick={() => void handleSave(job)}
                            type="button"
                          >
                            <BookmarkIcon className={status === "saved" ? "size-5 fill-current" : "size-5"} />
                          </button>
                          <button
                            aria-label={t("jobs.dismissAria", { title: job.title })}
                            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-surface hover:text-ink"
                            onClick={() => handleDismiss(job.id)}
                            type="button"
                          >
                            <CloseIcon className="size-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )
            ) : topMatches.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">
                {t("dashboard.noMatches")}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {topMatches.map(({ job, match }, index) => {
                  const status = statusFor(job);
                  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

                  return (
                    <li className={`${JOB_CARD_CLASSNAME} ${accent.ring} ${accent.tint}`} key={job.id}>
                      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${accent.bar}`} />
                      <CompanyMark accentClassName={accent.mark} company={job.company} />
                      <Link className="min-w-0 flex-1" to={`/app/jobs/${job.id}`}>
                        <span className="block truncate text-sm font-bold">{job.title}</span>
                        <span className="block truncate text-xs text-ink-muted">{job.company} · {job.location}</span>
                        <span className="mt-1.5 flex flex-wrap gap-1.5">
                          {[job.workMode, job.jobType].map((chip) => (
                            <span className="rounded-full bg-surface px-2 py-0.5 text-[0.6875rem] font-semibold text-ink" key={chip}>
                              {chip}
                            </span>
                          ))}
                        </span>
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        <p className="hidden text-xs font-bold text-brand-700 sm:block">{t(matchLabelKey(match.percent))}</p>
                        <MatchRing percent={match.percent} />
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          aria-label={t("jobs.applyAria", { title: job.title })}
                          className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
                            status === "applied" ? "text-brand-700" : "text-ink-muted hover:bg-surface hover:text-brand-700"
                          }`}
                          disabled={pendingJobId === job.id || status === "applied"}
                          onClick={() => setApplyTarget(job)}
                          type="button"
                        >
                          {status === "applied" ? (
                            <CheckCircleIcon className="size-5" />
                          ) : (
                            <SparkleIcon className="size-5" />
                          )}
                        </button>
                        <button
                          aria-label={t("jobs.saveAria", { title: job.title })}
                          aria-pressed={status === "saved"}
                          className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
                            status === "saved" ? "text-brand-700" : "text-ink-muted hover:bg-surface hover:text-ink"
                          }`}
                          disabled={pendingJobId === job.id || status !== null}
                          onClick={() => void handleSave(job)}
                          type="button"
                        >
                          <BookmarkIcon className={status === "saved" ? "size-5 fill-current" : "size-5"} />
                        </button>
                        <button
                          aria-label={t("jobs.dismissAria", { title: job.title })}
                          className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-surface hover:text-ink"
                          onClick={() => handleDismiss(job.id)}
                          type="button"
                        >
                          <CloseIcon className="size-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {!hasLiveJobs && usesPlaceholderScores && (
              <p className="mt-4 text-xs text-ink-muted">{t("dashboard.placeholderScores")}</p>
            )}
          </Panel>

          <Panel
            action={<ArrowLink to="/app/applications">{t("dashboard.viewAll")}</ArrowLink>}
            title={t("dashboard.recentApplications")}
          >
            {recentApplications.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">
                {t("dashboard.noRecentApplications")}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {recentApplications.map((application) => {
                  const details = applicationStatusDetails[application.status];

                  return (
                    <li key={application.id}>
                      <Link
                        className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:bg-canvas"
                        to="/app/applications"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{application.job_title}</span>
                          <span className="block truncate text-xs text-ink-muted">
                            {application.company_name} · {dateFormatter.format(new Date(application.updated_at))}
                          </span>
                        </span>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${details.styles}`}>
                          {t(details.labelKey)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <Panel title={t("dashboard.activityTitle")} action={<span className="text-xs font-semibold text-ink-muted">{t("dashboard.activityRange")}</span>}>
              <BarChart
                ariaLabel={t("dashboard.activityAria")}
                height={190}
                labels={weekly.starts.map((start) => dateFormatter.format(start))}
                series={[
                  { color: ACTIVITY_COLORS.applications, name: t("dashboard.activityApplications"), values: weekly.applications },
                  { color: ACTIVITY_COLORS.responses, name: t("dashboard.activityResponses"), values: weekly.responses },
                  { color: ACTIVITY_COLORS.interviews, name: t("dashboard.activityInterviews"), values: weekly.interviews },
                ]}
              />
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
                {legend.map((item) => (
                  <div key={item.key}>
                    <p className="text-xl font-extrabold">{sum(weekly[item.key])}</p>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                      <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel title={t("dashboard.profileCompleteness")}>
              <ProgressBar label={t("dashboard.profileCompleteness")} percent={completion.percentage} />
              <ul className="mt-4 space-y-2.5">
                {READINESS_ORDER.map((key) => {
                  const isDone = !completion.missing.includes(key);

                  return (
                    <li className="flex items-center gap-2.5 text-sm" key={key}>
                      {isDone ? (
                        <CheckCircleIcon className="size-5 shrink-0 text-brand-600" />
                      ) : (
                        <span aria-hidden="true" className="size-5 shrink-0 rounded-full border-2 border-line" />
                      )}
                      <span className="flex-1">{t(READINESS_LABEL_KEYS[key])}</span>
                      {isDone ? (
                        <span className="text-xs font-semibold text-brand-700">{t("dashboard.complete")}</span>
                      ) : (
                        <Link className="text-xs font-semibold text-brand-700 hover:text-brand-800" to="/app/profile">
                          {t("dashboard.addNow")} →
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </div>
        </div>
      </PageContainer>

      <ConfirmModal
        cancelLabel={t("jobs.detail.cancel")}
        confirmLabel={t("jobs.detail.applyConfirm")}
        description={
          applyTarget ? t("jobs.detail.applyBody", { company: applyTarget.company, title: applyTarget.title }) : ""
        }
        isBusy={applyTarget !== null && pendingJobId === applyTarget.id}
        isOpen={applyTarget !== null}
        onCancel={() => setApplyTarget(null)}
        onConfirm={() => void handleConfirmApply()}
        title={t("jobs.detail.applyTitle")}
      />
    </>
  );
}
