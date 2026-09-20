import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { StatTile } from "../components/app/StatTile";
import { Waves } from "../components/decorations/Waves";
import { BarChart } from "../components/charts/BarChart";
import {
  ArrowRightIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ForwardIcon,
  PeopleIcon,
  SuccessIcon,
  WorkIcon,
} from "../components/icons/BrandIcons";
import { PageContainer } from "../components/layout/PageContainer";
import { Logo } from "../components/Logo";
import { Seo } from "../components/Seo";
import { ErrorState } from "../components/states/ErrorState";
import { ArrowLink } from "../components/ui/ArrowLink";
import { Card } from "../components/ui/Card";
import { DemoBadge } from "../components/ui/DemoBadge";
import { LinkButton } from "../components/ui/LinkButton";
import { ProgressBar } from "../components/ui/ProgressBar";
import { buildWeeklyActivity, recentCounts, sum } from "../features/applications/activityStats";
import { getApplicationStats } from "../features/applications/applicationStats";
import { selectUpcoming } from "../features/applications/upcoming";
import { useWorkspaceEvents } from "../features/applications/useWorkspaceEvents";
import { useApplications } from "../features/applications/useApplications";
import { useDocuments } from "../features/documents/useDocuments";
import { matchJob } from "../features/jobs/matchJob";
import { mockJobs } from "../features/jobs/mockJobs";
import { useRecommendedJobs } from "../features/jobs/useRecommendedJobs";
import { useJobApplications, type TrackableJob } from "../features/jobs/useJobApplications";
import { getProfileCompletion } from "../features/profile/profile.utils";
import { READINESS_LABEL_KEYS, READINESS_ORDER } from "../features/profile/profileSectionLabels";
import { useProfile } from "../features/profile/useProfile";
import { useTranslation } from "../i18n";

const ACTIVITY_WEEKS = 8;
const ACTIVITY_COLORS = { applications: "#10b981", interviews: "#f4b400", responses: "#065f46" } as const;

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

function CompanyMark({ company }: { company: string }) {
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-canvas text-sm font-extrabold text-ink">
      {company
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </span>
  );
}

function greetingKey(hour: number) {
  if (hour < 12) return "dashboard.greetingMorning";
  if (hour < 18) return "dashboard.greetingAfternoon";
  return "dashboard.greetingEvening";
}

