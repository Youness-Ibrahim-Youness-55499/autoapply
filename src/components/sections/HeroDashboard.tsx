import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MatchRing } from "../app/MatchRing";
import {
  ArrowRightIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckCircleIcon,
  CloseIcon,
  SearchIcon,
  SparkleIcon,
  StarIcon,
  WorkIcon,
} from "../icons/BrandIcons";
import { ArrowLink } from "../ui/ArrowLink";
import { Card } from "../ui/Card";
import { DemoBadge } from "../ui/DemoBadge";
import { ProgressBar } from "../ui/ProgressBar";
import { Logo } from "../Logo";
import { applicationStatusDetails } from "../../features/applications/applicationStatus";
import { applicationStatuses, type ApplicationStatus } from "../../features/applications/types";
import { createEmptyJobFilters, jobMatchesFilters, type JobFilterState } from "../../features/jobs/jobFilterState";
import { matchJob } from "../../features/jobs/matchJob";
import { matchLabelKey } from "../../features/jobs/matchLabel";
import { allJobLocations, experienceLevels, jobTypes, jobWorkModes, mockJobs } from "../../features/jobs/mockJobs";
import {
  asOptions,
  CARD_ACCENTS,
  CompanyMark,
  FilterSelect,
  FilterToggle,
  JOB_CARD_CLASSNAME,
  Panel,
  type FilterOption,
} from "../../features/jobs/OverviewJobsPanel";
import { emptyCandidateProfile, type CandidateProfile } from "../../features/profile/profile.types";
import { getProfileCompletion } from "../../features/profile/profile.utils";
import { READINESS_LABEL_KEYS, READINESS_ORDER } from "../../features/profile/profileSectionLabels";
import { useTranslation } from "../../i18n";

// This mirrors the real signed-in product (src/pages/*.tsx) as closely as a
// logged-out marketing page can: same filter controls, same job-card
// component and accent colors (shared via OverviewJobsPanel.tsx), same match
// algorithm, same job catalog, same copy for each tab's header and the
// Autopilot/Settings panels. What's necessarily different, since there's no
// session here:
//   - no backend calls (save/apply/dismiss/activate only change local state)
//   - the applications, autopilot preview, and profile tabs use a fixed
//     sample dataset instead of the visitor's real account
//   - the quote/greeting always show the same example rather than rotating
//     per login
// All of that sample data is real output of the same real functions the
// signed-in pages use (matchJob, jobMatchesFilters, getProfileCompletion),
// not invented numbers.

const TOP_MATCH_COUNT = 4;
const JOBS_TAB_COUNT = 8;
// Static example figures for the Autopilot preview -- there's no job-scanning
// pipeline behind this demo, so these are marked with DemoBadge rather than
// presented as a live estimate (mirrors src/pages/AutopilotPage.tsx).
const AUTOPILOT_PREVIEW = { autoApplied: 5, needsApproval: 6, scanned: 4200, strongMatches: 18 };
const AUTOMATION_RULE_KEYS = ["autoApply", "needsApproval", "neverBelow", "savedAnswers"] as const;

const WORK_MODE_OPTIONS = asOptions(jobWorkModes);
const JOB_TYPE_OPTIONS = asOptions(jobTypes);
const EXPERIENCE_OPTIONS = asOptions(experienceLevels);
const LOCATION_OPTIONS = asOptions(allJobLocations);

type SingleSelectFilterKey = "workModes" | "jobTypes" | "experienceLevels" | "locations";
type DashboardTab = "applications" | "autopilot" | "jobs" | "overview" | "profile" | "settings";

const NAV_ITEMS: { key: string; tab: DashboardTab }[] = [
  { key: "nav.overview", tab: "overview" },
  { key: "nav.jobs", tab: "jobs" },
  { key: "nav.applications", tab: "applications" },
  { key: "nav.autopilot", tab: "autopilot" },
  { key: "nav.profile", tab: "profile" },
  { key: "nav.settings", tab: "settings" },
];

