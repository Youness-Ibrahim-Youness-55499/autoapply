import { useTranslation } from "../../../i18n";
import type { CandidateProfile } from "../profile.types";

const inputClasses =
  "mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const textareaClasses = `${inputClasses} min-h-32 py-3`;

type ProfileSummaryFieldsProps = {
  onChange: (changes: Partial<CandidateProfile>) => void;
  value: CandidateProfile;
};

export function ProfileSummaryFields({ onChange, value }: ProfileSummaryFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold">
        {t("profile.editModal.fullNameLabel")}
        <input
          autoComplete="name"
          className={inputClasses}
          maxLength={120}
          onChange={(event) => onChange({ fullName: event.target.value })}
          required
          value={value.fullName}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          {t("profile.editModal.headlineLabel")}
          <input
            className={inputClasses}
            maxLength={180}
            onChange={(event) => onChange({ headline: event.target.value })}
            placeholder={t("profile.editModal.headlinePlaceholder")}
            value={value.headline}
          />
        </label>
        <label className="text-sm font-semibold">
          {t("profile.editModal.locationLabel")}
          <input
            className={inputClasses}
            maxLength={160}
            onChange={(event) => onChange({ location: event.target.value })}
            placeholder={t("profile.editModal.locationPlaceholder")}
            value={value.location}
          />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        {t("profile.editModal.summaryLabel")}
        <textarea
          className={textareaClasses}
          maxLength={2000}
          onChange={(event) => onChange({ professionalSummary: event.target.value })}
          placeholder={t("profile.editModal.summaryPlaceholder")}
          value={value.professionalSummary}
        />
      </label>
    </div>
  );
}
