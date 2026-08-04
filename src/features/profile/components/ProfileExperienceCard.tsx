import type { ExperienceEntry } from "../profile.types";
import { ProfileSectionCard } from "./ProfileSectionCard";

const BRIEFCASE_ICON = (
  <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
    <path
      d="M8 6V4.8A1.8 1.8 0 0 1 9.8 3h4.4A1.8 1.8 0 0 1 16 4.8V6m4 4H4m2-4h12a2 2 0 0 1 2 2v10.5A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5V8a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    />
  </svg>
);

function initialBadge(label: string, isCurrent: boolean) {
  const initial = label.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${
        isCurrent ? "bg-emerald-100 text-emerald-700" : "bg-canvas text-ink-muted"
      }`}
    >
      {initial}
    </span>
  );
}

function formatRange(entry: ExperienceEntry) {
  const start = entry.startDate || "—";
  const end = entry.current ? "Present" : entry.endDate || "—";
  return `${start} – ${end}`;
}

type ProfileExperienceCardProps = {
  experience: ExperienceEntry[];
  onEdit: () => void;
};

export function ProfileExperienceCard({ experience, onEdit }: ProfileExperienceCardProps) {
  return (
    <ProfileSectionCard
      editLabel="Edit"
      icon={BRIEFCASE_ICON}
      iconClassName="bg-emerald-100 text-emerald-700"
      onEdit={onEdit}
      subtitle={`${experience.length} ${experience.length === 1 ? "role" : "roles"}`}
      title="Experience"
    >
      {experience.length === 0 ? (
        <p className="text-sm text-ink-muted">No work experience added yet.</p>
      ) : (
        <ul>
          {experience.map((entry, index) => (
            <li className="flex gap-3" key={entry.id}>
              <div className="flex flex-col items-center">
                {initialBadge(entry.company, entry.current)}
                {index < experience.length - 1 && (
                  <span aria-hidden="true" className="mt-1.5 w-px flex-1 bg-line" />
                )}
              </div>
              <div className={`min-w-0 flex-1 ${index < experience.length - 1 ? "pb-5" : ""}`}>
                <p className="text-[15px] font-bold leading-snug">{entry.role}</p>
                <p className="truncate text-sm text-brand-800">{entry.company}</p>
                <p className="mt-1 text-xs text-ink-muted">{formatRange(entry)}</p>
                {entry.description && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                    {entry.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </ProfileSectionCard>
  );
}
