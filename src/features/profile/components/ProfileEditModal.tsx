import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useTranslation } from "../../../i18n";
import {
  autoApplyLevels,
  coverLetterPreferences,
  employmentTypeLabelKeys,
  employmentTypeOptions,
  languageLevels,
  travelWillingnessOptions,
  workAuthorizationOptions,
  workPreferenceLabelKeys,
  workPreferences,
  type AutoApplyLevel,
  type CandidateProfile,
  type CoverLetterPreference,
  type LanguageLevel,
  type TravelWillingness,
  type WorkAuthorization,
  type WorkPreference,
} from "../profile.types";
import { getProfileCompletion } from "../profile.utils";
import { EducationEditor, ExperienceEditor } from "./RepeatableEditors";
import { TagEditor } from "./TagEditor";

export type ProfileSection = "application" | "education" | "eligibility" | "exclusions" | "experience" | "languages" | "preferences" | "skills" | "summary";

const SECTION_TITLE_KEYS: Record<ProfileSection, string> = {
  application: "profile.application.title",
  education: "profile.editModal.educationTitle",
  eligibility: "profile.eligibility.title",
  exclusions: "profile.exclusions.title",
  experience: "profile.editModal.experienceTitle",
  languages: "profile.languages.title",
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

  function toggleAutoApplyLevel(value: AutoApplyLevel) {
    update({ autoApplyLevels: draft.autoApplyLevels.includes(value) ? draft.autoApplyLevels.filter((item) => item !== value) : [...draft.autoApplyLevels, value] });
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
          <TagEditor label={t("profile.preferences.preferredLocations")} maxItems={10} onChange={(preferredLocations) => update({ preferredLocations })} placeholder={t("profile.preferences.locationsPlaceholder")} value={draft.preferredLocations} />

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
          <details className="rounded-xl border border-line bg-canvas/50 p-4">
            <summary className="cursor-pointer text-sm font-semibold">{t("profile.preferences.optional")}</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">{t("profile.preferences.minimumSalary")}<input className={inputClasses} min="0" onChange={(event) => update({ minimumSalary: event.target.value ? Number(event.target.value) : null })} type="number" value={draft.minimumSalary ?? ""} /></label>
              <label className="text-sm font-semibold">{t("profile.preferences.maximumSalary")}<input className={inputClasses} min="0" onChange={(event) => update({ maximumSalary: event.target.value ? Number(event.target.value) : null })} type="number" value={draft.maximumSalary ?? ""} /></label>
              <label className="text-sm font-semibold">{t("profile.preferences.travel")}<select className={inputClasses} onChange={(event) => update({ travelWillingness: event.target.value as TravelWillingness })} value={draft.travelWillingness}>{travelWillingnessOptions.map((value) => <option key={value} value={value}>{t(`profile.travel.${value}`)}</option>)}</select></label>
            </div>
            <div className="mt-4"><TagEditor label={t("profile.preferences.companyTypes")} maxItems={10} onChange={(companyTypes) => update({ companyTypes })} placeholder={t("profile.preferences.companyTypesPlaceholder")} value={draft.companyTypes} /></div>
          </details>
        </div>
      )}

      {section === "languages" && (
        <div className="space-y-4">
          {draft.languages.map((language, index) => (
            <fieldset className="rounded-xl border border-line bg-canvas/55 p-4" key={language.id}>
              <legend className="px-2 text-sm font-semibold">{t("profile.languages.entry", { number: index + 1 })}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">{t("profile.languages.name")}<input className={inputClasses} onChange={(event) => update({ languages: draft.languages.map((item) => item.id === language.id ? { ...item, name: event.target.value } : item) })} value={language.name} /></label>
                <label className="text-sm font-semibold">{t("profile.languages.level")}<select className={inputClasses} onChange={(event) => update({ languages: draft.languages.map((item) => item.id === language.id ? { ...item, level: event.target.value as LanguageLevel } : item) })} value={language.level}>{languageLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm"><input checked={language.confirmed} className="accent-brand-800" onChange={(event) => update({ languages: draft.languages.map((item) => item.id === language.id ? { ...item, confirmed: event.target.checked } : item) })} type="checkbox" />{t("profile.languages.confirm")}</label>
              <button className="mt-3 text-sm font-semibold text-red-700 hover:underline" onClick={() => update({ languages: draft.languages.filter((item) => item.id !== language.id) })} type="button">{t("profile.remove")}</button>
            </fieldset>
          ))}
          <button className="rounded-full border border-line px-4 py-2 text-sm font-semibold" onClick={() => update({ languages: [...draft.languages, { confirmed: false, id: crypto.randomUUID(), level: "B1", name: "" }] })} type="button">{t("profile.languages.add")}</button>
        </div>
      )}

      {section === "eligibility" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">{t("profile.eligibility.authorization")}<select className={inputClasses} onChange={(event) => update({ workAuthorization: event.target.value as WorkAuthorization })} value={draft.workAuthorization}><option value="">{t("profile.choose")}</option>{workAuthorizationOptions.map((value) => <option key={value} value={value}>{t(`profile.authorization.${value}`)}</option>)}</select></label>
          <label className="text-sm font-semibold">{t("profile.eligibility.startDate")}<input className={inputClasses} onChange={(event) => update({ earliestStartDate: event.target.value })} type="date" value={draft.earliestStartDate} /></label>
          <label className="text-sm font-semibold">{t("profile.eligibility.notice")}<input className={inputClasses} maxLength={100} onChange={(event) => update({ noticePeriod: event.target.value })} value={draft.noticePeriod} /></label>
        </div>
      )}

      {section === "application" && (
        <div className="space-y-6">
          <fieldset><legend className="text-sm font-semibold">{t("profile.application.autoApply")}</legend><div className="mt-2 flex flex-wrap gap-2">{autoApplyLevels.map((value) => <label className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm" key={value}><input checked={draft.autoApplyLevels.includes(value)} className="accent-brand-800" onChange={() => toggleAutoApplyLevel(value)} type="checkbox" />{t(`profile.matchLevel.${value}`)}</label>)}</div></fieldset>
          <label className="block text-sm font-semibold">{t("profile.application.minimumScore")}<input className="mt-3 w-full accent-brand-700" max="100" min="0" onChange={(event) => update({ minimumMatchScore: Number(event.target.value) })} type="range" value={draft.minimumMatchScore} /><span className="mt-1 block text-sm text-ink-muted">{draft.minimumMatchScore}%</span></label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-line p-4 text-sm font-semibold">{t("profile.application.cvTailoring")}<input checked={draft.cvTailoring} className="size-4 accent-brand-800" onChange={(event) => update({ cvTailoring: event.target.checked })} type="checkbox" /></label>
          <label className="block text-sm font-semibold">{t("profile.application.coverLetter")}<select className={inputClasses} onChange={(event) => update({ coverLetterPreference: event.target.value as CoverLetterPreference })} value={draft.coverLetterPreference}>{coverLetterPreferences.map((value) => <option key={value} value={value}>{t(`profile.coverLetter.${value}`)}</option>)}</select></label>
        </div>
      )}

      {section === "exclusions" && (
        <div className="space-y-5">
          <fieldset><legend className="text-sm font-semibold">{t("profile.exclusions.doNotApply")}</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{(["temporaryContracts", "recruitmentAgencies", "jobsBelowSalary", "jobsRequiringRelocation"] as const).map((key) => <label className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm" key={key}><input checked={draft.applicationExclusions[key]} className="accent-brand-800" onChange={(event) => update({ applicationExclusions: { ...draft.applicationExclusions, [key]: event.target.checked } })} type="checkbox" />{t(`profile.exclusions.${key}`)}</label>)}</div></fieldset>
          <TagEditor label={t("profile.exclusions.industries")} maxItems={20} onChange={(excludedIndustries) => update({ applicationExclusions: { ...draft.applicationExclusions, excludedIndustries } })} placeholder={t("profile.exclusions.industriesPlaceholder")} value={draft.applicationExclusions.excludedIndustries} />
          <TagEditor label={t("profile.exclusions.companies")} maxItems={20} onChange={(blockedCompanies) => update({ applicationExclusions: { ...draft.applicationExclusions, blockedCompanies } })} placeholder={t("profile.exclusions.companiesPlaceholder")} value={draft.applicationExclusions.blockedCompanies} />
        </div>
      )}
    </Modal>
  );
}
