import { useTranslation } from "../../../i18n";
import { processStages } from "./ProcessTabs";

type StagePreviewProps = {
  stage: number;
};

const stageCopyKeys = [
  {
    eyebrow: "stagePreview.find.eyebrow",
    title: "stagePreview.find.title",
    description: "stagePreview.find.description",
  },
  {
    eyebrow: "stagePreview.prep.eyebrow",
    title: "stagePreview.prep.title",
    description: "stagePreview.prep.description",
  },
  {
    eyebrow: "stagePreview.apply.eyebrow",
    title: "stagePreview.apply.title",
    description: "stagePreview.apply.description",
  },
  {
    eyebrow: "stagePreview.track.eyebrow",
    title: "stagePreview.track.title",
    description: "stagePreview.track.description",
  },
];

export function StagePreview({ stage }: StagePreviewProps) {
  const { t } = useTranslation();
  const copy = stageCopyKeys[stage];

  return (
    <article className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card">
      <header className="grid gap-2 border-b border-line px-6 py-4 sm:grid-cols-[0.9fr_1.1fr] sm:items-center lg:px-7">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-brand-700">
            0{stage + 1} Â· {t(copy.eyebrow)}
          </p>
          <h3 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-ink">
            {t(copy.title)}
          </h3>
        </div>
        <p className="max-w-xl text-sm leading-5 text-ink-muted sm:justify-self-end">
          {t(copy.description)}
        </p>
      </header>

      <div className="min-h-0 flex-1 p-4">
        {stage === 0 ? <FindPanel /> : null}
        {stage === 1 ? <PrepPanel /> : null}
        {stage === 2 ? <ApplyPanel /> : null}
        {stage === 3 ? <TrackPanel /> : null}
      </div>
    </article>
  );
}

export function MobileStagePreview({ stage }: StagePreviewProps) {
  const { t } = useTranslation();

  return (
    <section aria-labelledby={`mobile-stage-${stage}`} className="space-y-4">
      <p className="eyebrow" id={`mobile-stage-${stage}`}>
        0{stage + 1} · {t(processStages[stage])}
      </p>
      <StagePreview stage={stage} />
    </section>
  );
}

