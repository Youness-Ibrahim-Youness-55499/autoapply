import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";
import { SkipLink } from "../SkipLink";
import { ErrorState } from "../states/ErrorState";
import { useTranslation } from "../../i18n";
import { useApplications } from "../../features/applications/useApplications";
import { getProfileCompletion } from "../../features/profile/profile.utils";
import { useProfile } from "../../features/profile/useProfile";
import { Logo } from "../Logo";
import { Waves } from "../decorations/Waves";
import { JobmanIcon, type JobmanIconName } from "../icons/JobmanIcon";
import { LanguageMenu } from "../ui/LanguageMenu";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationBell } from "./NotificationBell";

// There's no billing/plans table yet, so this isn't read from a user
// record -- it mirrors the "Track up to 20 roles" limit already advertised
// on the Starter plan (see pricing.planStarter.featureOne in i18n.tsx) and
// is applied to every signed-in user for now.
const FREE_PLAN_APPLICATION_LIMIT = 20;

type NavigationItem = {
  icon: JobmanIconName;
  labelKey: string;
  to: string;
};

type WorkspaceLinksProps = {
  badges?: Partial<Record<string, ReactNode>>;
  onNavigate?: () => void;
  orientation?: "horizontal" | "vertical";
  t: (key: string) => string;
};

const navigationItems: NavigationItem[] = [
  { icon: "dashboard", labelKey: "nav.overview", to: "/app" },
  { icon: "opportunities", labelKey: "nav.jobs", to: "/app/jobs" },
  { icon: "applications", labelKey: "nav.applications", to: "/app/applications" },
  { icon: "ai-assistant", labelKey: "nav.autopilot", to: "/app/autopilot" },
  { icon: "profile", labelKey: "nav.profile", to: "/app/profile" },
  { icon: "settings", labelKey: "nav.settings", to: "/app/settings" },
];

