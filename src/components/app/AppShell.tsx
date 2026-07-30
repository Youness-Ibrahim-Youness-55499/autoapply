import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";
import { SkipLink } from "../SkipLink";
import { ErrorState } from "../states/ErrorState";

type NavigationItem = {
  icon: ReactNode;
  label: string;
  to: string;
};

type WorkspaceLinksProps = {
  onNavigate?: () => void;
  tone: "dark" | "light";
};

function NavigationIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

const navigationItems: NavigationItem[] = [
  {
    label: "Overview",
    to: "/app",
    icon: (
      <NavigationIcon>
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke="currentColor" strokeWidth="1.7" />
      </NavigationIcon>
    ),
  },
  {
    label: "Applications",
    to: "/app/applications",
    icon: (
      <NavigationIcon>
        <path d="M8 6V4.8A1.8 1.8 0 0 1 9.8 3h4.4A1.8 1.8 0 0 1 16 4.8V6m4 4H4m2-4h12a2 2 0 0 1 2 2v10.5A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </NavigationIcon>
    ),
  },
  {
    label: "Profile",
    to: "/app/profile",
    icon: (
      <NavigationIcon>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </NavigationIcon>
    ),
  },
  {
    label: "Documents",
    to: "/app/documents",
    icon: (
      <NavigationIcon>
        <path d="M7 3h7l4 4v14H7V3Zm7 0v5h4M10 13h5m-5 4h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </NavigationIcon>
    ),
  },
  {
    label: "Settings",
    to: "/app/settings",
    icon: (
      <NavigationIcon>
        <path d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Zm7-3.25 2-1-2-3-2.1.7A7.8 7.8 0 0 0 15 7.6L14.5 5h-5L9 7.6a7.8 7.8 0 0 0-1.9 1.1L5 8l-2 3 2 1-2 1 2 3 2.1-.7A7.8 7.8 0 0 0 9 16.4l.5 2.6h5l.5-2.6a7.8 7.8 0 0 0 1.9-1.1l2.1.7 2-3-2-1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </NavigationIcon>
    ),
  },
];

const pageTitles = new Map(navigationItems.map((item) => [item.to, item.label]));

function WorkspaceLinks({ onNavigate, tone }: WorkspaceLinksProps) {
  return (
    <ul className="mt-3 space-y-1">
      {navigationItems.map((item) => (
        <li key={item.to}>
          <NavLink
            className={({ isActive }) => {
              if (tone === "dark") {
                return `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${isActive ? "bg-white text-brand-950 shadow-sm" : "text-white/68 hover:bg-white/8 hover:text-white"}`;
              }

              return `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${isActive ? "bg-brand-50 text-brand-900" : "text-ink-muted hover:bg-canvas hover:text-ink"}`;
            }}
            end={item.to === "/app"}
            onClick={onNavigate}
            to={item.to}
          >
            {item.icon}
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function AppShell() {
  const { session } = useAuth();
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const pageTitle = pageTitles.get(location.pathname) ?? "Overview";
  const metadataName = session?.user.user_metadata.name;
  const name =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : "Your account";
  const initial = name.charAt(0).toUpperCase();

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

  const accountCard = (mobile = false) => (
    <div className={`flex items-center gap-3 rounded-xl p-3 ${mobile ? "border border-line bg-canvas" : "bg-white/6"}`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-400 text-sm font-bold text-brand-950">
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className={`truncate text-xs ${mobile ? "text-ink-muted" : "text-white/48"}`}>
          {session?.user.email}
        </p>
      </div>
      <button
        aria-label="Log out"
        className={`rounded-lg p-2 transition disabled:opacity-50 ${mobile ? "text-ink-muted hover:bg-surface hover:text-ink" : "text-white/55 hover:bg-white/10 hover:text-white"}`}
        disabled={isSigningOut}
        onClick={handleSignOut}
        title="Log out"
        type="button"
      >
        <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
          <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m5-4 3-3-3-3m3 3H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <SkipLink />
      <aside className="hidden min-h-screen border-r border-line bg-brand-950 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex min-h-20 items-center border-b border-white/10 px-7">
          <Link className="text-xl font-bold tracking-[-0.035em]" to="/app">
            autoapply
          </Link>
        </div>

        <nav aria-label="Workspace" className="flex-1 px-4 py-7">
          <p className="px-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/45">
            Workspace
          </p>
          <WorkspaceLinks tone="dark" />
        </nav>

        <div className="border-t border-white/10 p-4">
          {signOutError && (
            <div className="mb-3">
              <ErrorState
                compact
                description={signOutError}
                title="Could not log out"
              />
            </div>
          )}
          {accountCard()}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-muted">Workspace</p>
              <h1 className="mt-0.5 truncate text-xl font-semibold tracking-[-0.025em]">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-sm text-ink-muted sm:flex">
                <span className="size-2 rounded-full bg-emerald-500" />
                Account connected
              </div>
              <button
                aria-controls="mobile-workspace-navigation"
                aria-expanded={isMenuOpen}
                aria-label="Open workspace navigation"
                className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-brand-950 shadow-sm transition hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 lg:hidden"
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
        </header>

        <main id="main-content">
          <Outlet />
        </main>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
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
              <Link className="text-xl font-bold tracking-[-0.035em] text-brand-900" onClick={closeMenu} to="/app">
                autoapply
              </Link>
              <button
                aria-label="Close workspace navigation"
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
                Workspace
              </p>
              <WorkspaceLinks onNavigate={closeMenu} tone="light" />
            </nav>

            <div className="border-t border-line p-4">
              {signOutError && (
                <div className="mb-3">
                  <ErrorState
                    compact
                    description={signOutError}
                    title="Could not log out"
                  />
                </div>
              )}
              {accountCard(true)}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
