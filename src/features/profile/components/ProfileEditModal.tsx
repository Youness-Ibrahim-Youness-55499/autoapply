import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useTranslation } from "../../../i18n";
import {
  employmentTypeLabelKeys,
  employmentTypeOptions,
  workPreferenceLabelKeys,
  workPreferences,
  type CandidateProfile,
  type WorkPreference,
} from "../profile.types";
import { getProfileCompletion } from "../profile.utils";
import { EducationEditor, ExperienceEditor } from "./RepeatableEditors";
import { TagEditor } from "./TagEditor";

export type ProfileSection = "education" | "experience" | "preferences" | "skills" | "summary";

const SECTION_TITLE_KEYS: Record<ProfileSection, string> = {
  education: "profile.editModal.educationTitle",
  experience: "profile.editModal.experienceTitle",
  preferences: "profile.editModal.preferencesTitle",
  skills: "profile.editModal.skillsTitle",
  summary: "profile.editModal.summaryTitle",
};

const inputClasses =
  "mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const textareaClasses = `${inputClasses} min-h-32 py-3`;

type ProfileEditModalProps = {
  isSaving: boolean;
  onClose: () => void;
  onSave: (profile: CandidateProfile) => Promise<boolean>;
  profile: CandidateProfile;
  section: ProfileSection | null;
};

// One modal, one shared draft/save flow for every section -- each read
// card (ProfileEducationCard, ProfileSkillsCard, etc.) just calls onEdit
// to set which section is active. Reuses the existing TagEditor/
// ExperienceEditor/EducationEditor unchanged; only their container
// changed from "always visible inline" to "inside a modal."
export function ProfileEditModal({
  isSaving,
  onClose,
  onSave,
  profile,
  section,
}: ProfileEditModalProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    if (section) setDraft(profile);
  }, [profile, section]);

  function update(changes: Partial<CandidateProfile>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function toggleEmploymentType(value: string) {
    update({
      employmentTypes: draft.employmentTypes.includes(value)
        ? draft.employmentTypes.filter((item) => item !== value)
        : [...draft.employmentTypes, value],
    });
  }

  async function handleSave() {
    const completion = getProfileCompletion(draft);
    const success = await onSave({ ...draft, onboardingCompleted: completion.percentage === 100 });
    if (success) onClose();
  }

  return (
    <Modal
      footer={
        <>
          <Button disabled={isSaving} onClick={onClose} variant="secondary">
            {t("profile.cancel")}
          </Button>
          <Button disabled={isSaving} onClick={() => void handleSave()}>
            {isSaving ? t("profile.saving") : t("profile.save")}
          </Button>
        </>
      }
      isOpen={section !== null}
      onClose={onClose}
      title={section ? t(SECTION_TITLE_KEYS[section]) : ""}
    >
      {section === "summary" && (
        <div className="space-y-4">
          <label className="block text-sm font-semibold">
            {t("profile.editModal.fullNameLabel")}
            <input
              autoComplete="name"
              className={inputClasses}
              maxLength={120}
              onChange={(event) => update({ fullName: event.target.value })}
              required
              value={draft.fullName}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              {t("profile.editModal.headlineLabel")}
              <input
                className={inputClasses}
                maxLength={180}
                onChange={(event) => update({ headline: event.target.value })}
                placeholder={t("profile.editModal.headlinePlaceholder")}
                value={draft.headline}
              />
            </label>
            <label className="text-sm font-semibold">
              {t("profile.editModal.locationLabel")}
              <input
                className={inputClasses}
                maxLength={160}
                onChange={(event) => update({ location: event.target.value })}
                placeholder={t("profile.editModal.locationPlaceholder")}
                value={draft.location}
              />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            {t("profile.editModal.summaryLabel")}
            <textarea
              className={textareaClasses}
              maxLength={2000}
              onChange={(event) => update({ professionalSummary: event.target.value })}
              placeholder={t("profile.editModal.summaryPlaceholder")}
              value={draft.professionalSummary}
            />
          </label>
        </div>
      )}

      {section === "education" && (
        <EducationEditor onChange={(education) => update({ education })} value={draft.education} />
      )}

      {section === "experience" && (
        <ExperienceEditor onChange={(experience) => update({ experience })} value={draft.experience} />
      )}

      {section === "skills" && (
        <TagEditor
          label={t("profile.editModal.skillsLabel")}
          maxItems={30}
          onChange={(skills) => update({ skills })}
          placeholder={t("profile.editModal.skillsPlaceholder")}
          value={draft.skills}
        />
      )}

      {section === "preferences" && (
        <div className="space-y-6">
          <TagEditor
            label={t("profile.editModal.desiredRolesLabel")}
            maxItems={10}
            onChange={(desiredRoles) => update({ desiredRoles })}
            placeholder={t("profile.editModal.desiredRolesPlaceholder")}
            value={draft.desiredRoles}
          />

          <div>
            <span className="text-sm font-semibold">{t("profile.preferences.workStyle")}</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-4">
              {workPreferences.map((preference) => (
                <label
                  className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
                    draft.workPreference === preference
                      ? "border-brand-500 bg-brand-50 text-brand-900"
                      : "border-line bg-canvas"
                  }`}
                  key={preference}
                >
                  <input
                    checked={draft.workPreference === preference}
                    className="accent-brand-800"
                    name="work-preference"
                    onChange={() => update({ workPreference: preference as WorkPreference })}
                    type="radio"
                  />
                  {t(workPreferenceLabelKeys[preference])}
                </label>
              ))}
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">{t("profile.preferences.employmentType")}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {employmentTypeOptions.map((type) => (
                <label
                  className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition ${
                    draft.employmentTypes.includes(type)
                      ? "border-brand-500 bg-brand-50 text-brand-900"
                      : "border-line bg-canvas"
                  }`}
                  key={type}
                >
                  <input
                    checked={draft.employmentTypes.includes(type)}
                    className="accent-brand-800"
                    onChange={() => toggleEmploymentType(type)}
                    type="checkbox"
                  />
                  {t(employmentTypeLabelKeys[type])}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center gap-3 text-sm font-semibold">
            <input
              checked={draft.willingToRelocate}
              className="size-4 accent-brand-800"
              onChange={(event) => update({ willingToRelocate: event.target.checked })}
              type="checkbox"
            />
            {t("profile.editModal.willingToRelocate")}
          </label>
        </div>
      )}
    </Modal>
  );
}