function WorkspaceLinks({ badges, onNavigate, orientation = "vertical", t }: WorkspaceLinksProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <ul className={isHorizontal ? "flex items-center gap-1" : "mt-3 space-y-1"}>
      {navigationItems.map((item) => {
        const badge = badges?.[item.to];

        return (
          <li key={item.to}>
            <NavLink
              className={({ isActive }) =>
                `flex items-center text-sm font-semibold transition ${
                  isHorizontal ? "min-h-10 gap-2 rounded-full px-3.5" : "min-h-12 gap-3 rounded-xl px-3"
                } ${isActive ? "bg-brand-50 text-brand-900" : "text-ink-muted hover:bg-canvas hover:text-ink"}`
              }
              end={item.to === "/app"}
              onClick={onNavigate}
              to={item.to}
            >
              {({ isActive }) => (
                <>
                  <JobmanIcon active={isActive} name={item.icon} />
                  <span className={isHorizontal ? "whitespace-nowrap" : "flex-1 truncate"}>{t(item.labelKey)}</span>
                  {badge && <span className="shrink-0 text-xs font-bold text-ink-muted">{badge}</span>}
                </>
              )}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

function AccountMenu({
  isSigningOut,
  name,
  onSignOut,
  planMeter,
  session,
  t,
}: {
  isSigningOut: boolean;
  name: string;
  onSignOut: () => void;
  planMeter: ReactNode;
  session: ReturnType<typeof useAuth>["session"];
  t: (key: string) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initial = name.charAt(0).toUpperCase();

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
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-line bg-canvas py-1 pl-1 pr-3 transition hover:bg-surface"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-400 text-sm font-bold text-brand-950">
          {initial}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-32 truncate text-sm font-semibold leading-tight">{name}</span>
        </span>
        <svg aria-hidden="true" className="size-4 shrink-0 text-ink-muted" fill="none" viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg"
          role="menu"
        >
          <p className="truncate px-4 py-2 text-xs text-ink-muted">{session?.user.email}</p>
          <div className="px-3 pb-2">{planMeter}</div>
          <Link
            className="block px-4 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            to="/app/settings"
          >
            {t("nav.settings")}
          </Link>
          <Link
            className="block px-4 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            to="/app/help"
          >
            {t("nav.help")}
          </Link>
          <button
            className="block w-full px-4 py-2 text-left text-sm font-medium text-ink transition hover:bg-canvas disabled:opacity-50"
            disabled={isSigningOut}
            onClick={onSignOut}
            role="menuitem"
            type="button"
          >
            {t("header.logOut")}
          </button>
        </div>
      )}
    </div>
  );
}

function SidebarPlanMeter({
  limit,
  t,
  used,
}: {
  limit: number;
  t: (key: string, values?: Record<string, string | number>) => string;
  used: number;
}) {
  const percentUsed = Math.min(Math.round((used / limit) * 100), 100);
  const isExhausted = used >= limit;

  return (
    <div
      className="relative min-h-32 overflow-hidden rounded-xl border border-line px-3.5 py-3"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #f2fffa 100%)" }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-muted">
            {t("dashboard.planFreeLabel")}
          </span>
          <span className="text-xs font-bold text-ink">
            {used}/{limit}
          </span>
        </div>
        <div aria-hidden="true" className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full transition-[width]"
            style={{
              backgroundColor: isExhausted ? "var(--color-status-error)" : "var(--color-accent-gold)",
              width: `${percentUsed}%`,
            }}
          />
        </div>
        <Link
          className="mt-2 inline-block text-xs font-semibold text-brand-700 transition hover:text-brand-800"
          to="/#pricing"
        >
          {t("dashboard.planUpgrade")}
        </Link>
      </div>
      <Waves className="h-14" />
    </div>
  );
}

export function AppShell() {
  const { session } = useAuth();
  const { locale, setLocale, t } = useTranslation();
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const metadataName = session?.user.user_metadata.name;
  const name =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : "Your account";
  const { applications } = useApplications();
  const { profile } = useProfile();
  const profileCompletion = getProfileCompletion(profile);
  const navBadges = { "/app/profile": `${profileCompletion.percentage}%` };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !mobileMenuRef.current) {
        return;
      }

      const focusableElements = mobileMenuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements.item(0);
      const lastElement = focusableElements.item(focusableElements.length - 1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  async function handleSignOut() {
    setSignOutError("");
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setSignOutError(error.message);
      setIsSigningOut(false);
    }
  }

  function closeMenu() {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <SkipLink />

      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="grid min-h-20 grid-cols-[auto_1fr] items-center gap-3 px-5 sm:px-8 xl:grid-cols-[1fr_auto_1fr]">
          <Link className="shrink-0 justify-self-start" to="/app">
            <Logo className="h-12 xl:h-14" />
          </Link>

          <nav aria-label={t("workspace")} className="hidden xl:block">
            <WorkspaceLinks badges={navBadges} orientation="horizontal" t={t} />
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <LanguageMenu />
            <GlobalSearch applications={applications} />
            <NotificationBell applications={applications} />
            <AccountMenu
              isSigningOut={isSigningOut}
              name={name}
              onSignOut={handleSignOut}
              planMeter={
                <SidebarPlanMeter limit={FREE_PLAN_APPLICATION_LIMIT} t={t} used={applications.length} />
              }
              session={session}
              t={t}
            />
            <button
              aria-controls="mobile-workspace-navigation"
              aria-expanded={isMenuOpen}
              aria-label={t("nav.openWorkspace")}
              className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-brand-950 shadow-sm transition hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 xl:hidden"
              onClick={() => setIsMenuOpen(true)}
              ref={menuButtonRef}
              type="button"
            >
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
        </div>

        {signOutError && (
          <div className="border-t border-line px-5 py-3 sm:px-8">
            <ErrorState compact description={signOutError} title={t("errors.signOut")} />
          </div>
        )}
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            aria-label="Close workspace navigation"
            className="absolute inset-0 bg-brand-950/45 backdrop-blur-[2px]"
            onClick={closeMenu}
            type="button"
          />
          <aside
            aria-label="Workspace navigation"
            aria-modal="true"
            className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col border-l border-line bg-surface shadow-2xl"
            id="mobile-workspace-navigation"
            ref={mobileMenuRef}
            role="dialog"
          >
            <div className="flex min-h-20 items-center justify-between border-b border-line px-5">
              <Link onClick={closeMenu} to="/app">
                <Logo />
              </Link>
              <button
                aria-label={t("nav.closeWorkspace")}
                className="grid size-11 place-items-center rounded-xl text-ink-muted transition hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
                onClick={closeMenu}
                ref={closeButtonRef}
                type="button"
              >
                <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <p className="px-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink-muted">
                {t("workspace")}
              </p>
              <WorkspaceLinks badges={navBadges} onNavigate={closeMenu} t={t} />
            </nav>

            <div className="border-t border-line p-4">
              <SidebarPlanMeter limit={FREE_PLAN_APPLICATION_LIMIT} t={t} used={applications.length} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
