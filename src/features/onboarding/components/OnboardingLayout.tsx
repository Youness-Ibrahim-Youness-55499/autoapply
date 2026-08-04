import type { ReactNode } from "react";
import { PageContainer } from "../../../components/layout/PageContainer";
import { useTranslation } from "../../../i18n";
import { onboardingSteps } from "../onboarding.types";

type OnboardingLayoutProps = {
  children: ReactNode;
  currentStepIndex: number;
  onBack?: () => void;
};

// Full-screen flow like AuthPage, not the sidebar-chrome AppShell --
// onboarding runs before the dashboard means anything, so it shouldn't
// look like part of it yet.
export function OnboardingLayout({ children, currentStepIndex, onBack }: OnboardingLayoutProps) {
  const { t } = useTranslation();
  const totalSteps = onboardingSteps.length;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <PageContainer>
          <div className="flex min-h-16 items-center justify-between">
            <span className="text-lg font-bold tracking-[-0.03em] text-brand-900">autoapply</span>
            <p className="text-sm font-semibold text-ink-muted">
              {t("onboarding.stepCounter", { current: currentStepIndex + 1, total: totalSteps })}
            </p>
          </div>
          <div className="flex gap-1.5 pb-4">
            {onboardingSteps.map((step, index) => (
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  index <= currentStepIndex ? "bg-brand-700" : "bg-line"
                }`}
                key={step}
              />
            ))}
          </div>
        </PageContainer>
      </header>

      <main id="main-content">
        <PageContainer className="flex min-h-[calc(100vh-6.5rem)] items-center justify-center py-12">
          <section className="w-full max-w-xl rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
            {onBack && (
              <button
                className="mb-4 text-sm font-semibold text-ink-muted transition hover:text-ink"
                onClick={onBack}
                type="button"
              >
                ← {t("onboarding.back")}
              </button>
            )}
            {children}
          </section>
        </PageContainer>
      </main>
    </div>
  );
}
