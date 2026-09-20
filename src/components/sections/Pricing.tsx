import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n";
import { ArrowRightIcon, CheckCircleIcon } from "../icons/BrandIcons";
import { billingPeriods, planCatalog, priceFor, type Billing, type PlanId } from "../../features/pricing/plans";
import { PageContainer } from "../layout/PageContainer";
import { buttonClasses } from "../ui/Button";

function PersonIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function BarsIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path d="M7 19v-6M12 19V6M17 19v-9" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 8l4.2 4L12 5l3.8 7L20 8l-1.6 10H5.6L4 8Zm1.6 12h12.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

type Plan = {
  cta: string;
  featured?: boolean;
  featureKeys: string[];
  icon: ReactNode;
  iconTile: string;
  id: PlanId;
};

const plans: Plan[] = [
  {
    cta: "pricing.free.cta",
    featureKeys: ["pricing.free.feature1", "pricing.free.feature2", "pricing.free.feature3"],
    icon: <PersonIcon />,
    iconTile: "bg-brand-50 text-brand-700",
    id: "free",
  },
  {
    cta: "pricing.pro.cta",
    featured: true,
    featureKeys: ["pricing.pro.feature1", "pricing.pro.feature2", "pricing.pro.feature3"],
    icon: <BarsIcon />,
    iconTile: "bg-[linear-gradient(180deg,#07825f,var(--color-brand-800))] text-white shadow-button",
    id: "pro",
  },
  {
    cta: "pricing.promax.cta",
    featureKeys: ["pricing.promax.feature1", "pricing.promax.feature2", "pricing.promax.feature3"],
    icon: <CrownIcon />,
    iconTile: "bg-amber-50 text-accent-gold",
    id: "promax",
  },
];

const catalog = Object.fromEntries(planCatalog.map((entry) => [entry.id, entry])) as Record<PlanId, (typeof planCatalog)[number]>;

const stripItems = ["cancel", "trial", "control"] as const;

// Landing-page pricing. Sized so the heading, cards and notes fit on one screen
// when the visitor jumps to #pricing.
export function Pricing() {
  const { locale, t } = useTranslation();
  const [billing, setBilling] = useState<Billing>("monthly");
  const period = billingPeriods.find((item) => item.id === billing) ?? billingPeriods[0];

  function money(amount: number) {
    return `€${amount.toLocaleString(locale, {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    })}`;
  }

  return (
    <section className="scroll-mt-[4.5rem] py-6" id="pricing">
      <PageContainer>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="eyebrow text-brand-800">{t("pricing.eyebrow")}</p>
            <h2 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {t("pricing.title")}
            </h2>
          </div>

          <div
            aria-label={t("pricing.toggle.aria")}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-surface/80 p-1 shadow-card"
            role="group"
          >
            {billingPeriods.map((option) => (
              <button
                aria-pressed={billing === option.id}
                className={`inline-flex min-h-9 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 ${
                  billing === option.id
                    ? "bg-[linear-gradient(180deg,#07825f,var(--color-brand-800))] text-white shadow-button"
                    : "text-ink hover:text-brand-800"
                }`}
                key={option.id}
                onClick={() => setBilling(option.id)}
                type="button"
              >
                {t(`pricing.toggle.${option.id}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid items-stretch gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const { applicationsPerMonth, monthly } = catalog[plan.id];
            const { perMonth, total } = priceFor(monthly, period);

            return (
              <article
                className={`relative flex flex-col overflow-hidden rounded-card bg-surface shadow-card ${
                  plan.featured ? "border-2 border-brand-700" : "border border-line"
                }`}
                key={plan.id}
              >
                {plan.featured && (
                  <div className="flex items-center justify-between bg-[linear-gradient(180deg,#07825f,var(--color-brand-800))] px-5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white">
                    <span>{t("pricing.mostPopular")}</span>
                    <span className="text-white/70">{t("pricing.smartChoice")}</span>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${plan.iconTile}`}>
                      {plan.icon}
                    </span>
                    <div>
                      <h3 className="text-xl font-extrabold leading-tight">{t(`pricing.${plan.id}.name`)}</h3>
                      <p className="text-xs text-ink-muted">{t(`pricing.${plan.id}.tagline`)}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-4xl font-extrabold tracking-tight">
                    {money(perMonth)}
                    <span className="ml-1.5 text-sm font-medium tracking-normal text-ink-muted">
                      {t("pricing.perMonth")}
                    </span>
                  </p>
                  <p className="mt-1 flex h-6 items-center gap-2 text-xs text-ink-muted">
                    {monthly === 0 ? (
                      t("pricing.free.noCard")
                    ) : (
                      <>
                        {t(`pricing.billing.${period.id}`, { amount: money(total) })}
                        {period.discount > 0 && (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[0.6875rem] font-bold text-brand-800">
                            {t("pricing.save", { percent: period.discount * 100 })}
                          </span>
                        )}
                      </>
                    )}
                  </p>

                  <div className="mt-3 border-t border-line pt-3">
                    <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
                      {t("pricing.youGet")}
                    </p>
                    <p className="mt-0.5 text-3xl font-extrabold tracking-tight">
                      {applicationsPerMonth.toLocaleString(locale)}
                      <span className="ml-1.5 text-sm font-medium tracking-normal text-ink-muted">
                        {t("pricing.applicationsPerMonth")}
                      </span>
                    </p>
                  </div>

                  <ul className="mt-3 flex-1 space-y-1.5 text-[0.8125rem]">
                    {plan.featureKeys.map((featureKey, index) => (
                      <li className="flex items-start gap-2.5" key={featureKey}>
                        <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-brand-600" />
                        <span className={index === 0 && plan.id !== "free" ? "font-semibold text-ink" : "text-ink-muted"}>
                          {t(featureKey)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    className={buttonClasses(plan.featured ? "primary" : "secondary", "md", "mt-4 w-full")}
                    to="/signup"
                  >
                    {t(plan.cta)}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <ul className="mt-4 grid rounded-card border border-line bg-surface shadow-card md:grid-cols-3 md:divide-x md:divide-line">
          {stripItems.map((item) => (
            <li className="px-5 py-3.5" key={item}>
              <p className="text-sm font-bold">{t(`pricing.strip.${item}.title`)}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{t(`pricing.strip.${item}.body`)}</p>
            </li>
          ))}
        </ul>

        <p className="mt-2 text-center text-[0.6875rem] text-ink-muted">{t("pricing.notice")}</p>
      </PageContainer>
    </section>
  );
}
