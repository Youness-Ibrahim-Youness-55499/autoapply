import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PublicOnly, RequireAuth } from "./auth/RouteGuards";
import { AppShell } from "./components/app/AppShell";
import { AuthPage } from "./pages/AuthPage";
import { LandingPage } from "./pages/LandingPage";
import { LegalPage } from "./pages/LegalPage";
import { SignupPage } from "./pages/SignupPage";

// Signed-in screens load on demand so the landing and login pages stay small.
const ApplicationsPage = lazy(() => import("./pages/ApplicationsPage").then((m) => ({ default: m.ApplicationsPage })));
const AutopilotPage = lazy(() => import("./pages/AutopilotPage").then((m) => ({ default: m.AutopilotPage })));
const CvOptimizerPage = lazy(() => import("./pages/CvOptimizerPage").then((m) => ({ default: m.CvOptimizerPage })));
const HelpPage = lazy(() => import("./pages/HelpPage").then((m) => ({ default: m.HelpPage })));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage").then((m) => ({ default: m.JobDetailPage })));
const JobsPage = lazy(() => import("./pages/JobsPage").then((m) => ({ default: m.JobsPage })));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage").then((m) => ({ default: m.OnboardingPage })));
const ProductHomePage = lazy(() => import("./pages/ProductHomePage").then((m) => ({ default: m.ProductHomePage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const TemplatesPage = lazy(() => import("./features/templates/TemplatesPage").then((m) => ({ default: m.TemplatesPage })));

export function App() {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-screen bg-canvas" />}>
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route
          element={
            <PublicOnly>
              <SignupPage />
            </PublicOnly>
          }
          path="/signup"
        />
        <Route
          element={
            <PublicOnly>
              <AuthPage />
            </PublicOnly>
          }
          path="/login"
        />

        <Route element={<RequireAuth />}>
          <Route element={<OnboardingPage />} path="/onboarding" />
          <Route element={<AppShell />} path="/app">
            <Route element={<ProductHomePage />} index />
            <Route element={<JobsPage />} path="jobs" />
            <Route element={<JobDetailPage />} path="jobs/:id" />
            <Route element={<ApplicationsPage />} path="applications" />
            <Route element={<AutopilotPage />} path="autopilot" />
            <Route element={<TemplatesPage />} path="templates" />
            <Route element={<ProfilePage />} path="profile" />
            {/* Documents merged into the Profile page; keep old links working. */}
            <Route element={<Navigate replace to="/app/profile#documents" />} path="documents" />
            <Route element={<SettingsPage />} path="settings" />
            <Route element={<HelpPage />} path="help" />
            <Route element={<CvOptimizerPage />} path="cv-optimizer" />
            <Route element={<Navigate replace to="/app" />} path="*" />
          </Route>
        </Route>

        <Route element={<LegalPage kind="privacy" />} path="/privacy" />
        <Route element={<LegalPage kind="terms" />} path="/terms" />
        <Route element={<LegalPage kind="legal-notice" />} path="/legal-notice" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </Suspense>
  );
}
