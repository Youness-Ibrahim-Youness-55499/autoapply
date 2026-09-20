import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../i18n";

const localeOptions = [
  { flag: "🇬🇧", labelKey: "language.english", value: "en" as const },
  { flag: "🇩🇪", labelKey: "language.german", value: "de" as const },
];

// Globe button that opens an English / German list with flags. Used in the
// signed-in header and on the marketing pages.
export function LanguageMenu() {
  const { locale, setLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t("language.label")}
        className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-canvas text-ink-muted transition hover:bg-surface hover:text-ink"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
          <path
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c1.86 0 3-4 3-9s-1.14-9-3-9-3 4-3 9 1.14 9 3 9ZM3.5 9h17M3.5 15h17"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg"
          role="listbox"
        >
          {localeOptions.map((option) => (
            <li key={option.value}>
              <button
                aria-selected={locale === option.value}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                  locale === option.value
                    ? "bg-brand-50 font-semibold text-brand-900"
                    : "text-ink hover:bg-canvas"
                }`}
                onClick={() => {
                  setLocale(option.value);
                  setIsOpen(false);
                }}
                role="option"
                type="button"
              >
                <span aria-hidden="true" className="text-base">
                  {option.flag}
                </span>
                {t(option.labelKey)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
