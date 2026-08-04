import { Card } from "../../../components/ui/Card";

type ProfileSummaryCardProps = {
  onEdit: () => void;
  summary: string;
};

export function ProfileSummaryCard({ onEdit, summary }: ProfileSummaryCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Professional summary</p>
          {summary ? (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed">{summary}</p>
          ) : (
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
              Add a professional summary, the first thing recruiters read.
            </p>
          )}
        </div>
        <button
          className="shrink-0 text-sm font-semibold text-brand-800 transition hover:underline"
          onClick={onEdit}
          type="button"
        >
          Edit →
        </button>
      </div>
    </Card>
  );
}