// A representative, mostly-complete profile so the readiness card shows real
// (computed, not invented) progress instead of either 0% or a suspiciously
// perfect 100%.
const sampleProfile: CandidateProfile = {
  ...emptyCandidateProfile,
  autoApplyLevels: ["strong"],
  desiredRoles: ["Product Designer", "UX Designer"],
  employmentTypes: ["Full-time"],
  experience: [
    { company: "Northstar", current: true, description: "", endDate: "", id: "1", location: "Berlin, DE", role: "Product Designer", startDate: "2022-01" },
  ],
  fullName: "Alex Rivera",
  headline: "Product Designer",
  location: "Berlin, DE",
  minimumSalary: 65000,
  professionalSummary: "Product designer focused on B2B tools.",
  skills: ["Figma", "User research", "Design systems"],
};

const sampleApplications: { company_name: string; id: string; job_title: string; status: ApplicationStatus; updated_at: string }[] = [
  { company_name: "Juniper Studio", id: "4", job_title: "Product Designer", status: "saved", updated_at: "2026-09-20T09:00:00Z" },
  { company_name: "Mosaic Labs", id: "3", job_title: "UX Researcher", status: "applied", updated_at: "2026-09-21T09:00:00Z" },
  { company_name: "Northstar", id: "1", job_title: "Product Designer", status: "interview", updated_at: "2026-09-24T09:00:00Z" },
  { company_name: "Daylight", id: "2", job_title: "Senior UX Designer", status: "offer", updated_at: "2026-09-23T09:00:00Z" },
  { company_name: "Horizon", id: "5", job_title: "Staff Product Designer", status: "rejected", updated_at: "2026-09-17T09:00:00Z" },
];

function TabHeader({ description, title }: { description: string; title: string }) {
  return (
    <div className="px-1">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
    </div>
  );
}