function FindPanel() {
  const { t } = useTranslation();
  const roles = [
    ["stagePreview.find.roleProductDesigner", "stagePreview.find.companyNorthstar", "94%"],
    ["stagePreview.find.roleSeniorUxDesigner", "stagePreview.find.companyDaylight", "89%"],
    ["stagePreview.find.roleDesignSystemsLead", "stagePreview.find.companyMosaic", "86%"],
  ];

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="flex min-h-0 flex-col rounded-2xl bg-[#11172a] p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70">{t("stagePreview.find.newOpportunities")}</p>
            <p className="mt-1 text-3xl font-semibold leading-none tracking-[-0.05em]">24</p>
          </div>
          <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs text-brand-200">
            {t("stagePreview.find.updatedNow")}
          </span>
        </div>
        <div className="mt-3 min-h-0 space-y-2">
          {roles.map(([role, company, match]) => (
            <div className="grid grid-cols-[1fr_auto] items-center rounded-xl border border-white/10 bg-white/[0.045] px-4 py-2.5" key={role}>
              <div>
                <p className="text-sm font-semibold">{t(role)}</p>
                <p className="mt-1 text-xs text-white/70">{t(company)}</p>
              </div>
              <span className="text-sm font-semibold text-brand-200">{match}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid min-h-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <MiniMetric label={t("stagePreview.find.metricSources") } value="7" />
        <MiniMetric label={t("stagePreview.find.metricConfidence") } value="18" />
      </div>
    </div>
  );
}

function PrepPanel() {
  const { t } = useTranslation();

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="grid min-h-0 grid-rows-2 gap-3">
        <LightCard label={t("stagePreview.prep.cardOneLabel")} title={t("stagePreview.prep.cardOneTitle")}>
          <p className="rounded-xl bg-white p-3 text-sm leading-5 text-ink-muted">
            {t("stagePreview.prep.cardOneBody")}
          </p>
        </LightCard>
        <LightCard label={t("stagePreview.prep.cardTwoLabel")} title={t("stagePreview.prep.cardTwoTitle")}>
          <div className="space-y-1.5 text-sm text-ink-muted">
            <p className="rounded-lg border border-line bg-white px-3 py-1.5">{t("stagePreview.prep.cardTwoPointOne")}</p>
            <p className="rounded-lg border border-line bg-white px-3 py-1.5">{t("stagePreview.prep.cardTwoPointTwo")}</p>
          </div>
        </LightCard>
      </div>
      <div className="flex min-h-0 flex-col rounded-2xl bg-[#11172a] p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-300">{t("stagePreview.prep.documentPreviewLabel")}</p>
        <h4 className="mt-2 text-xl font-semibold">{t("stagePreview.prep.documentPreviewTitle")}</h4>
        <div className="mt-3 min-h-0 flex-1 rounded-xl bg-white p-4 text-ink">
          <p className="text-sm font-semibold">{t("stagePreview.prep.selectedExperienceTitle")}</p>
          <div className="mt-3 space-y-2 text-sm leading-5">
            <p className="rounded-lg bg-emerald-50 px-3 py-2">{t("stagePreview.prep.selectedExperiencePointOne")}</p>
            <p className="rounded-lg bg-emerald-50 px-3 py-2">{t("stagePreview.prep.selectedExperiencePointTwo")}</p>
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-brand-800">{t("stagePreview.prep.selectedExperiencePointThree")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplyPanel() {
  const { t } = useTranslation();
  const checks = [
    t("stagePreview.apply.checkContact"),
    t("stagePreview.apply.checkCv"),
    t("stagePreview.apply.checkCoverLetter"),
    t("stagePreview.apply.checkScreening"),
  ];

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="flex min-h-0 flex-col rounded-2xl bg-[#11172a] p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-300">{t("stagePreview.apply.reviewLabel")}</p>
            <h4 className="mt-2 text-xl font-semibold">{t("stagePreview.apply.reviewTitle")}</h4>
          </div>
          <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs text-amber-100">{t("stagePreview.apply.awaitingApproval")}</span>
        </div>
        <div className="mt-3 grid min-h-0 flex-1 gap-2.5 sm:grid-cols-2">
          {checks.map((check) => (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3" key={check}>
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-xs text-emerald-200">âœ“</span>
              <span className="text-sm text-white/78">{check}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <p className="text-xs text-white/70">{t("stagePreview.apply.reviewNote")}</p>
          <span className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold">{t("stagePreview.apply.approveButton")}</span>
        </div>
      </div>
      <div className="grid min-h-0 gap-4">
        <MiniMetric label={t("stagePreview.apply.metricForms")} value="18" />
        <MiniMetric label={t("stagePreview.apply.metricReviewTime")} value="2m 14s" />
      </div>
    </div>
  );
}

function TrackPanel() {
  const { t } = useTranslation();
  const pipeline = [
    [t("stagePreview.track.metricSubmitted"), "18"],
    [t("stagePreview.track.metricViewed"), "11"],
    [t("stagePreview.track.metricReplied"), "5"],
    [t("stagePreview.track.metricInterview"), "2"],
  ];

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="flex min-h-0 flex-col rounded-2xl bg-[#11172a] p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-300">{t("stagePreview.track.pipelineLabel")}</p>
            <h4 className="mt-2 text-xl font-semibold">{t("stagePreview.track.pipelineTitle")}</h4>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">{t("stagePreview.track.interviewsCount")}</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {pipeline.map(([label, value]) => (
            <div className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5" key={label}>
              <p className="text-[0.6875rem] text-white/70">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 min-h-0 space-y-1.5">
          <PipelineRow
            company={t("stagePreview.track.companyNorthstar")}
            next={t("stagePreview.track.pipelineNextInterview")}
            status={t("stagePreview.track.statusInterview")}
          />
          <PipelineRow
            company={t("stagePreview.track.companyDaylight")}
            next={t("stagePreview.track.pipelineNextReply")}
            status={t("stagePreview.track.statusReplied")}
          />
          <PipelineRow
            company={t("stagePreview.track.companyMosaic")}
            next={t("stagePreview.track.pipelineNextViewed")}
            status={t("stagePreview.track.statusViewed")}
          />
        </div>
      </div>
      <LightCard label={t("stagePreview.track.upcomingLabel")} title={t("stagePreview.track.upcomingTitle") }>
        <div className="space-y-3">
          <ScheduleRow company={t("stagePreview.track.companyNorthstar")} time={t("stagePreview.track.upcomingTimeOne")} />
          <ScheduleRow company={t("stagePreview.track.companyMosaicLabs")} time={t("stagePreview.track.upcomingTimeTwo")} />
        </div>
      </LightCard>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-0 flex-col justify-between rounded-2xl border border-line bg-canvas p-4">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-700">{label}</p>
      <p className="mt-4 text-4xl font-semibold leading-none tracking-[-0.05em] text-ink">{value}</p>
    </div>
  );
}

function LightCard({ children, label, title }: { children: React.ReactNode; label: string; title: string }) {
  return (
    <div className="min-h-0 overflow-hidden rounded-2xl border border-line bg-canvas p-4">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-700">{label}</p>
      <h4 className="mt-2 text-lg font-semibold text-ink">{title}</h4>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Mark({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-brand-100 px-1 text-brand-900">{children}</mark>;
}

function PipelineRow({ company, next, status }: { company: string; next: string; status: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center rounded-xl border border-white/10 bg-white/[0.045] px-4 py-2">
      <div>
        <p className="text-sm font-semibold">{company}</p>
        <p className="mt-1 text-xs text-white/70">{next}</p>
      </div>
      <span className="text-xs text-brand-200">{status}</span>
    </div>
  );
}

function ScheduleRow({ company, time }: { company: string; time: string }) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-2.5">
      <p className="text-sm font-semibold text-ink">{company}</p>
      <p className="mt-1 text-xs text-ink-muted">{time}</p>
    </div>
  );
}

