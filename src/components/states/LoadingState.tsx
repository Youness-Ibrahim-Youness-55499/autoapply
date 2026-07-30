type LoadingStateProps = {
  description?: string;
  fullScreen?: boolean;
  title?: string;
};

export function LoadingState({
  description = "Please wait while we prepare this view.",
  fullScreen = false,
  title = "Loading",
}: LoadingStateProps) {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className={`grid place-items-center px-5 text-center ${fullScreen ? "min-h-screen bg-canvas" : "min-h-72 rounded-card border border-line bg-surface p-8"}`}
      role="status"
    >
      <div className="max-w-sm">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-brand-50 text-brand-700">
          <svg aria-hidden="true" className="size-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path className="opacity-90" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </span>
        <h2 className="mt-4 text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
      </div>
    </section>
  );
}
