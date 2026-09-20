import type { ReactNode } from "react";

export function StatTile({
  delta,
  icon,
  label,
  value,
}: {
  delta?: string;
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold tracking-tight">{value}</div>
        <div className="text-xs font-semibold text-ink-muted">{label}</div>
        {delta && <div className="mt-0.5 text-xs font-semibold text-brand-600">↗ {delta}</div>}
      </div>
    </div>
  );
}
