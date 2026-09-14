import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTranslation } from "../i18n";
import { useAuth } from "../auth/AuthProvider";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { applicationStatusDetails } from "../features/applications/applicationStatus";
import type { Application } from "../features/applications/types";
import { useApplications } from "../features/applications/useApplications";
import {
  type RecommendedJob,
  useRecommendedJobs,
} from "../features/jobs/useRecommendedJobs";
import { getProfileCompletion } from "../features/profile/profile.utils";
import { useProfile } from "../features/profile/useProfile";
import { EmptyState } from "../components/states/EmptyState";
import { LoadingState } from "../components/states/LoadingState";
import { ErrorState } from "../components/states/ErrorState";

// Alternating pastel tints for match cards -- two existing shades of the
// brand scale, not new colors, matching the design's "two-tone rotation"
// idea without introducing hues outside the current palette.
const cardTints = ["bg-brand-50", "bg-brand-100"] as const;

// There's no billing/plans table yet, so this isn't read from a user
// record -- it mirrors the "Track up to 20 roles" limit already advertised
// on the Starter plan (see pricing.planStarter.featureOne in i18n.tsx) and
// is applied to every signed-in user for now. Swapping this constant for a
// real per-user field later is a one-line change at the call site below.
const FREE_PLAN_APPLICATION_LIMIT = 20;

