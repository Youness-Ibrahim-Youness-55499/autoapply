import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";
import { useTranslation } from "../../i18n";

const workflowSteps = [
  {
    labelKey: "howItWorks.stepCollect.label",
    titleKey: "howItWorks.stepCollect.title",
    descriptionKey: "howItWorks.stepCollect.description",
  },
  {
    labelKey: "howItWorks.stepPrepare.label",
    titleKey: "howItWorks.stepPrepare.title",
    descriptionKey: "howItWorks.stepPrepare.description",
  },
  {
    labelKey: "howItWorks.stepTrack.label",
    titleKey: "howItWorks.stepTrack.title",
    descriptionKey: "howItWorks.stepTrack.description",
  },
  {
    labelKey: "howItWorks.stepContinue.label",
    titleKey: "howItWorks.stepContinue.title",
    descriptionKey: "howItWorks.stepContinue.description",
  },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <Section id="how-it-works" spacing="spacious">
      <PageContainer>
        <div className="grid gap-8 border-b border-line pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.75fr)] lg:items-end">
          <div>
            <p className="eyebrow">{t("howItWorks.eyebrow")}</p>
            <h2 className="section-heading mt-4">
              {t("howItWorks.title")}
            </h2>
          </div>
          <p className="body-large max-w-xl lg:justify-self-end">
            {t("howItWorks.description")}
          </p>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-2">
          {workflowSteps.map((step, index) => (
            <li
              className="overflow-hidden rounded-card border border-line bg-surface shadow-card transition-[border-color,transform] duration-[var(--duration-fast)] ease-[var(--easing-standard)] hover:-translate-y-0.5 hover:border-brand-200"
              key={step.labelKey}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <p className="meta-label">
                    {String(index + 1).padStart(2, "0")} — {t(step.labelKey)}
                  </p>
                  <span className="meta-label">
                    {t("howItWorks.stepCount", { current: index + 1, total: workflowSteps.length })}
                  </span>
                </div>
                <h3 className="subsection-heading mt-5">
                  {t(step.titleKey)}
                </h3>
                <p className="body-copy mt-3 max-w-lg">{t(step.descriptionKey)}</p>
              </div>

              <WorkflowPreview step={index} />
            </li>
          ))}
        </ol>
      </PageContainer>
    </Section>
  );
}

type WorkflowPreviewProps = {
  step: number;
};

function WorkflowPreview({ step }: WorkflowPreviewProps) {
  const { t } = useTranslation();

  return (
    <div
      aria-hidden="true"
      className="min-h-52 border-t border-line bg-brand-950 p-5 text-white sm:p-6"
    >
      {step === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-brand-300">
            {t("howItWorks.preview.newOpportunity")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <PreviewField label={t("howItWorks.preview.company")} value={t("howItWorks.preview.companyValue")} />
            <PreviewField label={t("howItWorks.preview.role")} value={t("howItWorks.preview.productDesigner")} />
            <PreviewField label={t("howItWorks.preview.source")} value={t("howItWorks.preview.sourceValue")} />
            <PreviewField label={t("howItWorks.preview.deadline")} value={t("howItWorks.preview.deadlineValueFriday")} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <PreviewDocument name={t("howItWorks.preview.productResume")} status={t("howItWorks.preview.statusReady")} />
          <PreviewDocument name={t("howItWorks.preview.portfolioNotes")} status={t("howItWorks.preview.statusReview")} />
          <PreviewDocument name={t("howItWorks.preview.coverLetter")} status={t("howItWorks.preview.statusDraft")} />
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            "howItWorks.preview.statusSaved",
            "howItWorks.preview.statusApplied",
            "howItWorks.preview.statusInterview",
          ].map((statusKey, statusIndex) => (
            <div
              className="rounded-lg border border-white/10 bg-white/5 p-3"
              key={statusKey}
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/50">
                {t(statusKey)}
              </p>
              <div
                className={`mt-4 rounded-md p-3 text-xs font-semibold ${
                  statusIndex === 2
                    ? "bg-brand-300 text-brand-950"
                    : "bg-white/10"
                }`}
              >
                {t("howItWorks.preview.designRole")}
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <PreviewTask date={t("howItWorks.preview.today")} label={t("howItWorks.preview.taskSendThankYou")} />
          <PreviewTask date={t("howItWorks.preview.thu")} label={t("howItWorks.preview.taskCheckRecruiter")} />
          <PreviewTask date={t("howItWorks.preview.mon")} label={t("howItWorks.preview.taskPreparePortfolio")} />
        </div>
      )}
    </div>
  );
}

type PreviewFieldProps = {
  label: string;
  value: string;
};

function PreviewField({ label, value }: PreviewFieldProps) {
  return (
    <div className="rounded-lg bg-white/8 p-3">
      <p className="text-[0.65rem] text-white/45">{label}</p>
      <p className="mt-1 text-xs font-semibold">{value}</p>
    </div>
  );
}

type PreviewDocumentProps = {
  name: string;
  status: string;
};

function PreviewDocument({ name, status }: PreviewDocumentProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-md bg-brand-300 text-xs font-bold text-brand-950">
          A
        </span>
        <span className="text-xs font-semibold">{name}</span>
      </div>
      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.65rem] text-white/70">
        {status}
      </span>
    </div>
  );
}

type PreviewTaskProps = {
  date: string;
  label: string;
};

function PreviewTask({ date, label }: PreviewTaskProps) {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <span className="w-10 text-[0.65rem] font-semibold uppercase tracking-wider text-brand-300">
        {date}
      </span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
