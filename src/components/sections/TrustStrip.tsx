import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";
import { useTranslation } from "../../i18n";

const jobSearchContexts = [
  "trustStrip.context.careerChanges",
  "trustStrip.context.firstRoles",
  "trustStrip.context.returningToWork",
  "trustStrip.context.highVolume",
];

export function TrustStrip() {
  const { t } = useTranslation();

  return (
    <Section
      aria-labelledby="trust-strip-title"
      className="border-y border-line"
      spacing="compact"
    >
      <PageContainer>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center">
          <div>
            <p className="eyebrow">{t("trustStrip.eyebrow")}</p>
            <h2 className="section-heading mt-3" id="trust-strip-title">
              {t("trustStrip.title")}
            </h2>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {jobSearchContexts.map((contextKey, index) => (
              <li
                className="flex min-h-24 flex-col justify-between rounded-xl border border-line bg-canvas p-4"
                key={contextKey}
              >
                <span
                  aria-hidden="true"
                  className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800"
                >
                  {index + 1}
                </span>
                <span className="mt-5 body-small font-semibold leading-snug">
                  {t(contextKey)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </Section>
  );
}
