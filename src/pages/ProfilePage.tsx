import { useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { Button } from "../components/ui/Button";
import { ProfileEditModal, type ProfileSection } from "../features/profile/components/ProfileEditModal";
import { ProfileEducationCard } from "../features/profile/components/ProfileEducationCard";
import { ProfileExperienceCard } from "../features/profile/components/ProfileExperienceCard";
import { ApplicationExclusionsCard, ApplicationPreferencesCard, MatchingMarketCard, ProfileFutureInsights, ProfileInterpretationCard, ProfileLanguagesCard, WorkEligibilityCard } from "../features/profile/components/ProfileIntelligenceCards";
import { ProfilePreferencesCard } from "../features/profile/components/ProfilePreferencesCard";
import { ProfileProgress } from "../features/profile/components/ProfileProgress";
import { ProfileSkillsCard } from "../features/profile/components/ProfileSkillsCard";
import { ProfileSummaryCard } from "../features/profile/components/ProfileSummaryCard";
import { useProfile } from "../features/profile/useProfile";
import { useCvStatus } from "../features/profile/useCvStatus";
import { useTranslation } from "../i18n";

export function ProfilePage() {
  const {
    isLoading,
    isSaving,
    hasExtendedSchema,
    loadErrorMessage,
    profile,
    retry,
    saveErrorMessage,
    saveProfile,
    successMessage,
  } = useProfile();
  const { t } = useTranslation();
  const cvStatus = useCvStatus();
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
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">{t("profile.header.eyebrow")}</p><h1 className="page-heading mt-4">{t("profile.title")}</h1><p className="lead mt-5 max-w-3xl">{t("profile.description")}</p></div>
          <Button className="shrink-0" onClick={() => setActiveSection("summary")}>{t("profile.header.edit")}</Button>
        </header>

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
          <div className="mt-8 w-full">
            {!hasExtendedSchema && (
              <div className="mb-6 rounded-card border border-amber-200 bg-amber-50 p-5 text-amber-950">
                <p className="font-semibold">{t("profile.schemaPreview.title")}</p>
                <p className="mt-1 text-sm text-amber-900/75">
                  {t("profile.schemaPreview.description")}
                </p>
              </div>
            )}
            {!cvStatus.isLoading && !cvStatus.hasCv && (
              <div className="mb-6 flex flex-col gap-3 rounded-card border border-amber-200 bg-amber-50 p-5 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-semibold">{t("profile.cv.emptyTitle")}</p><p className="mt-1 text-sm text-amber-900/75">{t("profile.cv.emptyDescription")}</p></div>
                <Link className="shrink-0 text-sm font-semibold underline underline-offset-4" to="/app/documents">
                  {t("profile.cv.upload")}
                </Link>
              </div>
            )}
            <ProfileProgress onComplete={() => setActiveSection("preferences")} profile={profile} />

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

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.45fr_1fr]">
              <div className="flex flex-col gap-6">
                <ProfileInterpretationCard onEdit={() => setActiveSection("summary")} profile={profile} />
                <ProfileSummaryCard
                  onEdit={() => setActiveSection("summary")}
                  profile={profile}
                />
                <ProfileExperienceCard
                  experience={profile.experience}
                  onEdit={() => setActiveSection("experience")}
                />
                <ProfileSkillsCard onEdit={() => setActiveSection("skills")} skills={profile.skills} />
                <ProfileEducationCard education={profile.education} onEdit={() => setActiveSection("education")} />
                <ProfileFutureInsights />
              </div>

              <div className="flex flex-col gap-6">
                <MatchingMarketCard />
                <ProfilePreferencesCard
                  onEdit={() => setActiveSection("preferences")}
                  profile={profile}
                />
                <ProfileLanguagesCard onEdit={() => setActiveSection("languages")} profile={profile} />
                <WorkEligibilityCard onEdit={() => setActiveSection("eligibility")} profile={profile} />
                <ApplicationPreferencesCard onEdit={() => setActiveSection("application")} profile={profile} />
                <ApplicationExclusionsCard onEdit={() => setActiveSection("exclusions")} profile={profile} />
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
