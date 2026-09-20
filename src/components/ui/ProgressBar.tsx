type ProgressBarProps = {
  label: string;
  percent: number;
  tone?: "gold" | "green";
  valueLabel?: string;
};

// Labelled progress bar (design system #12: green for progress/completeness,
// gold for match-style meters). `percent` is clamped to 0-100.
export function ProgressBar({ label, percent, tone = "green", valueLabel }: ProgressBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-semibold text-ink-muted">{valueLabel ?? `${Math.round(clamped)}%`}</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(clamped)}
        className="h-2 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            background:
              tone === "gold"
                ? "linear-gradient(90deg, var(--color-accent-gold), #fcd34d)"
                : "linear-gradient(90deg, var(--color-brand-600), var(--color-brand-400))",
            width: `${clamped}%`,
          }}
        />
      </div>
    </div>
  );
}
