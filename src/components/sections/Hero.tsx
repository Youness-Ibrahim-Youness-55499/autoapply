import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n";
import { dashboardReveal, fadeUp, fadeUpSmall, headlineLine, heroStagger } from "../../lib/motion";
import { PageContainer } from "../layout/PageContainer";
import { ButtonLink } from "../ui/Button";
import { Section } from "../ui/Section";
import { HeroDashboard } from "./HeroDashboard";

export function Hero() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  return (
    <Section className="overflow-hidden" id="get-started" spacing="hero">
      <PageContainer>
        <motion.div
          animate="visible"
          className="mx-auto max-w-4xl text-center"
          initial={reduceMotion ? "visible" : "hidden"}
          variants={heroStagger}
        >
          <motion.p className="eyebrow" variants={fadeUpSmall}>
            {t("hero.eyebrow")}
          </motion.p>

          <div className="mx-auto mt-5 overflow-hidden">
            <motion.h1 className="hero-heading mx-auto" variants={headlineLine}>
              {t("hero.heading")}
            </motion.h1>
          </div>

          <motion.p className="lead mx-auto mt-6 max-w-2xl" variants={fadeUp}>
            {t("hero.description")}
          </motion.p>

          <motion.div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row" variants={fadeUpSmall}>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ink bg-ink px-6 text-base font-semibold text-white shadow-button transition-colors duration-200 hover:border-ink/90 hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
              to="/signup"
            >
              {t("hero.primaryCta")}
            </Link>
            <ButtonLink href="#how-it-works" size="lg" variant="secondary">
              {t("hero.secondaryCta")}
            </ButtonLink>
          </motion.div>

          <motion.ul
            className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-muted"
            variants={fadeUpSmall}
          >
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
          </motion.ul>
        </motion.div>

        <motion.div
          animate="visible"
          className="relative"
          initial={reduceMotion ? "visible" : "hidden"}
          style={{ transformOrigin: "center top" }}
          variants={dashboardReveal}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-[36rem] motion-safe:animate-[hero-glow-breathe_10s_ease-in-out_infinite]"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--color-brand-500) 14%, transparent), transparent 60%)",
            }}
          />
          <HeroDashboard />
        </motion.div>
      </PageContainer>
    </Section>
  );
}
