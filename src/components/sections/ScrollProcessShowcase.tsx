import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslation } from "../../i18n";
import { PageContainer } from "../layout/PageContainer";
import { ProcessTabs, processStages } from "./scroll-process/ProcessTabs";
import { MobileStagePreview, StagePreview } from "./scroll-process/StagePreview";

export function ScrollProcessShowcase() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (reduceMotion) return;
    const nextStage = Math.min(3, Math.floor(progress * 4));
    setActiveStage((current) => (current === nextStage ? current : nextStage));
  });

  return (
    <section
      className="relative border-y border-line lg:h-[500vh]"
      id="automation"
      ref={sectionRef}
    >
      <div className="hidden h-[calc(100vh-5rem)] lg:sticky lg:top-20 lg:block">
        <PageContainer className="flex h-full flex-col py-6" size="wide">
          <ProcessTabs activeStage={reduceMotion ? 0 : activeStage} />

          <div className="mt-5 flex items-start justify-between gap-8 border-b border-line pb-5">
            <p className="max-w-4xl text-lg leading-7 text-ink-muted">
              {t("scrollProcess.description")}
            </p>
            <p className="meta-label shrink-0">
              {t("scrollProcess.stageCount", { current: activeStage + 1, total: processStages.length })}
            </p>
          </div>

          <div className="relative mt-5 min-h-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                className="absolute inset-0"
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                key={activeStage}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <StagePreview stage={activeStage} />
              </motion.div>
            </AnimatePresence>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="space-y-16 py-20 lg:hidden">
        <div>
          <p className="eyebrow">{t("scrollProcess.eyebrow")}</p>
          <h2 className="section-title mt-4">{t("scrollProcess.title")}</h2>
          <p className="lead mt-5 max-w-2xl">
            {t("scrollProcess.mobileDescription")}
          </p>
        </div>
        {processStages.map((stage, index) => (
          <MobileStagePreview key={stage} stage={index} />
        ))}
      </PageContainer>
    </section>
  );
}
