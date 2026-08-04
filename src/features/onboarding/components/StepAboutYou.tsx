import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { useTranslation } from "../../../i18n";
import type { CandidateProfile } from "../../profile/profile.types";

type StepAboutYouProps = {
  isSaving: boolean;
  onContinue: (patch: Partial<CandidateProfile>) => Promise<boolean>;
  onSkip: () => void;
  profile: CandidateProfile;
};

const inputClasses =
  "mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

// No CV-extraction pipeline exists to auto-fill this from the upload in
// step 1 -- deliberately framed as a manual "tell us about yourself"
// step rather than pretending anything was parsed out of the file.
export function StepAboutYou({ isSaving, onContinue, onSkip, profile }: StepAboutYouProps) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(profile.fullName);
  const [headline, setHeadline] = useState(profile.headline);
  const [location, setLocation] = useState(profile.location);
  const [professionalSummary, setProfessionalSummary] = useState(profile.professionalSummary);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onContinue({ fullName, headline, location, professionalSummary });
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="eyebrow">{t("onboarding.about.eyebrow")}</p>
      <h2 className="mt-2 text-2xl font-semibold">{t("onboarding.about.title")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {t("onboarding.about.description")}
      </p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">
          {t("profile.editModal.fullNameLabel")}
          <input
            className={inputClasses}
            maxLength={120}
            onChange={(event) => setFullName(event.target.value)}
            required
            value={fullName}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            {t("profile.editModal.headlineLabel")}
            <input
              className={inputClasses}
              maxLength={180}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder={t("profile.editModal.headlinePlaceholder")}
              value={headline}
            />
          </label>
          <label className="text-sm font-semibold">
            {t("profile.editModal.locationLabel")}
            <input
              className={inputClasses}
              maxLength={160}
              onChange={(event) => setLocation(event.target.value)}
              placeholder={t("profile.editModal.locationPlaceholder")}
              value={location}
            />
          </label>
        </div>
        <label className="block text-sm font-semibold">
          {t("profile.editModal.summaryLabel")}
          <textarea
            className={`${inputClasses} min-h-32 py-3`}
            maxLength={2000}
            onChange={(event) => setProfessionalSummary(event.target.value)}
            placeholder={t("profile.editModal.summaryPlaceholder")}
            value={professionalSummary}
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button disabled={isSaving} onClick={onSkip} type="button" variant="secondary">
          {t("onboarding.skip")}
        </Button>
        <Button disabled={isSaving || !fullName.trim()} type="submit">
          {isSaving ? t("profile.saving") : t("onboarding.continue")}
        </Button>
      </div>
    </form>
  );
}
