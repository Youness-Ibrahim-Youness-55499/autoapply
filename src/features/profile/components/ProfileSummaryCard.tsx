import { Card } from "../../../components/ui/Card";
import { useTranslation } from "../../../i18n";
import type { CandidateProfile } from "../profile.types";

type ProfileSummaryCardProps = {
  onEdit: () => void;
  profile: CandidateProfile;
};

// Covers more than just the summary text -- full name, headline, and
// location live here too. The design reference doesn't show a separate
// card for those, and bundling them with the summary (rather than
// dropping them, which the reference's own layout would otherwise imply)
// keeps them editable; they were part of the original always-visible
// form and are still factored into profile-completion tracking.
export function ProfileSummaryCard({ onEdit, profile }: ProfileSummaryCardProps) {
  const { t } = useTranslation();
  const metaLine = [
    profile.headline || t("profile.about.headlinePlaceholder"),
    profile.location || t("profile.about.locationPlaceholder"),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{profile.fullName}</h2>
          <p className="mt-0.5 truncate text-sm text-ink-muted">{metaLine}</p>

          <p className="eyebrow mt-4">{t("profile.summary.eyebrow")}</p>
          {profile.professionalSummary ? (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed">
              {profile.professionalSummary}
            </p>
          ) : (
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
              {t("profile.summary.placeholder")}
            </p>
          )}
        </div>
        <button
          className="shrink-0 text-sm font-semibold text-brand-800 transition hover:underline"
          onClick={onEdit}
          type="button"
        >
          {t("profile.summary.editLink")}
        </button>
      </div>
    </Card>
  );
}
