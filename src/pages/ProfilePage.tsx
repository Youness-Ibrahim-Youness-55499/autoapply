import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { Button } from "../components/ui/Button";
import { ProfileForm } from "../features/profile/components/ProfileForm";
import { ProfileProgress } from "../features/profile/components/ProfileProgress";
import { useProfile } from "../features/profile/useProfile";
import { useTranslation } from "../i18n";

export function ProfilePage() {
  const {
    isLoading,
    isSaving,
    loadErrorMessage,
    profile,
    retry,
    saveErrorMessage,
    saveProfile,
    successMessage,
  } = useProfile();
  const { t } = useTranslation();

  return (
    <>
      <Seo
        description={t("seo.profileDescription")}
        noIndex
        path="/app/profile"
        title={t("profile.title")}
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <ProductPageHeader
          description={t("profile.description")}
          title={t("profile.title")}
        />

        {isLoading && (
          <div className="mt-10 max-w-4xl">
            <LoadingState
              description={t("loading.profileDescription")}
              title={t("loading.profile")}
            />
          </div>
        )}

        {!isLoading && loadErrorMessage && (
          <div className="mt-10 max-w-4xl">
            <ErrorState
              action={<Button onClick={retry}>{t("tryAgain")}</Button>}
              description={loadErrorMessage}
              title={t("errors.profileLoad")}
            />
          </div>
        )}

        {!isLoading && !loadErrorMessage && (
          <div className="mt-10 grid max-w-6xl items-start gap-7 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-28">
              <ProfileProgress profile={profile} />
              <div aria-live="polite">
                {successMessage && (
                  <p className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-900">
                    {successMessage}
                  </p>
                )}
                {saveErrorMessage && (
                  <p
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    role="alert"
                  >
                    {saveErrorMessage}
                  </p>
                )}
              </div>
            </div>

            <ProfileForm
              isSaving={isSaving}
              onSave={saveProfile}
              profile={profile}
            />
          </div>
        )}
      </PageContainer>
    </>
  );
}
