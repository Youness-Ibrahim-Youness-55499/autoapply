import { Navigate, Route, Routes } from "react-router-dom";
import { PublicOnly, RequireAuth } from "./auth/RouteGuards";
import { AuthPage } from "./pages/AuthPage";
import { LandingPage } from "./pages/LandingPage";
import { LegalPage } from "./pages/LegalPage";
import { ProductHomePage } from "./pages/ProductHomePage";

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
      <Route
        element={
          <RequireAuth>
            <ProductHomePage />
          </RequireAuth>
        }
        path="/app"
      />
      <Route element={<LegalPage kind="privacy" />} path="/privacy" />
      <Route element={<LegalPage kind="terms" />} path="/terms" />
      <Route element={<LegalPage kind="legal-notice" />} path="/legal-notice" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
