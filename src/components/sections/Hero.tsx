import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n";
import { PageContainer } from "../layout/PageContainer";
import { ButtonLink } from "../ui/Button";
import { Section } from "../ui/Section";
import { HeroDashboard } from "./HeroDashboard";

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
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ink bg-ink px-6 text-base font-semibold text-white shadow-button transition-colors duration-200 hover:border-ink/90 hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
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

        <HeroDashboard />
      </PageContainer>
    </Section>
  );
}

