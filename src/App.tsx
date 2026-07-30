import { Navigate, Route, Routes } from "react-router-dom";
import { PublicOnly, RequireAuth } from "./auth/RouteGuards";
import { AppShell } from "./components/app/AppShell";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { AuthPage } from "./pages/AuthPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { LandingPage } from "./pages/LandingPage";
import { LegalPage } from "./pages/LegalPage";
import { ProductHomePage } from "./pages/ProductHomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";

export function App() {
  return (
    <Routes>
      <Route element={<LandingPage />} path="/" />
      <Route
        element={
          <PublicOnly>
            <AuthPage mode="signup" />
          </PublicOnly>
        }
        path="/signup"
      />
      <Route
        element={
          <PublicOnly>
            <AuthPage mode="login" />
          </PublicOnly>
        }
        path="/login"
      />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />} path="/app">
          <Route element={<ProductHomePage />} index />
          <Route element={<ApplicationsPage />} path="applications" />
          <Route element={<ProfilePage />} path="profile" />
          <Route element={<DocumentsPage />} path="documents" />
          <Route element={<SettingsPage />} path="settings" />
          <Route element={<Navigate replace to="/app" />} path="*" />
        </Route>
      </Route>

      <Route element={<LegalPage kind="privacy" />} path="/privacy" />
      <Route element={<LegalPage kind="terms" />} path="/terms" />
      <Route element={<LegalPage kind="legal-notice" />} path="/legal-notice" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
