import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { useTranslation } from "../../../i18n";
import {
  employmentTypeLabelKeys,
  employmentTypeOptions,
  visaStatusLabelKeys,
  visaStatuses,
  workPreferenceLabelKeys,
  workPreferences,
  type CandidateProfile,
  type VisaStatus,
  type WorkPreference,
} from "../../profile/profile.types";
import { TagEditor } from "../../profile/components/TagEditor";

type StepPreferencesProps = {
  isSaving: boolean;
  onContinue: (patch: Partial<CandidateProfile>) => Promise<boolean>;
  onSkip: () => void;
  profile: CandidateProfile;
};

const inputClasses =
  "mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function StepPreferences({ isSaving, onContinue, onSkip, profile }: StepPreferencesProps) {
  const { t } = useTranslation();
  const [desiredRoles, setDesiredRoles] = useState(profile.desiredRoles);
  const [preferredLocations, setPreferredLocations] = useState(profile.preferredLocations);
  const [workPreference, setWorkPreference] = useState(profile.workPreference);
  const [employmentTypes, setEmploymentTypes] = useState(profile.employmentTypes);
  const [minimumSalary, setMinimumSalary] = useState(profile.minimumSalary);
  const [visaStatus, setVisaStatus] = useState(profile.visaStatus);
  const [preferredLanguages, setPreferredLanguages] = useState(profile.preferredLanguages);
  const [willingToRelocate, setWillingToRelocate] = useState(profile.willingToRelocate);
  const [excludedCompanies, setExcludedCompanies] = useState(profile.excludedCompanies);
  const [excludedIndustries, setExcludedIndustries] = useState(profile.excludedIndustries);

  function toggleEmploymentType(value: string) {
    setEmploymentTypes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onContinue({
      desiredRoles,
      employmentTypes,
      excludedCompanies,
      excludedIndustries,
      minimumSalary,
      preferredLanguages,
      preferredLocations,
      visaStatus,
      willingToRelocate,
      workPreference,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="eyebrow">{t("onboarding.preferences.eyebrow")}</p>
      <h2 className="mt-2 text-2xl font-semibold">{t("onboarding.preferences.title")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {t("onboarding.preferences.description")}
      </p>

      <div className="mt-6 space-y-7">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            {t("onboarding.preferences.roleSection")}
          </h3>
          <div className="mt-3 space-y-4">
            <TagEditor
              label={t("profile.editModal.desiredRolesLabel")}
              maxItems={10}
              onChange={setDesiredRoles}
              placeholder={t("profile.editModal.desiredRolesPlaceholder")}
              value={desiredRoles}
            />
            <fieldset>
              <legend className="text-sm font-semibold">{t("profile.preferences.employmentType")}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {employmentTypeOptions.map((type) => (
                  <label
                    className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition ${
                      employmentTypes.includes(type)
                        ? "border-brand-500 bg-brand-50 text-brand-900"
                        : "border-line bg-canvas"
                    }`}
                    key={type}
                  >
                    <input
                      checked={employmentTypes.includes(type)}
                      className="accent-brand-800"
                      onChange={() => toggleEmploymentType(type)}
                      type="checkbox"
                    />
                    {t(employmentTypeLabelKeys[type])}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm font-semibold">
              {t("profile.editModal.minimumSalaryLabel")}
              <input
                className={inputClasses}
                min={0}
                onChange={(event) =>
                  setMinimumSalary(event.target.value === "" ? null : Number(event.target.value))
                }
                placeholder={t("profile.editModal.minimumSalaryPlaceholder")}
                type="number"
                value={minimumSalary ?? ""}
              />
            </label>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            {t("onboarding.preferences.locationSection")}
          </h3>
          <div className="mt-3 space-y-4">
            <TagEditor
              label={t("profile.editModal.preferredLocationsLabel")}
              maxItems={10}
              onChange={setPreferredLocations}
              placeholder={t("profile.editModal.preferredLocationsPlaceholder")}
              value={preferredLocations}
            />
            <div>
              <span className="text-sm font-semibold">{t("profile.preferences.workStyle")}</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                {workPreferences.map((preference) => (
                  <label
                    className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
                      workPreference === preference
                        ? "border-brand-500 bg-brand-50 text-brand-900"
                        : "border-line bg-canvas"
                    }`}
                    key={preference}
                  >
                    <input
                      checked={workPreference === preference}
                      className="accent-brand-800"
                      name="work-preference"
                      onChange={() => setWorkPreference(preference as WorkPreference)}
                      type="radio"
                    />
                    {t(workPreferenceLabelKeys[preference])}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                checked={willingToRelocate}
                className="size-4 accent-brand-800"
                onChange={(event) => setWillingToRelocate(event.target.checked)}
                type="checkbox"
              />
              {t("profile.editModal.willingToRelocate")}
            </label>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            {t("onboarding.preferences.eligibilitySection")}
          </h3>
          <div className="mt-3 space-y-4">
            <div>
              <span className="text-sm font-semibold">{t("profile.preferences.visaStatus")}</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {visaStatuses.map((status) => (
                  <label
                    className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
                      visaStatus === status
                        ? "border-brand-500 bg-brand-50 text-brand-900"
                        : "border-line bg-canvas"
                    }`}
                    key={status}
                  >
                    <input
                      checked={visaStatus === status}
                      className="accent-brand-800"
                      name="visa-status"
                      onChange={() => setVisaStatus(status as VisaStatus)}
                      type="radio"
                    />
                    {t(visaStatusLabelKeys[status])}
                  </label>
                ))}
              </div>
            </div>
            <TagEditor
              label={t("profile.editModal.preferredLanguagesLabel")}
              maxItems={10}
              onChange={setPreferredLanguages}
              placeholder={t("profile.editModal.preferredLanguagesPlaceholder")}
              value={preferredLanguages}
            />
            <TagEditor
              label={t("profile.editModal.excludedCompaniesLabel")}
              maxItems={20}
              onChange={setExcludedCompanies}
              placeholder={t("profile.editModal.excludedCompaniesPlaceholder")}
              value={excludedCompanies}
            />
            <TagEditor
              label={t("profile.editModal.excludedIndustriesLabel")}
              maxItems={20}
              onChange={setExcludedIndustries}
              placeholder={t("profile.editModal.excludedIndustriesPlaceholder")}
              value={excludedIndustries}
            />
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button disabled={isSaving} onClick={onSkip} type="button" variant="secondary">
          {t("onboarding.skip")}
        </Button>
        <Button disabled={isSaving} type="submit">
          {isSaving ? t("profile.saving") : t("onboarding.continue")}
        </Button>
      </div>
    </form>
  );
}
