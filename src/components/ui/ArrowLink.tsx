import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// Tertiary "View all →" style link from the design system's button set.
export function ArrowLink({ children, className = "", to }: { children: ReactNode; className?: string; to: string }) {
  return (
    <Link
      className={`inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-800 ${className}`}
      to={to}
    >
      {children}
      <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
        <path d="M5 12h14m0 0-5-5m5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    </Link>
  );
}
