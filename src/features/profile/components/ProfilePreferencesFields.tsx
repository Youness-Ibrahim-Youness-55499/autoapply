import { useTranslation } from "../../../i18n";
import {
  employmentTypeLabelKeys,
  employmentTypeOptions,
  workPreferenceLabelKeys,
  workPreferences,
  type CandidateProfile,
  type WorkPreference,
} from "../profile.types";
import { TagEditor } from "./TagEditor";

type ProfilePreferencesFieldsProps = {
  onChange: (changes: Partial<CandidateProfile>) => void;
  value: CandidateProfile;
};

export function ProfilePreferencesFields({ onChange, value }: ProfilePreferencesFieldsProps) {
  const { t } = useTranslation();

  function toggleEmploymentType(type: string) {
    onChange({
      employmentTypes: value.employmentTypes.includes(type)
        ? value.employmentTypes.filter((item) => item !== type)
        : [...value.employmentTypes, type],
    });
  }

  return (
    <div className="space-y-6">
      <TagEditor
        label={t("profile.editModal.desiredRolesLabel")}
        maxItems={10}
        onChange={(desiredRoles) => onChange({ desiredRoles })}
        placeholder={t("profile.editModal.desiredRolesPlaceholder")}
        value={value.desiredRoles}
      />

      <div>
        <span className="text-sm font-semibold">{t("profile.preferences.workStyle")}</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-4">
          {workPreferences.map((preference) => (
            <label
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
                value.workPreference === preference
                  ? "border-brand-500 bg-brand-50 text-brand-900"
                  : "border-line bg-canvas"
              }`}
              key={preference}
            >
              <input
                checked={value.workPreference === preference}
                className="accent-brand-800"
                name="work-preference"
                onChange={() => onChange({ workPreference: preference as WorkPreference })}
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
                value.employmentTypes.includes(type)
                  ? "border-brand-500 bg-brand-50 text-brand-900"
                  : "border-line bg-canvas"
              }`}
              key={type}
            >
              <input
                checked={value.employmentTypes.includes(type)}
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
          checked={value.willingToRelocate}
          className="size-4 accent-brand-800"
          onChange={(event) => onChange({ willingToRelocate: event.target.checked })}
          type="checkbox"
        />
        {t("profile.editModal.willingToRelocate")}
      </label>
    </div>
  );
}