export function ProductHomePage() {
  const { locale, t } = useTranslation();
  const { session } = useAuth();
  const metadataName = session?.user.user_metadata.name;
  const name = typeof metadataName === "string" && metadataName.trim() ? metadataName.trim() : "";

  const { applications, errorMessage, refresh } = useApplications();
  const { activity, events } = useWorkspaceEvents();
  const { profile } = useProfile();
  const { documents } = useDocuments();
  const { pendingJobId, statusFor, track } = useJobApplications(applications);
  // Live openings from the job service; the sample listings are only a fallback
  // (service offline or empty), and are labelled as such.
  const { jobs: liveJobs } = useRecommendedJobs();

  const stats = useMemo(() => getApplicationStats(applications), [applications]);
  const recent = useMemo(() => recentCounts(applications, activity, 7), [applications, activity]);
  const weekly = useMemo(
    () => buildWeeklyActivity(applications, activity, ACTIVITY_WEEKS),
    [applications, activity],
  );
  const completion = useMemo(() => getProfileCompletion(profile), [profile]);
  const upcomingInterviews = useMemo(
    () => selectUpcoming(events, new Date(), 7).filter((event) => event.kind === "interview").length,
    [events],
  );

  const ranked = useMemo(
    () =>
      mockJobs
        .map((job) => ({ job, match: matchJob(job, profile) }))
        .sort((a, b) => b.match.percent - a.match.percent),
    [profile],
  );
  const hasLiveJobs = liveJobs.length > 0;
  const nextOpportunities = ranked.slice(0, 3);
  const recommended = ranked.slice(3, 6);
  const usesPlaceholderScores = ranked.some((item) => item.match.isPlaceholder);

  const hasCv = documents.some((document) => document.category === "cv");
  const hasDefaultCv = documents.some((document) => document.category === "cv" && document.isDefault);
  const hasCoverLetter = documents.some((document) => document.category === "cover_letter");

  function delta(count: number) {
    return count > 0 ? t("dashboard.deltaThisWeek", { count }) : undefined;
  }

  async function handleSave(job: TrackableJob) {
    const success = await track(job, "saved");
    if (success) refresh();
  }

  // Rule-based "next step" (no AI): the first rule that applies wins.
  const nextStep =
    completion.percentage < 100
      ? { body: t("dashboard.tip.profile", { percent: completion.percentage }), cta: t("dashboard.tip.ctaProfile"), to: "/app/profile" }
      : applications.length === 0
        ? { body: t("dashboard.tip.noApplications"), cta: t("dashboard.tip.ctaJobs"), to: "/app/jobs" }
        : upcomingInterviews > 0
          ? { body: t("dashboard.tip.interviews"), cta: t("dashboard.tip.ctaApplications"), to: "/app/applications" }
          : { body: t("dashboard.tip.default", { count: recent.applications }), cta: t("dashboard.tip.ctaJobs"), to: "/app/jobs" };

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

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <section className="soft-card relative overflow-hidden rounded-card border border-line p-6 sm:p-8">
            <p className="eyebrow">{t(greetingKey(new Date().getHours()), { name: name || t("dashboard.thereFallback") })}</p>
            <h1 className="mt-3 max-w-md text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
              {t("dashboard.heroTitle")}
            </h1>
            <p className="mt-3 max-w-md text-sm text-ink-muted">{t("dashboard.heroBody")}</p>
            <div className="relative z-10 mt-5 flex flex-wrap gap-3">
              <LinkButton to="/app/jobs">
                {t("dashboard.findOpportunities")}
                <ArrowRightIcon className="size-4" />
              </LinkButton>
              <LinkButton to="/app/cv-optimizer" variant="secondary">
                {t("dashboard.improveCv")}
              </LinkButton>
            </div>
            <Logo className="pointer-events-none absolute right-8 top-1/2 hidden h-40 -translate-y-1/2 md:block" variant="icon" />
            <Waves className="h-14" />
          </section>

          <Card className="flex flex-col" padding="sm">
            <p className="eyebrow">{t("dashboard.nextStep")}</p>
            <p className="mt-3 text-base font-semibold leading-snug">{nextStep.body}</p>
            <div className="mt-auto pt-5">
              <LinkButton size="sm" to={nextStep.to}>
                {nextStep.cta}
                <ArrowRightIcon className="size-4" />
              </LinkButton>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile delta={delta(recent.applications)} icon={<WorkIcon />} label={t("dashboard.statTotal")} value={stats.total} />
          <StatTile delta={delta(recent.interviews)} icon={<PeopleIcon />} label={t("dashboard.statInterviews")} value={stats.interviews} />
          <StatTile delta={delta(recent.offers)} icon={<SuccessIcon />} label={t("dashboard.statOffers")} value={stats.offers} />
          <StatTile icon={<ForwardIcon />} label={t("dashboard.statResponseRate")} value={`${stats.responseRate}%`} />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5">
            <Panel
              action={
                <span className="flex items-center gap-3">
                  {!hasLiveJobs && <DemoBadge />}
                  <ArrowLink to="/app/jobs">{t("dashboard.viewAll")}</ArrowLink>
                </span>
              }
              title={t("dashboard.nextOpportunities")}
            >
              <ul className="space-y-2.5">
                {hasLiveJobs
                  ? liveJobs.slice(0, 3).map((job) => {
                      const status = statusFor(job);

                      return (
                        <li className="flex items-center gap-3 rounded-xl border border-line p-3" key={job.id}>
                          <CompanyMark company={job.company} />
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold">{job.title}</span>
                            <span className="block truncate text-xs text-ink-muted">{job.company} · {job.location}</span>
                            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              {job.tags.map((chip) => (
                                <span className="rounded-full bg-canvas px-2 py-0.5 text-[0.6875rem] font-semibold text-ink" key={chip}>
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
                          <button
                            aria-label={t("jobs.saveAria", { title: job.title })}
                            aria-pressed={status === "saved"}
                            className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
                              status === "saved" ? "text-brand-700" : "text-ink-muted hover:bg-canvas hover:text-ink"
                            }`}
                            disabled={pendingJobId === job.id || status !== null}
                            onClick={() => void handleSave(job)}
                            type="button"
                          >
                            <BookmarkIcon className={status === "saved" ? "size-5 fill-current" : "size-5"} />
                          </button>
                        </li>
                      );
                    })
                  : nextOpportunities.map(({ job }) => {
                      const status = statusFor(job);

                      return (
                        <li className="flex items-center gap-3 rounded-xl border border-line p-3" key={job.id}>
                          <CompanyMark company={job.company} />
                          <Link className="min-w-0 flex-1" to={`/app/jobs/${job.id}`}>
                            <span className="block truncate text-sm font-bold">{job.title}</span>
                            <span className="block truncate text-xs text-ink-muted">{job.company} · {job.location}</span>
                            <span className="mt-1.5 flex flex-wrap gap-1.5">
                              {[job.workMode, job.jobType].map((chip) => (
                                <span className="rounded-full bg-canvas px-2 py-0.5 text-[0.6875rem] font-semibold text-ink" key={chip}>
                                  {chip}
                                </span>
                              ))}
                            </span>
                          </Link>
                          <button
                            aria-label={t("jobs.saveAria", { title: job.title })}
                            aria-pressed={status === "saved"}
                            className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
                              status === "saved" ? "text-brand-700" : "text-ink-muted hover:bg-canvas hover:text-ink"
                            }`}
                            disabled={pendingJobId === job.id || status !== null}
                            onClick={() => void handleSave(job)}
                            type="button"
                          >
                            <BookmarkIcon className={status === "saved" ? "size-5 fill-current" : "size-5"} />
                          </button>
                        </li>
                      );
                    })}
              </ul>
            </Panel>

            <Panel
              action={
                <span className="flex items-center gap-3">
                  <DemoBadge />
                  <ArrowLink to="/app/jobs">{t("dashboard.viewAll")}</ArrowLink>
                </span>
              }
              title={t("dashboard.recommended")}
            >
              <div className="grid grid-cols-3 gap-2.5">
                {recommended.map(({ job }) => (
                  <Link className="rounded-xl border border-line p-3 transition hover:bg-canvas" key={job.id} to={`/app/jobs/${job.id}`}>
                    <span className="block truncate text-sm font-bold">{job.company}</span>
                    <span className="mt-0.5 block truncate text-xs text-ink-muted">{job.title}</span>
                    <span className="mt-2 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-brand-800">
                      {job.workMode}
                    </span>
                  </Link>
                ))}
              </div>
            </Panel>
          </div>

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

            <Panel
              action={
                <span className="flex items-center gap-3">
                  <DemoBadge />
                  <ArrowLink to="/app/jobs">{t("dashboard.viewAll")}</ArrowLink>
                </span>
              }
              title={t("dashboard.recentMatches")}
            >
              <ul className="space-y-3.5">
                {ranked.slice(0, 3).map(({ job, match }) => (
                  <li key={job.id}>
                    <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate font-semibold">{job.company}</span>
                      <span className="shrink-0 text-xs font-bold text-brand-700">{match.percent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${match.percent}%` }} />
                    </div>
                    <p className="mt-1 truncate text-xs text-ink-muted">{job.title}</p>
                  </li>
                ))}
              </ul>
              {usesPlaceholderScores && (
                <p className="mt-4 text-xs text-ink-muted">{t("dashboard.placeholderScores")}</p>
              )}
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

            <Panel title={t("dashboard.cvReadiness")}>
              <p className="text-sm text-ink-muted">{t("dashboard.cvReadinessHint")}</p>
              <ul className="mt-4 space-y-2.5">
                {[
                  { done: hasCv, label: t("dashboard.cvCheckUploaded") },
                  { done: hasDefaultCv, label: t("dashboard.cvCheckDefault") },
                  { done: hasCoverLetter, label: t("dashboard.cvCheckCoverLetter") },
                ].map((item) => (
                  <li className="flex items-center gap-2.5 text-sm" key={item.label}>
                    {item.done ? (
                      <CheckCircleIcon className="size-5 shrink-0 text-brand-600" />
                    ) : (
                      <span aria-hidden="true" className="size-5 shrink-0 rounded-full border-2 border-amber-300" />
                    )}
                    {item.label}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <LinkButton size="sm" to="/app/cv-optimizer">
                  {t("dashboard.optimizeCv")}
                </LinkButton>
                <LinkButton size="sm" to="/app/documents" variant="secondary">
                  {t("dashboard.manageDocuments")}
                </LinkButton>
              </div>
            </Panel>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
