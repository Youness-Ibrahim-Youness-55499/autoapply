import type { ReactNode } from "react";
import { Card } from "../../../components/ui/Card";

type ProfileSectionCardProps = {
  children: ReactNode;
  editLabel: string;
  icon: ReactNode;
  iconClassName: string;
  onEdit: () => void;
  subtitle: string;
  title: string;
};

// Shared header pattern for every profile card: a colored icon badge,
// title + subtitle, and an Edit button that opens that section's modal.
// Reused five times (summary excluded -- it uses its own lighter-weight
// header, see ProfileSummaryCard.tsx) so the icon/title/subtitle/edit
// alignment doesn't get re-implemented slightly differently each time.
export function ProfileSectionCard({
  children,
  editLabel,
  icon,
  iconClassName,
  onEdit,
  subtitle,
  title,
}: ProfileSectionCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={`grid size-9 shrink-0 place-items-center rounded-xl ${iconClassName}`}
          >
            {icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-ink-muted">{subtitle}</p>
          </div>
        </div>
        <button
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-semibold transition hover:bg-canvas"
          onClick={onEdit}
          type="button"
        >
          <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 24 24">
            <path d="m16.5 4.5 3 3L7 20H4v-3L16.5 4.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
          {editLabel}
        </button>
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}
