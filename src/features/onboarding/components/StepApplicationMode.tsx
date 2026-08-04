import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { useTranslation } from "../../../i18n";
import {
  applicationModeLabelKeys,
  applicationModes,
  type ApplicationMode,
  type CandidateProfile,
} from "../../profile/profile.types";

type StepApplicationModeProps = {
  isSaving: boolean;
  onContinue: (patch: Partial<CandidateProfile>) => Promise<boolean>;
  profile: CandidateProfile;
};

// Stored intent only -- there's no auto-submit pipeline anywhere in this
// app yet. The copy for each option makes that explicit rather than
// implying "auto" actually applies to jobs today.
export function StepApplicationMode({ isSaving, onContinue, profile }: StepApplicationModeProps) {
  const { t } = useTranslation();
  const [applicationMode, setApplicationMode] = useState(profile.applicationMode);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onContinue({ applicationMode });
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="eyebrow">{t("onboarding.mode.eyebrow")}</p>
      <h2 className="mt-2 text-2xl font-semibold">{t("onboarding.mode.title")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {t("onboarding.mode.description")}
      </p>

      <div className="mt-6 space-y-3">
        {applicationModes.map((mode) => (
          <label
            className={`block cursor-pointer rounded-xl border p-4 transition ${
              applicationMode === mode ? "border-brand-500 bg-brand-50" : "border-line bg-canvas"
            }`}
            key={mode}
          >
            <div className="flex items-start gap-3">
              <input
                checked={applicationMode === mode}
                className="mt-1 accent-brand-800"
                name="application-mode"
                onChange={() => setApplicationMode(mode as ApplicationMode)}
                type="radio"
              />
              <div>
                <p className="text-sm font-semibold">{t(applicationModeLabelKeys[mode])}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {t(`onboarding.mode.${mode}Description`)}
                </p>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button disabled={isSaving} type="submit">
          {isSaving ? t("profile.saving") : t("onboarding.continue")}
        </Button>
      </div>
    </form>
  );
}
