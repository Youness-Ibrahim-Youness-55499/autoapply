import { Navigate, Route, Routes } from "react-router-dom";
import { PublicOnly, RequireAuth } from "./auth/RouteGuards";
import { AppShell } from "./components/app/AppShell";
import { AuthPage } from "./pages/AuthPage";
import { LandingPage } from "./pages/LandingPage";
import { LegalPage } from "./pages/LegalPage";
import { ProductHomePage } from "./pages/ProductHomePage";
import { ProductRoutePlaceholderPage } from "./pages/ProductRoutePlaceholderPage";

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
          <Route
            element={
              <ProductRoutePlaceholderPage
                description="Review and organize the opportunities connected to your job search."
                title="Applications"
              />
            }
            path="applications"
          />
          <Route
            element={
              <ProductRoutePlaceholderPage
                description="Keep the candidate information that will support future matching and tailoring."
                title="Profile"
              />
            }
            path="profile"
          />
          <Route
            element={
              <ProductRoutePlaceholderPage
                description="Manage the source documents used throughout your application workflow."
                title="Documents"
              />
            }
            path="documents"
          />
          <Route
            element={
              <ProductRoutePlaceholderPage
                description="Manage account and workspace preferences."
                title="Settings"
              />
            }
            path="settings"
          />
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
