import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "../../i18n";
import { dashboardReveal, fadeUp, headlineLine, heroStagger } from "../../lib/motion";
import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";
import { HeroDashboard } from "./HeroDashboard";
import { HeroTrustBadges } from "./HeroTrustBadges";

export function Hero() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  return (
    <Section className="overflow-hidden" id="get-started" spacing="hero">
      <PageContainer>
        <motion.div
          animate="visible"
          className="max-w-3xl text-left"
          initial={reduceMotion ? "visible" : "hidden"}
          variants={heroStagger}
        >
          <div className="overflow-hidden">
            <motion.h1 className="hero-heading" variants={headlineLine}>
              {t("hero.heading")}
            </motion.h1>
          </div>

          <motion.p className="lead mt-6 max-w-2xl" variants={fadeUp}>
            {t("hero.description")}
          </motion.p>
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
          <HeroTrustBadges />
        </motion.div>
      </PageContainer>
    </Section>
  );
}
