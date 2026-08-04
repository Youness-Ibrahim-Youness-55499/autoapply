import { useState } from "react";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { Button } from "../components/ui/Button";
import { ProfileEditModal, type ProfileSection } from "../features/profile/components/ProfileEditModal";
import { ProfileEducationCard } from "../features/profile/components/ProfileEducationCard";
import { ProfileExperienceCard } from "../features/profile/components/ProfileExperienceCard";
import { ProfilePreferencesCard } from "../features/profile/components/ProfilePreferencesCard";
import { ProfileProgress } from "../features/profile/components/ProfileProgress";
import { ProfileSkillsCard } from "../features/profile/components/ProfileSkillsCard";
import { ProfileSummaryCard } from "../features/profile/components/ProfileSummaryCard";
import { useProfileContext } from "../features/profile/ProfileProvider";
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
  } = useProfileContext();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<ProfileSection | null>(null);

  return (
    <>
      <Seo
        description={t("seo.profile.description")}
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
          <div className="mt-8 max-w-6xl">
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

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div className="flex flex-col gap-6">
                <ProfileSummaryCard
                  onEdit={() => setActiveSection("summary")}
                  profile={profile}
                />
                <ProfileEducationCard
                  education={profile.education}
                  onEdit={() => setActiveSection("education")}
                />
                <ProfileExperienceCard
                  experience={profile.experience}
                  onEdit={() => setActiveSection("experience")}
                />
              </div>

              <div className="flex flex-col gap-6">
                <ProfilePreferencesCard
                  onEdit={() => setActiveSection("preferences")}
                  profile={profile}
                />
                <ProfileSkillsCard
                  onEdit={() => setActiveSection("skills")}
                  skills={profile.skills}
                />
              </div>
            </div>
          </div>
        )}
      </PageContainer>

      <ProfileEditModal
        isSaving={isSaving}
        onClose={() => setActiveSection(null)}
        onSave={saveProfile}
        profile={profile}
        section={activeSection}
      />
    </>
  );
}
