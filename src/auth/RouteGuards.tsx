import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "../components/states/LoadingState";
import { ProfileProvider, useProfileContext } from "../features/profile/ProfileProvider";
import { useAuth } from "./AuthProvider";

type RouteGuardProps = {
  children?: ReactNode;
};

function SessionLoading() {
  return (
    <LoadingState
      description="Checking your secure session and preparing your workspace."
      fullScreen
      title="Opening your workspace"
    />
  );
}

export function RequireAuth({ children }: RouteGuardProps) {
  const { isLoading, session } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SessionLoading />;
  }

  if (!session) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate replace state={{ from }} to="/login" />;
  }

  return <ProfileProvider>{children ?? <Outlet />}</ProfileProvider>;
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

export function RequireOnboarding({ children }: RouteGuardProps) {
  const { isLoading, profile } = useProfileContext();

  if (isLoading) {
    return <SessionLoading />;
  }

  if (!profile.onboardingCompleted) {
    return <Navigate replace to="/onboarding" />;
  }

  return children ?? <Outlet />;
}

export function OnboardingOnly({ children }: RouteGuardProps) {
  const { isLoading, profile } = useProfileContext();

  if (isLoading) {
    return <SessionLoading />;
  }

  if (profile.onboardingCompleted) {
    return <Navigate replace to="/app" />;
  }

  return children;
}
