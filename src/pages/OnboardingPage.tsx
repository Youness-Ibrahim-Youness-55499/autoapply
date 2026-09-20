import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Seo } from "../components/Seo";
import { SkipLink } from "../components/SkipLink";
import { PageContainer } from "../components/layout/PageContainer";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { OnboardingSteps, type OnboardingStep } from "../components/onboarding/OnboardingSteps";
import { DocumentUpload } from "../features/documents/components/DocumentUpload";
import { useDocuments } from "../features/documents/useDocuments";
import { ProfilePreferencesFields } from "../features/profile/components/ProfilePreferencesFields";
import { ProfileSummaryFields } from "../features/profile/components/ProfileSummaryFields";
import { useProfile } from "../features/profile/useProfile";
import { useTranslation } from "../i18n";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState<OnboardingStep>(2);

  const { documents, isUploading, uploadDocument } = useDocuments();
  const {
    isLoading: isProfileLoading,
    isSaving,
    loadErrorMessage,
    profile,
    retry,
    saveErrorMessage,
    saveProfile,
  } = useProfile();
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  function updateDraft(changes: Partial<typeof draft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  async function handleProfileContinue() {
    const saved = await saveProfile(draft);
    if (saved) setStep(4);
  }

  async function handlePreferencesContinue() {
    // Finishing the wizard is what completes onboarding; profile readiness
    // (salary, work authorization, ...) is tracked separately on the profile page.
    const saved = await saveProfile({ ...draft, onboardingCompleted: true });
    if (saved) setStep(5);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Seo description={t("onboarding.profile.description")} noIndex path="/onboarding" title={t("onboarding.profile.title")} />
      <SkipLink />
      <header className="border-b border-line bg-surface">
        <PageContainer>
          <div className="flex min-h-18 items-center">
            <Logo />
          </div>
        </PageContainer>
      </header>

      <main id="main-content">
        <PageContainer className="py-12 sm:py-16">
          <div className="mx-auto max-w-xl">
            <OnboardingSteps currentStep={step} />
          </div>

          {step === 2 && (
            <div className="mx-auto mt-8 max-w-xl">
              <DocumentUpload isUploading={isUploading} onUpload={uploadDocument} />
              {documents.length > 0 && (
                <p className="mt-4 text-sm font-semibold text-brand-800">
                  {t(documents.length === 1 ? "documents.countOne" : "documents.countOther", {
                    count: documents.length,
                  })}
                </p>
              )}
              <div className="mt-6 flex items-center justify-between">
                <button
                  className="text-sm font-semibold text-ink-muted hover:text-ink"
                  onClick={() => setStep(3)}
                  type="button"
                >
                  {t("onboarding.skipForNow")}
                </button>
                <Button onClick={() => setStep(3)}>{t("onboarding.continue")}</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mx-auto mt-8 max-w-xl">
              {isProfileLoading ? (
                <LoadingState description={t("loading.profileDescription")} title={t("loading.profile")} />
              ) : loadErrorMessage ? (
                <ErrorState
                  action={<Button onClick={retry}>{t("tryAgain")}</Button>}
                  description={loadErrorMessage}
                  title={t("errors.profileLoad")}
                />
              ) : (
                <section className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
                  <p className="eyebrow">{t("onboarding.profile.eyebrow")}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{t("onboarding.profile.title")}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {t("onboarding.profile.description")}
                  </p>

                  <div className="mt-6">
                    <ProfileSummaryFields onChange={updateDraft} value={draft} />
                  </div>

                  {saveErrorMessage && (
                    <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                      {saveErrorMessage}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      className="text-sm font-semibold text-ink-muted hover:text-ink"
                      onClick={() => setStep(2)}
                      type="button"
                    >
                      {t("onboarding.back")}
                    </button>
                    <Button disabled={isSaving} onClick={() => void handleProfileContinue()}>
                      {isSaving ? t("profile.saving") : t("onboarding.continue")}
                    </Button>
                  </div>
                </section>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="mx-auto mt-8 max-w-xl">
              <section className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
                <p className="eyebrow">{t("onboarding.preferences.eyebrow")}</p>
                <h2 className="mt-2 text-2xl font-semibold">{t("onboarding.preferences.title")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {t("onboarding.preferences.description")}
                </p>

                <div className="mt-6">
                  <ProfilePreferencesFields onChange={updateDraft} value={draft} />
                </div>

                {saveErrorMessage && (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                    {saveErrorMessage}
                  </p>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <button
                    className="text-sm font-semibold text-ink-muted hover:text-ink"
                    onClick={() => setStep(3)}
                    type="button"
                  >
                    {t("onboarding.back")}
                  </button>
                  <Button disabled={isSaving} onClick={() => void handlePreferencesContinue()}>
                    {isSaving ? t("profile.saving") : t("onboarding.continue")}
                  </Button>
                </div>
              </section>
            </div>
          )}

          {step === 5 && (
            <div className="mx-auto mt-8 max-w-xl text-center">
              <section className="rounded-card border border-line bg-surface p-8 shadow-card sm:p-10">
                <p className="eyebrow">{t("onboarding.matches.eyebrow")}</p>
                <h2 className="mt-2 text-2xl font-semibold">{t("onboarding.matches.title")}</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                  {t("onboarding.matches.description")}
                </p>
                <Button className="mt-6" onClick={() => navigate("/app", { replace: true })} size="lg">
                  {t("onboarding.matches.cta")}
                </Button>
              </section>
            </div>
          )}
        </PageContainer>
      </main>
    </div>
  );
}
