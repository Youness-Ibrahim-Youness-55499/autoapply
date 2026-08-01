import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n";
import { navEntrance } from "../../lib/motion";
import { PageContainer } from "./PageContainer";

const navigationItems = [
  { href: "#features", labelKey: "nav.features" },
  { href: "#how-it-works", labelKey: "nav.howItWorks" },
  { href: "#pricing", labelKey: "nav.pricing" },
  { href: "#faq", labelKey: "nav.faq" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const { locale, setLocale, t } = useTranslation();

  return (
    <motion.header
      animate="visible"
      className={`sticky top-0 z-40 border-b transition-colors duration-[var(--duration-standard)] ${
        isScrolled
          ? "border-line/80 bg-canvas/95 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
      initial={reduceMotion ? undefined : "hidden"}
      variants={navEntrance}
    >
      <PageContainer>
        <div
          className={`flex items-center justify-between gap-6 transition-[min-height] duration-[var(--duration-standard)] ${
            isScrolled ? "min-h-16" : "min-h-18"
          }`}
        >
          <a
            className="text-lg font-bold tracking-[-0.03em] text-brand-900"
            href="#top"
          >
            autoapply
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {navigationItems.map((item) => (
              <a
                className="rounded-full px-3 py-2 text-sm font-medium text-ink-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
                href={item.href}
                key={item.href}
              >
                {t(item.labelKey)}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-sm text-ink-muted md:flex">
              <label htmlFor="locale-select" className="sr-only">
                {t("language.label")}
              </label>
              <select
                id="locale-select"
                value={locale}
                onChange={(event) => setLocale(event.target.value as "en" | "de")}
                className="bg-transparent text-sm text-ink-muted outline-none"
              >
                <option value="en">{t("language.english")}</option>
                <option value="de">{t("language.german")}</option>
              </select>
            </div>
            <Link
              className="rounded-full px-3 py-2 text-sm font-semibold text-ink transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
              to="/login"
            >
              {t("header.logIn")}
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-brand-900 bg-brand-900 px-5 text-sm font-semibold text-white shadow-button transition-colors hover:border-brand-800 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
              to="/signup"
            >
              {t("header.signUp")}
            </Link>
          </div>

          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={
              isMenuOpen ? t("nav.closeMobile") : t("nav.openMobile")
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
                  {t(item.labelKey)}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-4">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink"
                  onClick={closeMenu}
                  to="/login"
                >
                  {t("header.logIn")}
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-900 px-4 text-sm font-semibold text-white"
                  onClick={closeMenu}
                  to="/signup"
                >
                  {t("header.signUp")}
                </Link>
              </div>
            </div>
          </nav>
        )}
      </PageContainer>
    </motion.header>
  );
}

