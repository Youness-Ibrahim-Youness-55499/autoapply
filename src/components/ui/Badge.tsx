import type { ButtonHTMLAttributes, ReactNode } from "react";

type BadgeTone =
  | "active"
  | "aiMatch"
  | "fullTime"
  | "hiring"
  | "inactive"
  | "neutral"
  | "new"
  | "remote"
  | "topCompany"
  | "urgent"
  | "verified";

const toneClasses: Record<BadgeTone, string> = {
  active: "bg-brand-50 text-brand-800",
  aiMatch: "bg-violet-100 text-violet-700",
  fullTime: "bg-brand-100 text-brand-800",
  hiring: "bg-brand-50 text-brand-800",
  inactive: "bg-canvas text-ink-muted",
  neutral: "bg-brand-50 text-brand-900",
  new: "bg-[var(--color-accent-gold-soft)] text-amber-800",
  remote: "bg-brand-100 text-brand-800",
  topCompany: "bg-amber-50 text-amber-800",
  urgent: "bg-red-100 text-red-700",
  verified: "bg-brand-50 text-brand-800",
};

const toneIcons: Partial<Record<BadgeTone, ReactNode>> = {
  aiMatch: (
    <svg aria-hidden="true" className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="m12 2 1.7 4.6L18 8.3l-4.3 1.7L12 14.5 10.3 10 6 8.3l4.3-1.7L12 2Zm6.5 10 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
    </svg>
  ),
  hiring: <span aria-hidden="true" className="size-2 rounded-full bg-brand-500" />,
  topCompany: (
    <svg aria-hidden="true" className="size-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
    </svg>
  ),
  verified: (
    <svg aria-hidden="true" className="size-3.5 text-brand-600" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="m8 12.5 2.8 2.8L16.5 9.5" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  ),
};

type BadgeProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  tone?: BadgeTone;
};

// Static, non-interactive pill -- e.g. a skill tag or a status label.
// Tones cover the design-system badge set (Full-time, Remote, New, Urgent,
// Verified, AI Match, Top Company, Actively Hiring); verified/aiMatch/
// topCompany/hiring get their icon automatically unless `icon` overrides it.
export function Badge({ children, className = "", icon, tone = "neutral" }: BadgeProps) {
  const resolvedIcon = icon ?? toneIcons[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${toneClasses[tone]} ${className}`}
    >
      {resolvedIcon}
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
