import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Seo } from "../components/Seo";
import { OnboardingLayout } from "../features/onboarding/components/OnboardingLayout";
import { StepAboutYou } from "../features/onboarding/components/StepAboutYou";
import { StepApplicationMode } from "../features/onboarding/components/StepApplicationMode";
import { StepJobPreview } from "../features/onboarding/components/StepJobPreview";
import { StepPreferences } from "../features/onboarding/components/StepPreferences";
import { StepUploadCv } from "../features/onboarding/components/StepUploadCv";
import { onboardingSteps } from "../features/onboarding/onboarding.types";
import { useProfileContext } from "../features/profile/ProfileProvider";
import type { CandidateProfile } from "../features/profile/profile.types";
import { useTranslation } from "../i18n";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isSaving, profile, saveProfile } = useProfileContext();
  const [stepIndex, setStepIndex] = useState(0);
  const step = onboardingSteps[stepIndex];

  function goBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    setStepIndex((current) => Math.min(onboardingSteps.length - 1, current + 1));
  }

  async function saveAndContinue(patch: Partial<CandidateProfile>) {
    const saved = await saveProfile({ ...profile, ...patch });
    if (saved) goNext();
    return saved;
  }

  async function finish() {
    const saved = await saveProfile({ ...profile, onboardingCompleted: true });
    if (saved) navigate("/app", { replace: true });
  }

  return (
    <>
      <Seo
        description={t("seo.onboarding.description")}
        noIndex
        path="/onboarding"
        title={t("onboarding.title")}
      />
      <OnboardingLayout currentStepIndex={stepIndex} onBack={stepIndex > 0 ? goBack : undefined}>
        {step === "upload" && <StepUploadCv onContinue={goNext} onSkip={goNext} />}
        {step === "about" && (
          <StepAboutYou
            isSaving={isSaving}
            onContinue={saveAndContinue}
            onSkip={goNext}
            profile={profile}
          />
        )}
        {step === "preferences" && (
          <StepPreferences
            isSaving={isSaving}
            onContinue={saveAndContinue}
            onSkip={goNext}
            profile={profile}
          />
        )}
        {step === "mode" && (
          <StepApplicationMode isSaving={isSaving} onContinue={saveAndContinue} profile={profile} />
        )}
        {step === "preview" && (
          <StepJobPreview isSaving={isSaving} onFinish={() => void finish()} />
        )}
      </OnboardingLayout>
    </>
  );
}
