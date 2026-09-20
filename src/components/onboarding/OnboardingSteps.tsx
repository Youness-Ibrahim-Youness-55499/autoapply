import { useTranslation } from "../../i18n";

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

const stepLabelKeys: Record<OnboardingStep, string> = {
  1: "onboarding.steps.account",
  2: "onboarding.steps.cv",
  3: "onboarding.steps.profile",
  4: "onboarding.steps.preferences",
  5: "onboarding.steps.matches",
};

export function OnboardingSteps({ currentStep }: { currentStep: OnboardingStep }) {
  const { t } = useTranslation();

  return (
    <ol className="grid grid-cols-5 gap-2 sm:gap-4">
      {([1, 2, 3, 4, 5] as const).map((step) => {
        const isActive = step === currentStep;
        const isComplete = step < currentStep;

        return (
          <li className="text-center" key={step}>
            <span
              className={`mx-auto grid size-9 place-items-center rounded-full text-sm font-bold ${
                isActive
                  ? "bg-brand-700 text-white"
                  : isComplete
                    ? "bg-brand-100 text-brand-800"
                    : "border border-line bg-canvas text-ink-muted"
              }`}
            >
              {step}
            </span>
            <p className={`mt-2 hidden text-xs font-semibold sm:block ${isActive ? "text-ink" : "text-ink-muted"}`}>
              {t(stepLabelKeys[step])}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
