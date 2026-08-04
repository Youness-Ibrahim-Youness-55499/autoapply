import type { ButtonHTMLAttributes, ReactNode } from "react";

type BadgeTone = "active" | "inactive" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-canvas text-ink-muted",
  neutral: "bg-brand-50 text-brand-900",
};

type BadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: BadgeTone;
};

// Static, non-interactive pill -- e.g. a skill tag or a status label.
export function Badge({ children, className = "", tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

type ToggleBadgeProps = {
  active: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

// Clickable pill with an on/off state -- e.g. a work preference the
// candidate can toggle. Uses the same active/inactive tones as the
// read-only Badge so the two read the same way in both contexts.
export function ToggleBadge({ active, children, className = "", ...props }: ToggleBadgeProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? toneClasses.active : toneClasses.inactive
      } ${className}`}
      type="button"
      {...props}
    >
      <span aria-hidden="true">{active ? "✓" : "✕"}</span>
      {children}
    </button>
  );
}
