import type { ReactNode } from "react";

type ErrorStateProps = {
  action?: ReactNode;
  compact?: boolean;
  description: string;
  title?: string;
};

export function ErrorState({
  action,
  compact = false,
  description,
  title = "Something went wrong",
}: ErrorStateProps) {
  if (compact) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-red-900"
        role="alert"
      >
        <p className="text-xs font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-red-800">{description}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }

  return (
    <section
      className="rounded-card border border-red-200 bg-surface p-7 text-center shadow-card sm:p-10"
      role="alert"
    >
      <span className="mx-auto grid size-11 place-items-center rounded-full bg-red-50 text-red-700">
        <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
          <path d="M12 8v5m0 3.5v.1M4.8 19h14.4a1.8 1.8 0 0 0 1.56-2.7L13.56 4a1.8 1.8 0 0 0-3.12 0L3.24 16.3A1.8 1.8 0 0 0 4.8 19Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      </span>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
        {description}
      </p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </section>
  );
}
