import { useEffect, useRef, useState } from "react";
import { PageContainer } from "./PageContainer";

const navigationItems = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    function closeAtDesktopWidth(event: MediaQueryListEvent) {
      if (event.matches) {
        setIsMenuOpen(false);
      }
    }

    const desktopQuery = window.matchMedia("(min-width: 768px)");

    document.addEventListener("keydown", closeOnEscape);
    desktopQuery.addEventListener("change", closeAtDesktopWidth);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      desktopQuery.removeEventListener("change", closeAtDesktopWidth);
    };
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/95 backdrop-blur-md">
      <PageContainer>
        <div className="flex min-h-18 items-center justify-between gap-6">
          <a
            className="text-lg font-bold tracking-[-0.03em] text-brand-900"
            href="#top"
          >
            autoapply
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-7 md:flex"
          >
            {navigationItems.map((item) => (
              <a
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              className="rounded-full px-3 py-2 text-sm font-semibold text-ink transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
              href="#footer"
            >
              Contact
            </a>
            <a
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-brand-900 bg-brand-900 px-5 text-sm font-semibold text-white shadow-button transition-colors hover:border-brand-800 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
              href="#pricing"
            >
              Get started
            </a>
          </div>

          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 md:hidden"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            ref={menuButtonRef}
            type="button"
          >
            <span
              aria-hidden="true"
              className="relative block size-4"
            >
              <span
                className={`absolute left-0 top-px h-0.5 w-full rounded-full bg-current transition-transform ${
                  isMenuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-full rounded-full bg-current transition-opacity ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[13px] h-0.5 w-full rounded-full bg-current transition-transform ${
                  isMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        {isMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="border-t border-line py-4 md:hidden"
            id="mobile-navigation"
          >
            <div className="flex flex-col gap-1">
              {navigationItems.map((item) => (
                <a
                  className="rounded-lg px-3 py-3 text-sm font-medium text-ink-muted hover:bg-brand-50 hover:text-ink"
                  href={item.href}
                  key={item.href}
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-4">
                <a
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink"
                  href="#footer"
                  onClick={closeMenu}
                >
                  Contact
                </a>
                <a
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-900 px-4 text-sm font-semibold text-white"
                  href="#pricing"
                  onClick={closeMenu}
                >
                  Get started
                </a>
              </div>
            </div>
          </nav>
        )}
      </PageContainer>
    </header>
  );
}

