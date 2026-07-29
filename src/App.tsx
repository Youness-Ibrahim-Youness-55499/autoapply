import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { LandingPage } from "./pages/LandingPage";
import { LegalPage } from "./pages/LegalPage";

export function App() {
  return (
    <Routes>
      <Route element={<LandingPage />} path="/" />
      <Route element={<AuthPage mode="signup" />} path="/signup" />
      <Route element={<AuthPage mode="login" />} path="/login" />
      <Route element={<LegalPage kind="privacy" />} path="/privacy" />
      <Route element={<LegalPage kind="terms" />} path="/terms" />
      <Route element={<LegalPage kind="legal-notice" />} path="/legal-notice" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}


