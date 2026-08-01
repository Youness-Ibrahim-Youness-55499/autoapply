import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n";
import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";

const plans = [
  {
    descriptionKey: "pricing.planStarter.description",
    featuresKeys: [
      "pricing.planStarter.featureOne",
      "pricing.planStarter.featureTwo",
      "pricing.planStarter.featureThree",
    ],
    nameKey: "pricing.planStarter.name",
    price: "$0",
  },
  {
    descriptionKey: "pricing.planFocused.description",
    featured: true,
    featuresKeys: [
      "pricing.planFocused.featureOne",
      "pricing.planFocused.featureTwo",
      "pricing.planFocused.featureThree",
    ],
    nameKey: "pricing.planFocused.name",
    price: "$12",
  },
  {
    descriptionKey: "pricing.planMomentum.description",
    featuresKeys: [
      "pricing.planMomentum.featureOne",
      "pricing.planMomentum.featureTwo",
      "pricing.planMomentum.featureThree",
    ],
    nameKey: "pricing.planMomentum.name",
    price: "$24",
  },
];

export function Pricing() {
  const { t } = useTranslation();

  return (
    <Section id="pricing" spacing="spacious">
      <PageContainer>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow">{t("pricing.eyebrow")}</p>
            <h2 className="section-title mt-4">
              {t("pricing.title")}
            </h2>
          </div>
          <p className="lead max-w-xl lg:justify-self-end">
            {t("pricing.description")}
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              className={`flex flex-col rounded-card border p-6 sm:p-8 ${
                plan.featured
                  ? "border-brand-900 bg-brand-950 text-white shadow-card"
                  : "border-line bg-surface"
              }`}
              key={plan.nameKey}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t(plan.nameKey)}</h3>
                {plan.featured && (
                  <span className="rounded-full bg-brand-300 px-3 py-1 text-xs font-semibold text-brand-950">
                    {t("pricing.mostPopular")}
                  </span>
                )}
              </div>
              <p
                className={`mt-4 text-sm leading-relaxed ${
                  plan.featured ? "text-white/65" : "text-ink-muted"
                }`}
              >
                {t(plan.descriptionKey)}
              </p>
              <p className="mt-8 text-5xl font-semibold tracking-[-0.06em]">
                {plan.price}
                <span
                  className={`ml-2 text-sm font-medium tracking-normal ${
                    plan.featured ? "text-white/75" : "text-ink-muted"
                  }`}
                >
                  {t("pricing.perMonth")}
                </span>
              </p>
              <ul
                className={`mt-8 flex-1 space-y-3 border-t pt-6 text-sm ${
                  plan.featured
                    ? "border-white/15 text-white/75"
                    : "border-line text-ink-muted"
                }`}
              >
                {plan.featuresKeys.map((featureKey) => (
                  <li className="flex items-center gap-3" key={featureKey}>
                    <span
                      className={`size-1.5 rounded-full ${
                        plan.featured ? "bg-brand-300" : "bg-brand-600"
                      }`}
                    />
                    {t(featureKey)}
                  </li>
                ))}
              </ul>
              <Link
                className={`mt-8 inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 ${
                  plan.featured
                    ? "border-white bg-white text-brand-950 hover:bg-brand-50"
                    : "border-brand-900 bg-brand-900 text-white hover:bg-brand-800"
                }`}
                to="/signup"
              >
                {t("pricing.choosePlan", { plan: t(plan.nameKey) })}
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">
          {t("pricing.notice")}
        </p>
      </PageContainer>
    </Section>
  );
}

