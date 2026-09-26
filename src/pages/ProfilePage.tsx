import { useState } from "react";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { Button, ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DocumentIcon } from "../components/icons/BrandIcons";
import { DocumentList } from "../features/documents/components/DocumentList";
import { DocumentUpload } from "../features/documents/components/DocumentUpload";
import { useDocuments } from "../features/documents/useDocuments";
import { ProfileEditModal, type ProfileSection } from "../features/profile/components/ProfileEditModal";
import { ProfileEducationCard } from "../features/profile/components/ProfileEducationCard";
import { ProfileExperienceCard } from "../features/profile/components/ProfileExperienceCard";
import { ApplicationExclusionsCard, ApplicationPreferencesCard, MatchingMarketCard, ProfileFutureInsights, ProfileInterpretationCard, ProfileLanguagesCard, WorkEligibilityCard } from "../features/profile/components/ProfileIntelligenceCards";
import { ProfilePreferencesCard } from "../features/profile/components/ProfilePreferencesCard";
import { ProfileProgress } from "../features/profile/components/ProfileProgress";
import { ProfileSkillsCard } from "../features/profile/components/ProfileSkillsCard";
import { ProfileSummaryCard } from "../features/profile/components/ProfileSummaryCard";
import { useProfile } from "../features/profile/useProfile";
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
  const {
    actionErrorMessage: documentsActionErrorMessage,
    busyDocumentId,
    deleteDocument,
    documents,
    isLoading: isLoadingDocuments,
    isUploading,
    loadErrorMessage: documentsLoadErrorMessage,
    openDocument,
    retry: retryDocuments,
    successMessage: documentsSuccessMessage,
    updateDocument,
    uploadDocument,
  } = useDocuments();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<ProfileSection | null>(null);
  // Derived from the same fetch the Documents section below already makes --
  // no separate "does a CV exist" query needed.
  const hasCv = documents.some((document) => document.category === "cv");

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
          <div className="flex shrink-0 gap-3">
            <ButtonLink href="#documents" variant="secondary">
              <DocumentIcon className="size-4" />
              {t("profile.header.uploadDocuments")}
            </ButtonLink>
            <Button onClick={() => setActiveSection("summary")}>{t("profile.header.edit")}</Button>
          </div>
        </header>

        {/* Independent of the profile fetch below -- a failed profile load
            shouldn't also block access to documents, and this is what the
            header's "Upload documents" button anchors to. */}
        <Card className="mt-8" id="documents">
          <h2 className="text-lg font-semibold">{t("documents.title")}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t("documents.description")}</p>

          {isLoadingDocuments && (
            <div className="mt-6">
              <LoadingState
                description={t("loading.documentsDescription")}
                title={t("loading.documents")}
              />
            </div>
          )}

          {!isLoadingDocuments && documentsLoadErrorMessage && (
            <div className="mt-6">
              <ErrorState
                action={<Button onClick={retryDocuments}>{t("tryAgain")}</Button>}
                description={documentsLoadErrorMessage}
                title={t("errors.documentsLoad")}
              />
            </div>
          )}

          {!isLoadingDocuments && !documentsLoadErrorMessage && (
            <>
              <div className="mt-6">
                <DocumentUpload isUploading={isUploading} onUpload={uploadDocument} />
              </div>

              <div aria-live="polite">
                {documentsSuccessMessage && (
                  <p className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-900">
                    {documentsSuccessMessage}
                  </p>
                )}
                {documentsActionErrorMessage && (
                  <p
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    role="alert"
                  >
                    {documentsActionErrorMessage}
                  </p>
                )}
              </div>

              {documents.length > 0 ? (
                <DocumentList
                  busyDocumentId={busyDocumentId}
                  documents={documents}
                  onDelete={deleteDocument}
                  onEdit={updateDocument}
                  onOpen={openDocument}
                />
              ) : (
                <div className="mt-6">
                  <EmptyState
                    description={t("documents.noDocumentsDescription")}
                    title={t("documents.noDocumentsTitle")}
                  />
                </div>
              )}
            </>
          )}
        </Card>

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
            {!isLoadingDocuments && !hasCv && (
              <div className="mb-6 flex flex-col gap-3 rounded-card border border-amber-200 bg-amber-50 p-5 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-semibold">{t("profile.cv.emptyTitle")}</p><p className="mt-1 text-sm text-amber-900/75">{t("profile.cv.emptyDescription")}</p></div>
                <a className="shrink-0 text-sm font-semibold underline underline-offset-4" href="#documents">
                  {t("profile.cv.upload")}
                </a>
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
