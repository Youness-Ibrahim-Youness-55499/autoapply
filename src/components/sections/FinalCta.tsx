import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n";
import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";

export function FinalCta() {
  const { t } = useTranslation();

  return (
    <Section id="final-cta" spacing="spacious">
      <PageContainer>
        <div className="relative overflow-hidden rounded-card bg-brand-950 px-6 py-16 text-white shadow-card sm:px-12 sm:py-20 lg:px-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px]"
          />
          <div className="relative max-w-3xl">
            <p className="eyebrow text-white/65">
              {t("finalCta.banner")}
            </p>
            <h2 className="hero-heading mt-5 text-white">
              {t("finalCta.title")}
            </h2>
            <p className="lead mt-6 max-w-xl text-white/65">
              {t("finalCta.description")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-brand-950 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
                to="/signup"
              >
                {t("finalCta.primaryCta")}
              </Link>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 text-base font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
                href="#how-it-works"
              >
                {t("finalCta.secondaryCta")}
              </a>
            </div>
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}

