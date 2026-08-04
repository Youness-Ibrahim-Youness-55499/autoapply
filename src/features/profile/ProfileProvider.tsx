import { createContext, useContext, type ReactNode } from "react";
import { useProfile } from "./useProfile";

type ProfileContextValue = ReturnType<typeof useProfile>;

const ProfileContext = createContext<ProfileContextValue | null>(null);

// Single shared profile fetch/save cycle for everything that needs it
// while signed in: the onboarding route guards, the onboarding wizard
// itself, and ProfilePage. Without this each would call useProfile()
// independently and re-fetch, which would leave the guard's view of
// onboardingCompleted stale right after the wizard's last step flips it
// and navigates to /app.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const value = useProfile();
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}
