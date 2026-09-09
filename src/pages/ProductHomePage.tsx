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
import { mockJobs, type MockJob } from "../features/jobs/mockJobs";
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
  isSaved,
  job,
  onApply,
  onExplain,
  onSave,
  onSkip,
  tint,
}: {
  isApplied: boolean;
  isSaved: boolean;
  job: MockJob;
  onApply: () => void;
  onExplain: () => void;
  onSave: () => void;
  onSkip: () => void;
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
        <button
          aria-label={t("dashboard.whyMatch")}
          className="flex size-[52px] flex-col items-center justify-center rounded-full border-[3px] border-ink/15 bg-white text-center leading-none transition hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          onClick={onExplain}
          type="button"
        >
          <div className="text-xs font-extrabold">{job.matchPercent}%</div>
          <div className="text-[8px] font-bold text-ink-muted">{t("dashboard.matchLabel")}</div>
        </button>
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
        <button
          className="shrink-0 rounded-full bg-white/60 px-3.5 py-2 text-xs font-bold transition-colors hover:bg-white/80"
          onClick={onSave}
          type="button"
        >
          {isSaved ? t("dashboard.saved") : t("dashboard.save")}
        </button>
        <button
          className="shrink-0 rounded-full bg-white/60 px-3.5 py-2 text-xs font-bold transition-colors hover:bg-white/80"
          onClick={onSkip}
          type="button"
        >
          {t("dashboard.skip")}
        </button>
        <button
          className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold text-white transition-colors ${
            isApplied ? "bg-ink-muted" : "bg-brand-700 hover:bg-brand-800"
          }`}
          disabled={isApplied}
          onClick={onApply}
          type="button"
        >
          {isApplied ? t("dashboard.applied") : t("dashboard.apply")}
        </button>
      </div>
    </div>
  );
}

function DashboardModal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4" onMouseDown={onClose}>
      <div
        aria-labelledby="dashboard-modal-title"
        aria-modal="true"
        className="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold" id="dashboard-modal-title">{title}</h2>
          <button aria-label="Close" className="rounded-full p-1 text-ink-muted hover:bg-canvas hover:text-ink" onClick={onClose} type="button">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NeedsAttention({ applications, profileCompletion }: { applications: Application[]; profileCompletion: number }) {
  const { t } = useTranslation();
  const interviews = applications.filter((application) => application.status === "interview").length;
  const items = [
    ...(profileCompletion < 100 ? [{ label: t("dashboard.attentionProfile"), to: "/app/profile" }] : []),
    ...(interviews > 0 ? [{ label: t("dashboard.attentionInterviews", { count: interviews }), to: "/app/applications" }] : []),
  ];

  return (
    <section className="mb-5 rounded-card border border-line bg-surface px-5 py-4" aria-labelledby="attention-title">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-bold" id="attention-title">{t("dashboard.attentionTitle")}</h2>
        {items.length === 0 ? (
          <p className="text-sm text-ink-muted">{t("dashboard.attentionEmpty")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Link className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-brand-100" key={item.label} to={item.to}>{item.label}</Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AutoApplyModal({ onClose, onStart, profile }: { onClose: () => void; onStart: () => void; profile: ReturnType<typeof useProfile>["profile"] }) {
  const { t } = useTranslation();
  const criteria = [
    profile.desiredRoles.length ? [t("dashboard.criteriaRoles"), profile.desiredRoles.join(", ")] : null,
    profile.location ? [t("dashboard.criteriaLocation"), profile.location] : null,
    profile.employmentTypes.length ? [t("dashboard.criteriaEmployment"), profile.employmentTypes.join(", ")] : null,
    [t("dashboard.criteriaWorkplace"), t(`profile.workPreference.${profile.workPreference}`)],
  ].filter((item): item is string[] => item !== null);

  return (
    <DashboardModal onClose={onClose} title={t("dashboard.autoApplyTitle")}>
      <p className="mt-3 text-sm text-ink-muted">{t("dashboard.autoApplyDescription")}</p>
      <dl className="mt-5 divide-y divide-line rounded-2xl bg-canvas px-4">
        {criteria.map(([label, value]) => <div className="flex justify-between gap-4 py-3 text-sm" key={label}><dt className="text-ink-muted">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>)}
      </dl>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-canvas" onClick={onClose} type="button">{t("dashboard.cancel")}</button>
        <Link className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-canvas" to="/app/profile">{t("dashboard.reviewSettings")}</Link>
        <button className="rounded-full bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800" onClick={onStart} type="button">{t("dashboard.startAutoApply")}</button>
      </div>
    </DashboardModal>
  );
}

function ApplicationsTable({ applications }: { applications: Application[] }) {
  const { t } = useTranslation();

  function nextStep(application: Application) {
    if (application.status === "saved") return t("dashboard.nextStepPrepare");
    if (application.status === "interview") return t("dashboard.nextStepInterview");
    if (application.status === "offer") return t("dashboard.nextStepReviewOffer");
    if (application.status === "rejected" || application.status === "withdrawn") return t("dashboard.nextStepNone");
    return application.follow_up_at ? t("dashboard.nextStepFollowUp") : t("dashboard.nextStepMonitor");
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <div className="grid min-w-[850px] grid-cols-[1.5fr_1fr_.6fr_.8fr_.9fr_1fr] gap-3 border-b border-line px-5 py-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
        <div>{t("dashboard.tableRole")}</div>
        <div>{t("dashboard.tableCompany")}</div>
        <div>{t("dashboard.tableMatch")}</div>
        <div>{t("dashboard.tableApplied")}</div>
        <div>{t("dashboard.tableStatus")}</div>
        <div>{t("dashboard.tableNextStep")}</div>
      </div>
      {applications.map((application) => {
        const statusDetail = applicationStatusDetails[application.status];

        return (
          <div
            className="grid min-w-[850px] grid-cols-[1.5fr_1fr_.6fr_.8fr_.9fr_1fr] items-center gap-3 border-b border-line px-5 py-3.5 text-sm transition-colors last:border-b-0 hover:bg-canvas/60"
            key={application.id}
          >
            <div className="font-semibold">{application.job_title}</div>
            <div className="text-ink-muted">{application.company_name}</div>
            <div className="text-ink-muted">—</div>
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
            <div className="text-ink-muted">{nextStep(application)}</div>
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
  const { isLoading: isProfileLoading, profile } = useProfile();
  const profileCompletion = useMemo(() => getProfileCompletion(profile), [profile]);

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [skippedJobIds, setSkippedJobIds] = useState<Set<string>>(new Set());
  const [explainedJob, setExplainedJob] = useState<MockJob | null>(null);
  const [isAutoApplyOpen, setIsAutoApplyOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query
      ? mockJobs.filter((job) => job.title.toLowerCase().includes(query) && !skippedJobIds.has(job.id))
      : mockJobs.filter((job) => !skippedJobIds.has(job.id));
  }, [searchQuery, skippedJobIds]);
  const visibleJobs = filteredJobs.slice(0, 5);

  function handleApply(jobId: string) {
    setAppliedJobIds((current) => new Set(current).add(jobId));
  }

  function handleStartAutoApply() {
    setAppliedJobIds((current) => {
      const next = new Set(current);
      for (const job of visibleJobs) {
        next.add(job.id);
      }
      return next;
    });
    setIsAutoApplyOpen(false);
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
          {!isLoading && !isProfileLoading && !errorMessage && (
            <NeedsAttention applications={applications} profileCompletion={profileCompletion.percentage} />
          )}

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
                onClick={() => setIsAutoApplyOpen(true)}
                type="button"
              >
                {t("dashboard.startAutoApply")}
              </button>
            </div>
          </div>

          <div className="mb-9 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
            {visibleJobs.map((job, index) => (
              <MatchCard
                isApplied={appliedJobIds.has(job.id)}
                isSaved={savedJobIds.has(job.id)}
                job={job}
                key={job.id}
                onApply={() => handleApply(job.id)}
                onExplain={() => setExplainedJob(job)}
                onSave={() => setSavedJobIds((current) => {
                  const next = new Set(current);
                  next.has(job.id) ? next.delete(job.id) : next.add(job.id);
                  return next;
                })}
                onSkip={() => setSkippedJobIds((current) => new Set(current).add(job.id))}
                tint={cardTints[index % cardTints.length]}
              />
            ))}
          </div>

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

      {explainedJob && (
        <DashboardModal onClose={() => setExplainedJob(null)} title={t("dashboard.whyMatch")}>
          <p className="mt-3 font-semibold">{explainedJob.title}</p>
          <p className="mt-2 text-sm text-ink-muted">{t("dashboard.matchExplanationUnavailable")}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {explainedJob.tags.map((tag) => <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-900" key={tag}>{tag}</span>)}
          </div>
        </DashboardModal>
      )}
      {isAutoApplyOpen && <AutoApplyModal onClose={() => setIsAutoApplyOpen(false)} onStart={handleStartAutoApply} profile={profile} />}
    </>
  );
}