function PlanUsageBanner({ limit, used }: { limit: number; used: number }) {
  const { t } = useTranslation();
  const remaining = Math.max(limit - used, 0);
  const percentUsed = Math.min(Math.round((used / limit) * 100), 100);
  const isExhausted = remaining === 0;

  return (
    <div className="mb-4 rounded-card border border-line bg-surface px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">{t("dashboard.planFreeLabel")}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {isExhausted
              ? t("dashboard.planExhausted", { limit })
              : t("dashboard.planRemaining", { limit, remaining })}
          </p>
        </div>
        <Link
          className="shrink-0 rounded-full border border-line bg-canvas px-4 py-2 text-xs font-bold text-ink transition-colors hover:bg-brand-50"
          to="/#pricing"
        >
          {t("dashboard.planUpgrade")}
        </Link>
      </div>
      <div
        aria-hidden="true"
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-canvas"
      >
        <div
          className={`h-full rounded-full transition-[width] ${isExhausted ? "bg-red-500" : "bg-brand-700"}`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
    </div>
  );
}

const filterChips = [
  { active: false, key: "date", labelKey: "dashboard.filterDate" },
  { active: true, key: "location", labelKey: "dashboard.filterLocation" },
  { active: false, key: "workplace", labelKey: "dashboard.filterWorkplace" },
  { active: false, key: "companies", labelKey: "dashboard.filterCompanies" },
  { active: false, key: "jobType", labelKey: "dashboard.filterJobType" },
] as const;

function InsightBanner({ percentage }: { percentage: number }) {
  const { t } = useTranslation();

  return (
    <div className="mb-5 flex items-center gap-3 rounded-card bg-brand-50 px-5 py-4">
      <span aria-hidden="true" className="text-lg">
        ✨
      </span>
      <div className="text-sm text-brand-900">
        {percentage >= 100
          ? t("dashboard.insightMessageComplete")
          : t("dashboard.insightMessage", { percent: percentage })}
      </div>
      <Link
        className="ml-auto shrink-0 rounded-full bg-brand-700 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-800"
        to="/app/profile"
      >
        {t("dashboard.insightReview")}
      </Link>
    </div>
  );
}

function MatchCard({
  isApplied,
  job,
  onApply,
  tint,
}: {
  isApplied: boolean;
  job: RecommendedJob;
  onApply: () => void;
  tint: (typeof cardTints)[number];
}) {
  const { t } = useTranslation();

  return (
    <div className={`flex min-h-52 flex-col gap-3 rounded-2xl ${tint} p-[18px]`}>
      <div className="flex items-start justify-between">
        <div className="text-xs font-semibold text-ink-muted">
          {job.location}
          <br />
          <span className="font-medium text-ink-muted/80">{job.posted}</span>
        </div>
        {job.provider ? (
          <div className="rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
            {job.provider}
          </div>
        ) : null}
      </div>

      <div className="flex-1 text-base font-bold leading-tight">{job.title}</div>

      <div className="flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <span
            className="rounded-lg bg-white/55 px-2.5 py-1 text-[11px] font-semibold text-ink"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 truncate text-sm font-semibold">{job.company}</div>
        {job.applyUrl ? (
          <a
            className="shrink-0 rounded-full bg-brand-700 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-800"
            href={job.applyUrl}
            onClick={onApply}
            rel="noreferrer"
            target="_blank"
          >
            {isApplied ? t("dashboard.opened") : t("dashboard.viewJob")}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function ApplicationsTable({ applications }: { applications: Application[] }) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 border-b border-line px-5 py-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
        <div>{t("dashboard.tableRole")}</div>
        <div>{t("dashboard.tableCompany")}</div>
        <div>{t("dashboard.tableApplied")}</div>
        <div>{t("dashboard.tableStatus")}</div>
      </div>
      {applications.map((application) => {
        const statusDetail = applicationStatusDetails[application.status];

        return (
          <div
            className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-2 border-b border-line px-5 py-3.5 text-sm last:border-b-0"
            key={application.id}
          >
            <div className="font-semibold">{application.job_title}</div>
            <div className="text-ink-muted">{application.company_name}</div>
            <div className="text-ink-muted">
              {application.applied_at
                ? new Date(application.applied_at).toLocaleDateString()
                : "—"}
            </div>
            <div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusDetail.styles}`}
              >
                {t(statusDetail.labelKey)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProductHomePage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const metadataName = session?.user.user_metadata.name;
  const name =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : "there";

  const { applications, isLoading, errorMessage } = useApplications();
  const {
    errorMessage: jobsErrorMessage,
    isLoading: jobsLoading,
    jobs,
  } = useRecommendedJobs();
  const { profile } = useProfile();
  const profileCompletion = useMemo(() => getProfileCompletion(profile), [profile]);

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query
      ? jobs.filter((job) =>
          `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(query),
        )
      : jobs;
  }, [jobs, searchQuery]);
  const visibleJobs = filteredJobs.slice(0, 5);

  function handleApply(jobId: string) {
    setAppliedJobIds((current) => new Set(current).add(jobId));
  }

  function handleApplyToAll() {
    setAppliedJobIds((current) => {
      const next = new Set(current);
      for (const job of visibleJobs) {
        next.add(job.id);
      }
      return next;
    });
  }

  return (
    <>
      <Seo
        description={t("seo.overview.description")}
        noIndex
        path="/app"
        title={t("nav.overview")}
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <ProductPageHeader
          description={t("overview.description")}
          eyebrow={t("workspace")}
          title={t("overview.title", { name })}
        />

        <section className="mt-8 max-w-6xl">
          <PlanUsageBanner limit={FREE_PLAN_APPLICATION_LIMIT} used={applications.length} />
          <InsightBanner percentage={profileCompletion.percentage} />

          <div className="mb-3.5 flex items-center gap-2.5 rounded-card border border-line bg-surface px-4.5 py-3.5">
            <span aria-hidden="true" className="text-ink-muted">
              ⌕
            </span>
            <input
              className="flex-1 border-none bg-transparent text-sm outline-none"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("dashboard.searchPlaceholder")}
              value={searchQuery}
            />
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            {filterChips.map((chip) => (
              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  chip.active ? "bg-brand-700 text-white" : "bg-canvas text-ink-muted"
                }`}
                key={chip.key}
              >
                {t(chip.labelKey)}
              </span>
            ))}
            <button
              className="ml-auto text-xs font-semibold text-ink-muted transition-colors hover:text-ink"
              type="button"
            >
              {t("dashboard.clearFilters")}
            </button>
          </div>

          <div className="mb-4 flex items-center">
            <div className="text-lg font-bold tracking-tight">{t("dashboard.topMatches")}</div>
            <div className="ml-auto flex gap-2.5">
              <Link
                className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold transition-colors hover:bg-canvas"
                to="/app/applications"
              >
                {t("dashboard.addYourOwn")}
              </Link>
              <button
                className="rounded-full bg-brand-700 px-4.5 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-800"
                onClick={handleApplyToAll}
                type="button"
              >
                {t("dashboard.autoApplyToAll")}
              </button>
            </div>
          </div>

          {jobsLoading ? (
            <div className="mb-9 rounded-2xl border border-line bg-surface px-5 py-8 text-sm text-ink-muted">
              {t("dashboard.loadingJobs")}
            </div>
          ) : jobsErrorMessage ? (
            <div className="mb-9 rounded-2xl border border-line bg-surface px-5 py-8 text-sm text-ink-muted">
              {t("dashboard.jobsUnavailable")}
            </div>
          ) : visibleJobs.length === 0 ? (
            <div className="mb-9 rounded-2xl border border-line bg-surface px-5 py-8 text-sm text-ink-muted">
              {t("dashboard.noJobsAvailable")}
            </div>
          ) : (
            <div className="mb-9 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
              {visibleJobs.map((job, index) => (
              <MatchCard
                isApplied={appliedJobIds.has(job.id)}
                job={job}
                key={job.id}
                onApply={() => handleApply(job.id)}
                tint={cardTints[index % cardTints.length]}
              />
              ))}
            </div>
          )}

          <div className="mb-3.5 text-lg font-bold tracking-tight">
            {t("dashboard.allApplications")}
          </div>

          {isLoading ? (
            <LoadingState
              description={t("dashboard.loadingOverviewDescription")}
              title={t("dashboard.loadingOverviewTitle")}
            />
          ) : errorMessage ? (
            <ErrorState description={errorMessage} title={t("dashboard.errorOverviewTitle")} />
          ) : applications.length === 0 ? (
            <EmptyState
              description={t("dashboard.noApplicationsYetDescription")}
              title={t("dashboard.noApplicationsYet")}
            />
          ) : (
            <ApplicationsTable applications={applications} />
          )}
        </section>
      </PageContainer>
    </>
  );
}
