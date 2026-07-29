import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type RouteGuardProps = {
  children: ReactNode;
};

function SessionLoading() {
  return (
    <main
      aria-busy="true"
      className="grid min-h-screen place-items-center bg-canvas px-5"
    >
      <p className="text-sm font-semibold text-ink-muted">Opening your workspace...</p>
    </main>
  );
}

export function RequireAuth({ children }: RouteGuardProps) {
  const { isLoading, session } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SessionLoading />;
  }

  if (!session) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return children;
}

export function PublicOnly({ children }: RouteGuardProps) {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return <SessionLoading />;
  }

  if (session) {
    return <Navigate replace to="/app" />;
  }

  return children;
}
