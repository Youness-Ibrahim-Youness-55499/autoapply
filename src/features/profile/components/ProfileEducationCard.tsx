import { useTranslation } from "../../../i18n";
import type { EducationEntry } from "../profile.types";
import { ProfileSectionCard } from "./ProfileSectionCard";

const GRADUATION_CAP_ICON = (
  <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
    <path
      d="m3 9 9-4.5 9 4.5-9 4.5L3 9Zm4.5 2.5V16c0 1.1 2.5 2.5 4.5 2.5s4.5-1.4 4.5-2.5v-4.5M20 9v5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    />
  </svg>
);

function initialBadge(label: string) {
  const initial = label.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-sm font-bold text-violet-700"
    >
      {initial}
    </span>
  );
}

function formatRange(entry: EducationEntry) {
  return `${entry.startDate || "—"} - ${entry.endDate || "—"}`;
}

type ProfileEducationCardProps = {
  education: EducationEntry[];
  onEdit: () => void;
};

export function ProfileEducationCard({ education, onEdit }: ProfileEducationCardProps) {
  const { t } = useTranslation();

  return (
    <ProfileSectionCard
      editLabel={t("profile.edit")}
      icon={GRADUATION_CAP_ICON}
      iconClassName="bg-violet-100 text-violet-700"
      onEdit={onEdit}
      subtitle={t(
        education.length === 1 ? "profile.education.subtitleOne" : "profile.education.subtitleOther",
        { count: education.length },
      )}
      title={t("profile.education.title")}
    >
      {education.length === 0 ? (
        <p className="text-sm text-ink-muted">{t("profile.education.empty")}</p>
      ) : (
        <ul className="-mt-1">
          {education.map((entry, index) => (
            <li
              className={`flex gap-3 py-3.5 ${index > 0 ? "border-t border-line" : ""}`}
              key={entry.id}
            >
              {initialBadge(entry.institution)}
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold leading-snug">{entry.institution}</p>
                <p className="truncate text-sm text-brand-800">
                  {entry.degree}
                  {entry.field && ` · ${entry.field}`}
                </p>
                <p className="mt-1 text-xs text-ink-muted">{formatRange(entry)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ProfileSectionCard>
  );
}
