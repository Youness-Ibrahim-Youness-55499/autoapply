import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MatchRing } from "../components/app/MatchRing";
import { BookmarkIcon, CalendarIcon, ShareIcon, SparkleIcon } from "../components/icons/BrandIcons";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";
import { ErrorState } from "../components/states/ErrorState";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { LinkButton } from "../components/ui/LinkButton";
import { Tabs } from "../components/ui/Tabs";
import { useToast } from "../components/ui/Toast";
import { useApplications } from "../features/applications/useApplications";
import { matchJob } from "../features/jobs/matchJob";
import { matchLabelKey } from "../features/jobs/matchLabel";
import { mockJobs, type MockJob } from "../features/jobs/mockJobs";
import { useJobApplications } from "../features/jobs/useJobApplications";
import { useProfile } from "../features/profile/useProfile";
import { useTranslation } from "../i18n";

type DetailTab = "about" | "benefits" | "overview" | "similar" | "team";

const MAX_CV_TIPS = 3;

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-muted">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function SkillChip({ children, tone }: { children: string; tone: "gap" | "match" }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        tone === "match"
          ? "border-brand-200 bg-brand-50 text-brand-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      {children}
    </span>
  );
}

function JobDetail({ job }: { job: MockJob }) {
  const { locale, t } = useTranslation();
  const { toast } = useToast();
  const { profile } = useProfile();
  const { applications, refresh } = useApplications();
  const { errorMessage, pendingJobId, statusFor, track } = useJobApplications(applications);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const status = statusFor(job);
  const isPending = pendingJobId === job.id;
  const match = useMemo(() => matchJob(job, profile), [job, profile]);

  const applyByDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + job.applyInDays);
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(date);
  }, [job.applyInDays, locale]);

  const similarJobs = useMemo(() => {
    const own = new Set(job.tags);

    return mockJobs
      .filter((other) => other.id !== job.id)
      .map((other) => ({
        job: other,
        overlap: other.tags.filter((tag) => own.has(tag)).length,
        percent: matchJob(other, profile).percent,
      }))
      .filter((entry) => entry.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap || b.percent - a.percent)
      .slice(0, 3);
  }, [job, profile]);

  async function handleTrack(nextStatus: "applied" | "saved") {
    const success = await track(job, nextStatus);
    setIsApplyOpen(false);

    if (success) {
      refresh();
      toast({
        title: t(nextStatus === "applied" ? "jobs.detail.appliedToast" : "jobs.detail.savedToast"),
        type: "success",
      });
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: t("jobs.detail.linkCopied"), type: "success" });
    } catch {
      toast({ title: t("jobs.detail.linkCopyFailed"), type: "error" });
    }
  }

  const tabs = [
    { id: "overview" as const, label: t("jobs.detail.tab.overview") },
    { id: "about" as const, label: t("jobs.detail.tab.about") },
    { id: "team" as const, label: t("jobs.detail.tab.team") },
    { id: "benefits" as const, label: t("jobs.detail.tab.benefits") },
    { id: "similar" as const, label: t("jobs.detail.tab.similar") },
  ];

  const cvTips = match.missingSkills.slice(0, MAX_CV_TIPS);

  return (
    <>
      <Seo description={job.description} noIndex path={`/app/jobs/${job.id}`} title={job.title} />
      <PageContainer className="py-8 sm:py-10 lg:px-8" size="wide">
        <Link className="text-sm font-semibold text-ink-muted hover:text-ink" to="/app/jobs">
          {t("jobs.detail.backToSearch")}
        </Link>

        {errorMessage && (
          <div className="mt-4">
            <ErrorState compact description={errorMessage} title={t("jobs.errorTitle")} />
          </div>
        )}

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-5">
            <Card>
              <div className="flex flex-wrap items-start gap-4">
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-line bg-canvas text-xl font-extrabold text-ink">
                  {job.company
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1 basis-64">
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{job.title}</h1>
                  <p className="mt-1 font-semibold text-ink-muted">{job.company}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {job.location} · {job.jobType} · {job.workMode}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge tone="fullTime">{job.jobType}</Badge>
                    {job.workMode === "Remote" && <Badge tone="remote">{job.workMode}</Badge>}
                    {job.sponsorsVisa && <Badge tone="verified">{t("jobs.detail.sponsorsVisa")}</Badge>}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                      <CalendarIcon className="size-3.5" />
                      {t("jobs.detail.applyBy", { date: applyByDate })}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button onClick={() => void handleShare()} size="sm" variant="secondary">
                    <ShareIcon className="size-4" />
                    {t("jobs.detail.share")}
                  </Button>
                  <Button
                    aria-pressed={status === "saved"}
                    disabled={isPending || status !== null}
                    onClick={() => void handleTrack("saved")}
                    size="sm"
                    variant="secondary"
                  >
                    <BookmarkIcon className="size-4" />
                    {status === "saved" ? t("jobs.saved") : t("jobs.save")}
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <Tabs active={activeTab} label={t("jobs.detail.tabsAria")} onChange={setActiveTab} tabs={tabs} />

              <div className="mt-6 leading-relaxed" role="tabpanel">
                {activeTab === "overview" && (
                  <>
                    <h2 className="text-lg font-bold">{t("jobs.detail.aboutTitle")}</h2>
                    <p className="mt-3 text-sm text-ink-muted">{job.description}</p>

                    <h2 className="mt-8 text-lg font-bold">{t("jobs.detail.responsibilitiesTitle")}</h2>
                    <BulletList items={job.responsibilities} />

                    <h2 className="mt-8 text-lg font-bold">{t("jobs.detail.requirementsTitle")}</h2>
                    <BulletList items={job.requirements} />

                    <h2 className="mt-8 text-lg font-bold">{t("jobs.detail.niceToHaveTitle")}</h2>
                    <BulletList items={job.niceToHave} />
                  </>
                )}

                {activeTab === "about" && (
                  <>
                    <h2 className="text-lg font-bold">{t("jobs.detail.aboutCompany", { company: job.company })}</h2>
                    <p className="mt-3 text-sm text-ink-muted">{job.about}</p>
                    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                      <div className="rounded-xl border border-line bg-canvas p-3">
                        <dt className="text-xs font-semibold text-ink-muted">{t("jobs.filters.industry")}</dt>
                        <dd className="mt-1 font-bold">{job.industry}</dd>
                      </div>
                      <div className="rounded-xl border border-line bg-canvas p-3">
                        <dt className="text-xs font-semibold text-ink-muted">{t("jobs.filters.companySize")}</dt>
                        <dd className="mt-1 font-bold">{job.companySize}</dd>
                      </div>
                      <div className="rounded-xl border border-line bg-canvas p-3">
                        <dt className="text-xs font-semibold text-ink-muted">{t("jobs.filters.experience")}</dt>
                        <dd className="mt-1 font-bold">{job.experienceLevel}</dd>
                      </div>
                    </dl>
                  </>
                )}

                {activeTab === "team" && (
                  <>
                    <h2 className="text-lg font-bold">{t("jobs.detail.teamTitle")}</h2>
                    <p className="mt-3 text-sm text-ink-muted">{job.team}</p>
                  </>
                )}

                {activeTab === "benefits" && (
                  <>
                    <h2 className="text-lg font-bold">{t("jobs.detail.benefitsTitle")}</h2>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {job.benefits.map((benefit) => (
                        <li
                          className="flex items-start gap-2 rounded-xl border border-line bg-canvas p-3 text-sm"
                          key={benefit}
                        >
                          <span aria-hidden="true" className="font-bold text-brand-600">
                            ✓
                          </span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {activeTab === "similar" && (
                  <>
                    <h2 className="text-lg font-bold">{t("jobs.detail.similarTitle")}</h2>
                    {similarJobs.length === 0 ? (
                      <p className="mt-3 text-sm text-ink-muted">{t("jobs.detail.similarNone")}</p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {similarJobs.map(({ job: other, percent }) => (
                          <li key={other.id}>
                            <Link
                              className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-brand-300 hover:bg-brand-50/40"
                              to={`/app/jobs/${other.id}`}
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold">{other.title}</span>
                                <span className="block truncate text-xs text-ink-muted">
                                  {other.company} · {other.location}
                                </span>
                              </span>
                              <span className="shrink-0 text-sm font-extrabold text-brand-700">{percent}%</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="text-center">
              <MatchRing percent={match.percent} size="lg" />
              <p className="mt-4 font-bold text-brand-800">{t(matchLabelKey(match.percent))}</p>
              <p className="mt-1 text-sm text-ink-muted">
                €{job.salaryMin.toLocaleString(locale)} – €{job.salaryMax.toLocaleString(locale)}
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <Button
                  className="w-full"
                  disabled={isPending || status !== null}
                  onClick={() => setIsApplyOpen(true)}
                >
                  {status === "applied" ? t("dashboard.applied") : t("dashboard.apply")}
                </Button>
                <LinkButton className="w-full" to={`/app/cv-optimizer?job=${job.id}`} variant="secondary">
                  <SparkleIcon className="size-4" />
                  {t("jobs.detail.optimizeCv")}
                </LinkButton>
              </div>
            </Card>

            <Card padding="sm">
              <h2 className="text-sm font-bold">{t("jobs.detail.whyMatch")}</h2>
              {match.isPlaceholder ? (
                <>
                  <p className="mt-2 text-xs text-ink-muted">{t("jobs.detail.placeholderMatch")}</p>
                  <LinkButton className="mt-3" size="sm" to="/app/profile" variant="secondary">
                    {t("jobs.detail.addSkills")}
                  </LinkButton>
                </>
              ) : (
                <>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {match.matchedSkills.length === 0 ? (
                      <p className="text-xs text-ink-muted">{t("jobs.detail.noMatched")}</p>
                    ) : (
                      match.matchedSkills.map((skill) => (
                        <SkillChip key={skill} tone="match">
                          {skill}
                        </SkillChip>
                      ))
                    )}
                  </div>
                  <p className="mt-3 text-xs text-ink-muted">
                    {t(match.locationFit ? "jobs.detail.locationFits" : "jobs.detail.locationNoFit")}
                  </p>

                  <h3 className="mt-5 text-sm font-bold">{t("jobs.detail.missingSkills")}</h3>
                  {match.missingSkills.length === 0 ? (
                    <p className="mt-2 text-xs text-ink-muted">{t("jobs.detail.noMissing")}</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {match.missingSkills.map((skill) => (
                        <SkillChip key={skill} tone="gap">
                          {skill}
                        </SkillChip>
                      ))}
                    </div>
                  )}
                </>
              )}
            </Card>

            {!match.isPlaceholder && (
              <Card padding="sm">
                <h2 className="text-sm font-bold">{t("jobs.detail.cvTitle")}</h2>
                {cvTips.length === 0 ? (
                  <p className="mt-2 text-xs text-ink-muted">{t("jobs.detail.cvNone")}</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {cvTips.map((skill) => (
                      <li className="flex items-start gap-2 text-xs text-ink-muted" key={skill}>
                        <span aria-hidden="true" className="mt-0.5 font-bold text-amber-500">
                          !
                        </span>
                        {t("jobs.detail.cvTip", { skill })}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>
        </div>
      </PageContainer>

      <ConfirmModal
        cancelLabel={t("jobs.detail.cancel")}
        confirmLabel={t("jobs.detail.applyConfirm")}
        description={t("jobs.detail.applyBody", { company: job.company, title: job.title })}
        isBusy={isPending}
        isOpen={isApplyOpen}
        onCancel={() => setIsApplyOpen(false)}
        onConfirm={() => void handleTrack("applied")}
        title={t("jobs.detail.applyTitle")}
      />
    </>
  );
}

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const job = mockJobs.find((item) => item.id === id);

  if (!job) {
    return (
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <EmptyState
          action={
            <Button onClick={() => navigate("/app/jobs")} variant="secondary">
              {t("jobs.title")}
            </Button>
          }
          description={t("jobs.detail.notFoundDescription")}
          title={t("jobs.detail.notFoundTitle")}
        />
      </PageContainer>
    );
  }

  return <JobDetail job={job} key={job.id} />;
}
