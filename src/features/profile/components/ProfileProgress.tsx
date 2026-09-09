import { Button } from "../../../components/ui/Button";
import { useTranslation } from "../../../i18n";
import { getJobReadiness, type ReadinessRequirementKey } from "../profile.utils";
import type { CandidateProfile } from "../profile.types";

const requirementLabelKeys: Record<ReadinessRequirementKey, string> = {
  applicationPreferences: "profile.readiness.requirement.applicationPreferences",
  basics: "profile.readiness.requirement.basics",
  experience: "profile.readiness.requirement.experience",
  location: "profile.readiness.requirement.location",
  rolePreferences: "profile.readiness.requirement.rolePreferences",
  salary: "profile.readiness.requirement.salary",
  skills: "profile.readiness.requirement.skills",
  workAuthorization: "profile.readiness.requirement.workAuthorization",
};

type ProfileProgressProps = {
  onComplete: () => void;
  profile: CandidateProfile;
};

export function ProfileProgress({ onComplete, profile }: ProfileProgressProps) {
  const { t } = useTranslation();
  const readiness = getJobReadiness(profile);

  return (
    <section className="overflow-hidden rounded-card border border-brand-900 bg-brand-950 text-white shadow-card">
      <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-300">
            {t("profile.readiness.eyebrow")}
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
            <h2 className="text-3xl font-semibold">{t("profile.readiness.title")}</h2>
            <span className="text-4xl font-bold tabular-nums text-brand-200">{readiness.percentage}%</span>
          </div>
          <div
            aria-label={t("profile.readiness.scoreLabel", { percentage: readiness.percentage })}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={readiness.percentage}
            className="mt-5 h-2 max-w-2xl overflow-hidden rounded-full bg-white/12"
            role="progressbar"
          >
            <div className="h-full rounded-full bg-brand-300" style={{ width: `${readiness.percentage}%` }} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5">
              {readiness.readyToSearch ? "✓" : "○"} {t("profile.readiness.readySearch")}
            </span>
            <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5">
              {readiness.readyToApply ? "✓" : "○"} {t("profile.readiness.readyApply")}
            </span>
          </div>
        </div>

        <div className="lg:max-w-sm">
          <p className="text-sm font-semibold">{t("profile.readiness.missing")}</p>
          {readiness.missing.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {readiness.missing.map((key) => (
                <li className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/75" key={key}>
                  {t(requirementLabelKeys[key])}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-brand-200">{t("profile.readiness.complete")}</p>
          )}
          {readiness.missing.length > 0 && (
            <Button className="mt-5" onClick={onComplete} variant="secondary">
              {t("profile.readiness.cta")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