export function HeroDashboard() {
  const { locale, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [filters, setFilters] = useState<JobFilterState>(createEmptyJobFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isAutopilotActive, setIsAutopilotActive] = useState(false);

  const ranked = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return mockJobs
      .filter((job) => {
        const matchesQuery =
          query.length === 0 ||
          [job.title, job.company, job.location, ...job.tags].join(" ").toLowerCase().includes(query);

        return matchesQuery && jobMatchesFilters(job, filters);
      })
      .map((job) => ({ job, match: matchJob(job, sampleProfile) }))
      .sort((a, b) => b.match.percent - a.match.percent);
  }, [filters, searchQuery]);
  const visibleMatches = ranked.filter(({ job }) => !dismissedIds.has(job.id));
  const topMatches = visibleMatches.slice(0, TOP_MATCH_COUNT);
  const jobsTabMatches = visibleMatches.slice(0, JOBS_TAB_COUNT);

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

  function toggleInSet(set: Set<string>, setSet: (next: Set<string>) => void, id: string) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSet(next);
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  const completion = useMemo(() => getProfileCompletion(sampleProfile), []);

  function renderJobCard(job: (typeof mockJobs)[number], match: ReturnType<typeof matchJob>, index: number) {
    const isSaved = savedIds.has(job.id);
    const isApplied = appliedIds.has(job.id);
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
              isApplied ? "text-brand-700" : "text-ink-muted hover:bg-surface hover:text-brand-700"
            }`}
            disabled={isApplied}
            onClick={() => toggleInSet(appliedIds, setAppliedIds, job.id)}
            type="button"
          >
            {isApplied ? <CheckCircleIcon className="size-5" /> : <SparkleIcon className="size-5" />}
          </button>
          <button
            aria-label={t("jobs.saveAria", { title: job.title })}
            aria-pressed={isSaved}
            className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
              isSaved ? "text-brand-700" : "text-ink-muted hover:bg-surface hover:text-ink"
            }`}
            onClick={() => toggleInSet(savedIds, setSavedIds, job.id)}
            type="button"
          >
            <BookmarkIcon className={isSaved ? "size-5 fill-current" : "size-5"} />
          </button>
          <button
            aria-label={t("jobs.dismissAria", { title: job.title })}
            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-surface hover:text-ink"
            onClick={() => toggleInSet(dismissedIds, setDismissedIds, job.id)}
            type="button"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      </li>
    );
  }

  const filtersCard = (
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
  );

  return (
    <div className="relative mt-14">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [background-image:radial-gradient(var(--color-border-default)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div
        aria-label={t("hero.dashboard.ariaLabel")}
        className="relative overflow-hidden rounded-card border border-line bg-canvas shadow-card"
        role="group"
      >
        <div className="flex flex-wrap items-center gap-4 border-b border-line bg-surface px-4 py-3 sm:px-6">
          <Logo className="h-8" />
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ key, tab }) => (
              <button
                aria-current={activeTab === tab ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  activeTab === tab ? "bg-brand-50 text-brand-900" : "text-ink-muted hover:bg-canvas hover:text-ink"
                }`}
                key={key}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {t(key)}
              </button>
            ))}
          </nav>
          <span className="ml-auto inline-flex items-center rounded-full border border-dashed border-brand-300 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800">
            {t("hero.dashboard.liveLabel")}
          </span>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          {activeTab === "overview" && (
            <>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
                <p className="text-lg font-bold tracking-tight">
                  {t("dashboard.greetingEvening", { name: t("hero.dashboard.exampleName") })}
                </p>
                <span aria-hidden="true" className="text-ink-muted">·</span>
                <p className="text-sm italic text-ink-muted">“{t("dashboard.quote.0")}”</p>
              </div>

              {filtersCard}

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <Panel
                  action={
                    <span className="flex items-center gap-3">
                      <DemoBadge />
                      <ArrowLink to="/app/jobs">{t("dashboard.viewAll")}</ArrowLink>
                    </span>
                  }
                  title={t("dashboard.topMatches")}
                >
                  {topMatches.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">
                      {t("dashboard.noMatches")}
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {topMatches.map(({ job, match }, index) => renderJobCard(job, match, index))}
                    </ul>
                  )}
                </Panel>

                <Panel
                  action={<ArrowLink to="/app/applications">{t("dashboard.viewAll")}</ArrowLink>}
                  title={t("dashboard.recentApplications")}
                >
                  <ul className="space-y-2.5">
                    {sampleApplications.map((application) => {
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
                </Panel>
              </div>
            </>
          )}

          {activeTab === "jobs" && (
            <>
              <TabHeader description={t("jobs.description")} title={t("jobs.title")} />
              {filtersCard}

              <Panel
                action={<DemoBadge />}
                title={t("dashboard.topMatches")}
              >
                {jobsTabMatches.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">
                    {t("dashboard.noMatches")}
                  </p>
                ) : (
                  <ul className="grid gap-2.5 lg:grid-cols-2">
                    {jobsTabMatches.map(({ job, match }, index) => renderJobCard(job, match, index))}
                  </ul>
                )}
              </Panel>
            </>
          )}

          {activeTab === "applications" && (
            <>
              <TabHeader description={t("applications.description")} title={t("applications.title")} />

              <Panel action={<DemoBadge />} title={t("dashboard.recentApplications")}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {applicationStatuses
                    .map((status) => ({ items: sampleApplications.filter((application) => application.status === status), status }))
                    .filter(({ items }) => items.length > 0)
                    .map(({ items, status }) => {
                      const details = applicationStatusDetails[status];

                      return (
                        <div className="rounded-xl border border-line bg-surface p-3" key={status}>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${details.styles}`}>
                            {t(details.labelKey)}
                          </span>
                          <ul className="mt-2.5 space-y-2">
                            {items.map((application) => (
                              <li key={application.id}>
                                <Link
                                  className="block rounded-lg border border-line bg-canvas p-2.5 transition hover:border-brand-200"
                                  to="/app/applications"
                                >
                                  <span className="block truncate text-sm font-bold">{application.job_title}</span>
                                  <span className="block truncate text-xs text-ink-muted">
                                    {application.company_name} · {dateFormatter.format(new Date(application.updated_at))}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                </div>
              </Panel>
            </>
          )}

          {activeTab === "autopilot" && (
            <>
              <div className="px-1">
                <h2 className="text-lg font-bold tracking-tight">
                  {t("autopilot.heroTitle")} <span className="text-brand-700">{t("autopilot.heroTitleAccent")}</span>
                </h2>
                <p className="mt-1 text-sm text-ink-muted">{t("autopilot.heroBody")}</p>
              </div>

              <Card padding="sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SparkleIcon className="size-4.5 text-brand-700" />
                    <h3 className="text-base font-bold tracking-tight">{t("autopilot.preview.title")}</h3>
                  </div>
                  <DemoBadge />
                </div>
                <p className="mt-1 text-xs text-ink-muted">{t("autopilot.preview.subtitle")}</p>

                <div className="mt-3.5 flex items-center gap-3 rounded-xl border border-line bg-brand-50/60 p-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-brand-700">
                    <SearchIcon className="size-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-extrabold leading-none">{AUTOPILOT_PREVIEW.scanned.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-ink-muted">{t("autopilot.preview.scannedLabel")}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-brand-100 bg-brand-50 p-2.5 text-brand-800">
                    <StarIcon className="size-4" />
                    <p className="mt-1.5 text-lg font-extrabold leading-none">{AUTOPILOT_PREVIEW.strongMatches}</p>
                    <p className="mt-1 text-[0.625rem] leading-tight text-ink-muted">{t("autopilot.preview.strongLabel")}</p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-amber-700">
                    <CalendarIcon className="size-4" />
                    <p className="mt-1.5 text-lg font-extrabold leading-none">{AUTOPILOT_PREVIEW.needsApproval}</p>
                    <p className="mt-1 text-[0.625rem] leading-tight text-ink-muted">{t("autopilot.preview.approvalLabel")}</p>
                  </div>
                  <div className="rounded-lg border border-sky-200 bg-sky-50 p-2.5 text-sky-700">
                    <WorkIcon className="size-4" />
                    <p className="mt-1.5 text-lg font-extrabold leading-none">{AUTOPILOT_PREVIEW.autoApplied}</p>
                    <p className="mt-1 text-[0.625rem] leading-tight text-ink-muted">{t("autopilot.preview.autoLabel")}</p>
                  </div>
                </div>

                <ul className="mt-3.5 grid gap-2 sm:grid-cols-2">
                  {AUTOMATION_RULE_KEYS.map((key) => (
                    <li className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm" key={key}>
                      <CheckCircleIcon className="size-4 shrink-0 text-brand-600" />
                      <span className="truncate font-semibold">{t(`autopilot.rule.${key}.title`)}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-3.5 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-white transition ${
                    isAutopilotActive
                      ? "bg-[linear-gradient(135deg,#075d49,#064435)]"
                      : "bg-[linear-gradient(135deg,#06a978,#087653)] hover:brightness-105"
                  }`}
                  onClick={() => setIsAutopilotActive((current) => !current)}
                  type="button"
                >
                  <SparkleIcon className="size-6 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold">
                      {isAutopilotActive ? t("autopilot.activate.ctaActive") : t("autopilot.activate.cta")}
                    </span>
                    <span className="mt-0.5 block text-xs opacity-90">
                      {isAutopilotActive ? t("autopilot.activate.bodyActive") : t("autopilot.activate.body")}
                    </span>
                  </span>
                  <ArrowRightIcon className="size-5 shrink-0" />
                </button>
              </Card>
            </>
          )}

          {activeTab === "profile" && (
            <>
              <TabHeader description={t("profile.description")} title={t("profile.title")} />

              <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
                <Card padding="sm">
                  <div className="flex items-center gap-3">
                    <CompanyMark accentClassName={CARD_ACCENTS[0].mark} company={sampleProfile.fullName} />
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold">{sampleProfile.fullName}</p>
                      <p className="truncate text-sm text-ink-muted">{sampleProfile.headline} · {sampleProfile.location}</p>
                    </div>
                  </div>
                  <p className="mt-3.5 text-sm leading-relaxed text-ink-muted">{sampleProfile.professionalSummary}</p>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {sampleProfile.skills.map((skill) => (
                      <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-ink" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card padding="sm">
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
                          <span className={`text-xs font-semibold ${isDone ? "text-brand-700" : "text-ink-muted"}`}>
                            {isDone ? t("dashboard.complete") : t("dashboard.addNow")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </div>
            </>
          )}

          {activeTab === "settings" && (
            <>
              <TabHeader description={t("settings.description")} title={t("settings.title")} />

              <Card className="max-w-2xl" padding="sm">
                <p className="eyebrow">{t("settings.accountSection")}</p>
                <h3 className="mt-2 text-base font-semibold">{t("settings.signInEmail")}</h3>
                <p className="mt-1 text-sm text-ink-muted">alex.rivera@example.com</p>

                <div className="mt-5 border-t border-line pt-5">
                  <h3 className="text-sm font-semibold">{t("settings.noPreferencesTitle")}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{t("settings.noPreferencesDescription")}</p>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
