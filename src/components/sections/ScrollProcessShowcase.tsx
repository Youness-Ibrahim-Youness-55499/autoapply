import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
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
      className="relative border-y border-line bg-surface-soft lg:h-[500vh]"
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
            <p className="shrink-0 text-xs font-semibold text-brand-700">
              {t("scrollProcess.stageCount", { current: activeStage + 1, total: processStages.length })}
            </p>
          </div>

          <div className="relative mt-5 min-h-0 flex-1">
            {processStages.map((stage, index) => (
              <div
                aria-hidden={index !== activeStage}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  index === activeStage ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
                }`}
                key={stage}
              >
                <StagePreview stage={index} />
              </div>
            ))}
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

