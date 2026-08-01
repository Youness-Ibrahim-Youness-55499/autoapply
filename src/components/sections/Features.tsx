import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";
import { useTranslation } from "../../i18n";

const features = [
  {
    eyebrowKey: "features.one.eyebrow",
    titleKey: "features.one.title",
    descriptionKey: "features.one.description",
  },
  {
    eyebrowKey: "features.two.eyebrow",
    titleKey: "features.two.title",
    descriptionKey: "features.two.description",
  },
  {
    eyebrowKey: "features.three.eyebrow",
    titleKey: "features.three.title",
    descriptionKey: "features.three.description",
  },
  {
    eyebrowKey: "features.four.eyebrow",
    titleKey: "features.four.title",
    descriptionKey: "features.four.description",
  },
];

export function Features() {
  const { t } = useTranslation();

  return (
    <Section className="bg-surface" id="features" spacing="spacious">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{t("features.eyebrow")}</p>
          <h2 className="section-title mx-auto mt-4">
            {t("features.title")}
          </h2>
          <p className="lead mx-auto mt-6 max-w-2xl">
            {t("features.description")}
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {features.map((feature, index) => (
            <article
              className="group overflow-hidden rounded-card border border-line bg-canvas"
              key={feature.titleKey}
            >
              <div className="p-6 sm:p-8">
                <p className="eyebrow">
                  {String(index + 1).padStart(2, "0")} - {t(feature.eyebrowKey)}
                </p>
                <h3 className="mt-4 max-w-md text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                  {t(feature.titleKey)}
                </h3>
                <p className="body-copy mt-3 max-w-lg">
                  {t(feature.descriptionKey)}
                </p>
              </div>

              <FeaturePreview feature={index} />
            </article>
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}

type FeaturePreviewProps = {
  feature: number;
};

function FeaturePreview({ feature }: FeaturePreviewProps) {
  return (
    <div
      aria-hidden="true"
      className="mx-4 mb-4 min-h-56 overflow-hidden rounded-xl border border-line bg-surface p-4 shadow-card sm:mx-6 sm:mb-6 sm:p-5"
    >
      {feature === 0 && <TrackingPreview />}
      {feature === 1 && <DocumentsPreview />}
      {feature === 2 && <ReminderPreview />}
      {feature === 3 && <InsightsPreview />}
    </div>
  );
}

function TrackingPreview() {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <p className="text-xs font-semibold text-ink">{t("features.preview.applications")}</p>
          <p className="mt-1 text-[0.65rem] text-ink-muted">{t("features.preview.activeRoles")}</p>
        </div>
        <span className="rounded-full bg-brand-900 px-3 py-1.5 text-[0.65rem] font-semibold text-white">
          {t("features.preview.addRole")}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {[
          "features.preview.statusInterview",
          "features.preview.statusApplied",
          "features.preview.statusPreparing",
        ].map((statusKey, index) => (
          <div
            className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-canvas px-3 py-3"
            key={statusKey}
          >
            <div className="flex items-center gap-3">
              <span
                className={`size-7 rounded-md ${
                  index === 0 ? "bg-brand-300" : "bg-surface-muted"
                }`}
              />
              <span className="text-xs font-semibold">{t(statusKey)}</span>
            </div>
            <span className="text-[0.65rem] text-ink-muted">{t("features.preview.statusPlaceholder")}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function DocumentsPreview() {
  const { t } = useTranslation();

  return (
    <div className="grid h-full gap-3 sm:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-lg bg-brand-950 p-4 text-white">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand-300">
          {t("features.preview.roleFolder")}
        </p>
        <p className="mt-3 text-sm font-semibold">{t("features.preview.productDesigner")}</p>
        <div className="mt-5 space-y-2 text-[0.65rem] text-white/60">
          <p>{t("features.preview.resume")}</p>
          <p>{t("features.preview.coverLetter")}</p>
          <p>{t("features.preview.researchNotes")}</p>
        </div>
      </div>
      <div className="space-y-2">
        {[
          "features.preview.productResumePdf",
          "features.preview.roleNotesTxt",
          "features.preview.portfolioLinks",
        ].map((document, index) => (
          <div
            className="flex items-center gap-3 rounded-lg border border-line p-3"
            key={document}
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-brand-100 text-[0.65rem] font-bold text-brand-800">
              {index + 1}
            </span>
            <div>
              <p className="text-xs font-semibold">{t(document)}</p>
              <p className="mt-1 text-[0.65rem] text-ink-muted">
                {t("features.preview.updatedToday")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReminderPreview() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-brand-900 px-2.5 py-1 text-[0.65rem] font-semibold text-white">
            {t("features.preview.today")}
          </span>
          <span className="text-[0.65rem] text-brand-800">{t("features.preview.timeNineThirty")}</span>
        </div>
        <p className="mt-5 text-sm font-semibold">{t("features.preview.sendThankYou")}</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          {t("features.preview.followUpDetails")}
        </p>
        <div className="mt-5 flex gap-2">
          <span className="rounded-full bg-brand-900 px-3 py-1.5 text-[0.65rem] font-semibold text-white">
            {t("features.preview.complete")}
          </span>
          <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-[0.65rem] font-semibold">
            {t("features.preview.reschedule")}
          </span>
        </div>
      </div>
    </div>
  );
}

function InsightsPreview() {
  const { t } = useTranslation();
  const bars = [42, 68, 50, 82, 61, 92];

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-muted">
            {t("features.preview.searchActivity")}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            {t("features.preview.responses")}
          </p>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1.5 text-[0.65rem] font-semibold text-brand-800">
          {t("features.preview.monthChange")}
        </span>
      </div>
      <div className="mt-6 flex h-28 items-end gap-3">
        {bars.map((height, index) => (
          <div
            className="flex-1 rounded-t-md bg-brand-200"
            key={`${height}-${index}`}
            style={{ height: `${height}%` }}
          >
            <div
              className="h-2/5 rounded-t-md bg-brand-700"
              style={{ minHeight: "0.5rem" }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
