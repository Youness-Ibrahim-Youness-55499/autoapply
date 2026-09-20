import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MatchRing } from "../components/app/MatchRing";
import { LightbulbIcon } from "../components/icons/BrandIcons";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DemoBadge } from "../components/ui/DemoBadge";
import { LinkButton } from "../components/ui/LinkButton";
import { SplitButton } from "../components/ui/SplitButton";
import { Tabs } from "../components/ui/Tabs";
import { useToast } from "../components/ui/Toast";
import {
  demoOptimizer,
  profileToCv,
  wordCount,
  type CvChange,
  type CvDocument,
  type CvOptimization,
} from "../features/cv/cvOptimizer";
import { matchJob } from "../features/jobs/matchJob";
import { mockJobs } from "../features/jobs/mockJobs";
import { useProfile } from "../features/profile/useProfile";
import { useTranslation } from "../i18n";

type InsightTab = "gaps" | "insights" | "keywords";
type Version = "optimized" | "original";
type Decision = "approved" | "rejected" | null;

function changeText(change: CvChange, t: ReturnType<typeof useTranslation>["t"]) {
  switch (change.kind) {
    case "headline":
      return t("cv.change.headline", { role: change.role });
    case "keywords":
      return t("cv.change.keywords", { keywords: change.keywords.join(", ") });
    case "skillsOrder":
      return t("cv.change.skillsOrder", { count: change.count });
    case "summary":
      return t("cv.change.summary", { company: change.company, role: change.role });
  }
}

function CvSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="mt-5">
      <h4 className="border-b border-line pb-1 text-[0.6875rem] font-extrabold uppercase tracking-wider text-brand-800">
        {title}
      </h4>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function CvPage({
  cv,
  highlightSkills,
  highlightSummary,
}: {
  cv: CvDocument;
  highlightSkills: string[];
  highlightSummary: boolean;
}) {
  const { t } = useTranslation();
  const highlighted = new Set(highlightSkills.map((skill) => skill.toLowerCase()));

  return (
    <div className="text-sm leading-relaxed">
      <h3 className="text-xl font-extrabold tracking-tight">{cv.name || "—"}</h3>
      {cv.headline && <p className="font-semibold text-brand-800">{cv.headline}</p>}

      {cv.summary && (
        <CvSection title={t("cv.section.summary")}>
          <p className={highlightSummary ? "rounded-md bg-brand-50 px-2 py-1.5" : ""}>{cv.summary}</p>
        </CvSection>
      )}

      {cv.experience.length > 0 && (
        <CvSection title={t("cv.section.experience")}>
          <div className="space-y-3">
            {cv.experience.map((entry, index) => (
              <div key={`${entry.company}-${index}`}>
                <p className="font-bold">
                  {entry.role}
                  {entry.company && <span className="font-semibold text-ink-muted"> · {entry.company}</span>}
                </p>
                {entry.period && <p className="text-xs text-ink-muted">{entry.period}</p>}
                {entry.bullets.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-muted">
                    {entry.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CvSection>
      )}

      {cv.education.length > 0 && (
        <CvSection title={t("cv.section.education")}>
          <ul className="space-y-0.5">
            {cv.education.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </CvSection>
      )}

      {cv.skills.length > 0 && (
        <CvSection title={t("cv.section.skills")}>
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((skill) => (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  highlighted.has(skill.toLowerCase())
                    ? "border-brand-300 bg-brand-50 text-brand-800"
                    : "border-line bg-canvas text-ink"
                }`}
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        </CvSection>
      )}
    </div>
  );
}

export function CvOptimizerPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isLoading, profile } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();

  const sortedJobs = useMemo(
    () =>
      mockJobs
        .map((job) => ({ job, percent: matchJob(job, profile).percent }))
        .sort((a, b) => b.percent - a.percent),
    [profile],
  );
  const requestedId = searchParams.get("job");
  const selected = sortedJobs.find((entry) => entry.job.id === requestedId) ?? sortedJobs[0];
  const job = selected.job;
  const match = useMemo(() => matchJob(job, profile), [job, profile]);

  const [result, setResult] = useState<CvOptimization | null>(null);
  const [tab, setTab] = useState<InsightTab>("insights");
  const [decision, setDecision] = useState<Decision>(null);
  const [printing, setPrinting] = useState<Version | null>(null);

  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setDecision(null);
    void demoOptimizer.optimize({ job, profile }).then((next) => {
      if (!cancelled) setResult(next);
    });
    return () => {
      cancelled = true;
    };
  }, [job, profile]);

  const original = useMemo(() => profileToCv(profile), [profile]);
  const hasContent =
    original.summary.length > 0 || original.skills.length > 0 || original.experience.length > 0;

  function exportCv(version: Version) {
    setPrinting(version);
    window.setTimeout(() => {
      window.print();
      setPrinting(null);
    }, 60);
  }

  const defaultVersion: Version = decision === "rejected" ? "original" : "optimized";

  const tabs = [
    { id: "insights" as const, label: t("cv.tab.insights") },
    { id: "keywords" as const, label: t("cv.tab.keywords") },
    { id: "gaps" as const, label: t("cv.tab.gaps") },
  ];

  return (
    <>
      <Seo description={t("cv.description")} noIndex path="/app/cv-optimizer" title={t("cv.title")} />
      <PageContainer className="py-6 sm:py-8 lg:px-8" size="wide">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t("cv.title")}</h1>
            <p className="mt-1 max-w-xl text-sm text-ink-muted">{t("cv.description")}</p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="block text-xs font-bold text-ink-muted">
              {t("cv.targetRole")}
              <select
                aria-label={t("cv.selectJobAria")}
                className="mt-1 block min-h-11 min-w-64 cursor-pointer rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
                onChange={(event) => setSearchParams({ job: event.target.value })}
                value={job.id}
              >
                {sortedJobs.map((entry) => (
                  <option key={entry.job.id} value={entry.job.id}>
                    {entry.job.title} · {entry.job.company}
                  </option>
                ))}
              </select>
            </label>

            <SplitButton
              actions={[
                { label: t("cv.exportOptimized"), onSelect: () => exportCv("optimized") },
                { label: t("cv.exportOriginal"), onSelect: () => exportCv("original") },
              ]}
              disabled={!hasContent}
              onClick={() => exportCv(defaultVersion)}
            >
              {t("cv.export")}
            </SplitButton>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-ink-muted">{t("loading.profile")}</p>
        ) : !hasContent ? (
          <div className="mt-8">
            <EmptyState
              action={<LinkButton to="/app/profile">{t("cv.emptyCta")}</LinkButton>}
              description={t("cv.emptyBody")}
              title={t("cv.emptyTitle")}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="grid gap-5 md:grid-cols-2">
              <Card className={printing === "original" ? "print-cv" : ""} padding="sm">
                <div className="mb-3 flex items-center justify-between gap-2 print:hidden">
                  <h2 className="text-base font-bold">{t("cv.original")}</h2>
                  <span className="text-xs font-semibold text-ink-muted">
                    {t("cv.words", { count: wordCount(original) })}
                  </span>
                </div>
                <CvPage cv={original} highlightSkills={[]} highlightSummary={false} />
              </Card>

              <Card
                className={`${printing === "optimized" ? "print-cv" : ""} ${decision === "rejected" ? "opacity-60" : ""}`}
                padding="sm"
              >
                <div className="mb-3 flex items-center justify-between gap-2 print:hidden">
                  <h2 className="flex items-center gap-2 text-base font-bold">
                    {t("cv.optimized")}
                    <DemoBadge />
                  </h2>
                  <span className="text-xs font-semibold text-ink-muted">
                    {result ? t("cv.words", { count: wordCount(result.optimized) }) : ""}
                  </span>
                </div>
                {result ? (
                  <CvPage
                    cv={result.optimized}
                    highlightSkills={result.keywordsCovered}
                    highlightSummary={result.optimized.summary !== original.summary}
                  />
                ) : (
                  <p className="text-sm text-ink-muted">{t("cv.optimizing")}</p>
                )}
                <p className="mt-4 text-xs text-ink-muted print:hidden">{t("cv.sampleNote")}</p>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="text-center" padding="sm">
                <p className="text-sm font-bold">{t("cv.matchScore")}</p>
                <div className="mt-3 flex justify-center">
                  <MatchRing percent={match.percent} size="lg" />
                </div>
                <p className="mt-3 text-xs text-ink-muted">
                  {match.isPlaceholder
                    ? t("cv.matchPlaceholder")
                    : t("cv.matchExplain", { job: job.title, company: job.company })}
                </p>
              </Card>

              <Card padding="sm">
                <Tabs active={tab} label={t("cv.tabsAria")} onChange={setTab} tabs={tabs} />
                <div className="mt-4" role="tabpanel">
                  {tab === "insights" && (
                    <>
                      {result && result.changes.length > 0 ? (
                        <ol className="space-y-3">
                          {result.changes.map((change, index) => (
                            <li className="flex gap-3 text-sm" key={`${change.kind}-${index}`}>
                              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-800">
                                {index + 1}
                              </span>
                              <span className="text-ink-muted">{changeText(change, t)}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm text-ink-muted">{t("cv.insights.empty")}</p>
                      )}
                    </>
                  )}

                  {tab === "keywords" && result && (
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-xs font-bold text-ink-muted">{t("cv.keywords.covered")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.keywordsCovered.length === 0 ? (
                            <span className="text-xs text-ink-muted">{t("cv.keywords.none")}</span>
                          ) : (
                            result.keywordsCovered.map((keyword) => (
                              <span
                                className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800"
                                key={keyword}
                              >
                                {keyword}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-bold text-ink-muted">{t("cv.keywords.missing")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.keywordsMissing.length === 0 ? (
                            <span className="text-xs text-ink-muted">{t("cv.keywords.none")}</span>
                          ) : (
                            result.keywordsMissing.map((keyword) => (
                              <span
                                className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                                key={keyword}
                              >
                                {keyword}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === "gaps" && result && (
                    <>
                      {result.keywordsMissing.length === 0 ? (
                        <p className="text-sm text-ink-muted">{t("cv.gaps.none")}</p>
                      ) : (
                        <>
                          <p className="text-sm text-ink-muted">{t("cv.gaps.intro")}</p>
                          <ul className="mt-3 space-y-2">
                            {result.keywordsMissing.map((keyword) => (
                              <li
                                className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
                                key={keyword}
                              >
                                <span aria-hidden="true">!</span>
                                {keyword}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </>
                  )}
                </div>
              </Card>

              <div className="soft-card rounded-card border border-line p-5">
                <p className="flex items-center gap-2 text-sm font-bold">
                  <LightbulbIcon className="size-5 text-accent-gold" />
                  {t("cv.proTip.title")}
                </p>
                <p className="mt-2 text-sm text-ink-muted">{t("cv.proTip.body")}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  disabled={!result}
                  onClick={() => {
                    setDecision("rejected");
                    toast({ title: t("cv.rejectedToast"), type: "info" });
                  }}
                  variant="secondary"
                >
                  {t("cv.reject")}
                </Button>
                <Button
                  className="flex-1"
                  disabled={!result}
                  onClick={() => {
                    setDecision("approved");
                    toast({ title: t("cv.approvedToast"), type: "success" });
                  }}
                >
                  {t("cv.approve")}
                </Button>
              </div>
              {decision === "rejected" && <p className="text-xs text-ink-muted">{t("cv.rejectedNote")}</p>}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
}
