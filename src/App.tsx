import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { LandingPage } from "./pages/LandingPage";

export function App() {
  return (
    <Routes>
      <Route element={<LandingPage />} path="/" />
      <Route element={<AuthPage mode="signup" />} path="/signup" />
      <Route element={<AuthPage mode="login" />} path="/login" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}


