import { useTranslation } from "../../../i18n";
import { getProfileCompletion, type ProfileCompletionSectionKey } from "../profile.utils";
import type { CandidateProfile } from "../profile.types";

const SECTION_LABEL_KEYS: Record<ProfileCompletionSectionKey, string> = {
  about: "profile.about.title",
  education: "profile.education.title",
  experience: "profile.experience.title",
  preferences: "profile.preferences.title",
  skills: "profile.skills.title",
};

export function ProfileProgress({ profile }: { profile: CandidateProfile }) {
  const { t } = useTranslation();
  const completion = getProfileCompletion(profile);

  return (
    <aside className="rounded-card border border-line bg-brand-950 p-6 text-white shadow-card sm:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-300">
            {t("profile.progress.eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {t("profile.progress.complete", { percentage: completion.percentage })}
          </h2>
        </div>
        <p className="text-sm text-white/60">
          {t("profile.progress.sections", { completed: completion.completed, total: completion.total })}
        </p>
      </div>

      <div
        aria-label={t("profile.progress.complete", { percentage: completion.percentage })}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={completion.percentage}
        className="mt-5 h-2 overflow-hidden rounded-full bg-white/12"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-brand-300 transition-[width] duration-500"
          style={{ width: `${completion.percentage}%` }}
        />
      </div>

      {completion.missing.length > 0 ? (
        <>
          <p className="mt-5 text-sm font-semibold">{t("profile.progress.stillToComplete")}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {completion.missing.map((key) => (
              <li
                className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/75"
                key={key}
              >
                {t(SECTION_LABEL_KEYS[key])}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-5 text-sm text-brand-200">{t("profile.progress.ready")}</p>
      )}
    </aside>
  );
}
