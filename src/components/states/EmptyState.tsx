import type { ReactNode } from "react";

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  title: string;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <section className="rounded-card border border-dashed border-line bg-surface p-7 text-center sm:p-10">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
          <path d="M7 3h7l4 4v14H7V3Zm7 0v5h4M10 13h5m-5 4h3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      </span>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
        {description}
      </p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </section>
  );
}
