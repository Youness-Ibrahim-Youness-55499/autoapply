import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import {
  employmentTypeOptions,
  workPreferences,
  type CandidateProfile,
  type WorkPreference,
} from "../profile.types";
import { getProfileCompletion } from "../profile.utils";
import { EducationEditor, ExperienceEditor } from "./RepeatableEditors";
import { TagEditor } from "./TagEditor";

export type ProfileSection = "education" | "experience" | "preferences" | "skills" | "summary";

const SECTION_TITLES: Record<ProfileSection, string> = {
  education: "Edit education",
  experience: "Edit experience",
  preferences: "Edit role preferences",
  skills: "Edit skills",
  summary: "Edit professional summary",
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
            Cancel
          </Button>
          <Button disabled={isSaving} onClick={() => void handleSave()}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </>
      }
      isOpen={section !== null}
      onClose={onClose}
      title={section ? SECTION_TITLES[section] : ""}
    >
      {section === "summary" && (
        <label className="block text-sm font-semibold">
          Professional summary
          <textarea
            className={textareaClasses}
            maxLength={2000}
            onChange={(event) => update({ professionalSummary: event.target.value })}
            placeholder="Summarize your experience, strengths, and the work you want to do."
            value={draft.professionalSummary}
          />
        </label>
      )}

      {section === "education" && (
        <EducationEditor onChange={(education) => update({ education })} value={draft.education} />
      )}

      {section === "experience" && (
        <ExperienceEditor onChange={(experience) => update({ experience })} value={draft.experience} />
      )}

      {section === "skills" && (
        <TagEditor
          label="Skills"
          maxItems={30}
          onChange={(skills) => update({ skills })}
          placeholder="e.g. React"
          value={draft.skills}
        />
      )}

      {section === "preferences" && (
        <div className="space-y-6">
          <TagEditor
            label="Desired roles"
            maxItems={10}
            onChange={(desiredRoles) => update({ desiredRoles })}
            placeholder="e.g. Product designer"
            value={draft.desiredRoles}
          />

          <div>
            <span className="text-sm font-semibold">Work style</span>
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
                  {preference.charAt(0).toUpperCase() + preference.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">Employment type</legend>
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
                  {type}
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
            I am willing to relocate
          </label>
        </div>
      )}
    </Modal>
  );
}
