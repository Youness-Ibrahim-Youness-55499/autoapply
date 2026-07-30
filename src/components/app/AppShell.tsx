import { useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";
import { SkipLink } from "../SkipLink";

type NavigationItem = {
  icon: ReactNode;
  label: string;
  to: string;
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

export function AppShell() {
  const { session } = useAuth();
  const location = useLocation();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const pageTitle = pageTitles.get(location.pathname) ?? "Overview";
  const metadataName = session?.user.user_metadata.name;
  const name =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : "Your account";
  const initial = name.charAt(0).toUpperCase();

  async function handleSignOut() {
    setSignOutError("");
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setSignOutError(error.message);
      setIsSigningOut(false);
    }
  }

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
          <ul className="mt-3 space-y-1">
            {navigationItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${isActive ? "bg-white text-brand-950 shadow-sm" : "text-white/68 hover:bg-white/8 hover:text-white"}`
                  }
                  end={item.to === "/app"}
                  to={item.to}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          {signOutError && (
            <p className="mb-3 rounded-lg bg-red-400/15 px-3 py-2 text-xs leading-relaxed text-red-100" role="alert">
              {signOutError}
            </p>
          )}
          <div className="flex items-center gap-3 rounded-xl bg-white/6 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-400 text-sm font-bold text-brand-950">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-white/48">{session?.user.email}</p>
            </div>
            <button
              aria-label="Log out"
              className="rounded-lg p-2 text-white/55 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
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
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between px-5 sm:px-8 lg:px-10">
            <div>
              <p className="text-xs font-semibold text-ink-muted">Workspace</p>
              <h1 className="mt-0.5 text-xl font-semibold tracking-[-0.025em]">{pageTitle}</h1>
            </div>
            <Link className="text-lg font-bold tracking-[-0.03em] text-brand-900 lg:hidden" to="/app">
              autoapply
            </Link>
            <div className="hidden items-center gap-2 text-sm text-ink-muted sm:flex">
              <span className="size-2 rounded-full bg-emerald-500" />
              Account connected
            </div>
          </div>
        </header>

        <main id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
