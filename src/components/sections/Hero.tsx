import { Link } from "react-router-dom";
import dashboardHero from "../../assets/autoapply-dashboard-hero-midnight.png";
import { useTranslation } from "../../i18n";
import { PageContainer } from "../layout/PageContainer";
import { ButtonLink } from "../ui/Button";
import { Section } from "../ui/Section";

export function Hero() {
  const { t } = useTranslation();

  return (
    <Section className="overflow-hidden" id="get-started" spacing="hero">
      <PageContainer>
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">{t("hero.eyebrow")}</p>
          <h1 className="hero-heading mx-auto mt-5">
            {t("hero.heading")}
          </h1>
          <p className="lead mx-auto mt-6 max-w-2xl">
            {t("hero.description")}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brand-900 bg-brand-900 px-6 text-base font-semibold text-white shadow-button transition-colors duration-200 hover:border-brand-800 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
              to="/signup"
            >
              {t("hero.primaryCta")}
            </Link>
            <ButtonLink href="#how-it-works" size="lg" variant="secondary">
              {t("hero.secondaryCta")}
            </ButtonLink>
          </div>

          <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-muted">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-brand-500" />
              {t("hero.featureOne")}
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-brand-500" />
              {t("hero.featureTwo")}
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-brand-500" />
              {t("hero.featureThree")}
            </li>
          </ul>
        </div>

        <div className="relative mx-auto mt-14 max-w-6xl">
          <div
            aria-hidden="true"
            className="absolute -left-10 -top-10 h-44 w-44 rounded-full bg-brand-200/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -right-14 top-0 h-72 w-72 rounded-full bg-brand-300/15 blur-3xl"
          />
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface shadow-card">
            <img
              alt="Autoapply dashboard showing active roles, interviews, follow-ups, and an organized application list"
              className="relative w-full"
              decoding="async"
              loading="eager"
              src={dashboardHero}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/70 px-5 py-4 backdrop-blur-sm">
              <span className="rounded-full bg-brand-100 px-3 py-1 text-[0.75rem] font-semibold text-brand-800">
                {t("hero.metricOne")}
              </span>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-[0.75rem] font-semibold text-brand-800">
                {t("hero.metricTwo")}
              </span>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-[0.75rem] font-semibold text-brand-800">
                {t("hero.metricThree")}
              </span>
            </div>
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}

