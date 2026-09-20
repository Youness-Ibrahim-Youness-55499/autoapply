import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "../../i18n";

type SplitButtonAction = { label: string; onSelect: () => void };

type SplitButtonProps = {
  actions: SplitButtonAction[];
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
};

// Primary action + a chevron that opens secondary actions (mockup "Export CV").
export function SplitButton({ actions, children, disabled, onClick }: SplitButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const segment =
    "bg-[linear-gradient(180deg,#07825f,var(--color-brand-800))] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2";

  return (
    <div className="relative inline-flex shadow-button" ref={containerRef}>
      <button
        className={`inline-flex min-h-12 items-center gap-2 rounded-l-full px-6 button-text ${segment}`}
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t("common.moreActions")}
        className={`grid min-h-12 w-11 place-items-center rounded-r-full border-l border-white/25 ${segment}`}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg"
          role="menu"
        >
          {actions.map((action) => (
            <button
              className="block w-full px-4 py-2 text-left text-sm font-medium text-ink transition hover:bg-canvas"
              key={action.label}
              onClick={() => {
                setIsOpen(false);
                action.onSelect();
              }}
              role="menuitem"
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
