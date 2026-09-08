import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Seo } from "../components/Seo";
import { SkipLink } from "../components/SkipLink";
import { BrandLogo } from "../components/BrandLogo";
import { PageContainer } from "../components/layout/PageContainer";
import { supabase } from "../lib/supabase";
import { useTranslation } from "../i18n";

type AuthPageProps = {
  mode: "login" | "signup";
};

export function AuthPage({ mode }: AuthPageProps) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof location.state.from === "string" &&
    location.state.from.startsWith("/app")
      ? location.state.from
      : "/app";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { t } = useTranslation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: new URL(
              "app",
              new URL(import.meta.env.BASE_URL, window.location.origin),
            ).href,
          },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          navigate("/app", { replace: true });
          return;
        }

        setSuccessMessage(t("auth.signupSuccess"));
        form.reset();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      navigate(requestedPath, { replace: true });
    } catch {
      setErrorMessage(t("auth.error.generic"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Seo
        description={
          isSignup
            ? t("auth.signupSeo")
            : t("auth.loginSeo")
        }
        noIndex
        path={`/${mode}`}
        title={isSignup ? t("auth.signupTitle") : t("auth.loginTitle")}
      />
      <SkipLink />
      <header className="border-b border-line bg-surface">
        <PageContainer>
          <div className="flex min-h-18 items-center justify-between">
            <Link
              className="text-lg font-bold text-brand-900"
              to="/"
            >
              <BrandLogo />
            </Link>
            <Link
              className="text-sm font-semibold text-brand-800 hover:text-brand-600"
              to={isSignup ? "/login" : "/signup"}
            >
              {isSignup ? t("auth.alreadyHaveAccount") : t("auth.newHere")}
            </Link>
          </div>
        </PageContainer>
      </header>

      <main id="main-content">
        <PageContainer className="grid min-h-[calc(100vh-4.5rem)] items-center gap-12 py-16 lg:grid-cols-[1fr_0.8fr]">
          <div className="max-w-xl">
            <p className="eyebrow">{isSignup ? t("auth.signupEyebrow") : t("auth.loginEyebrow")}</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
              {isSignup
                ? t("auth.signupHeadline")
                : t("auth.loginHeadline")}
            </h1>
            <p className="lead mt-6">
              {isSignup
                ? t("auth.signupSubhead")
                : t("auth.loginSubhead")}
            </p>
          </div>

          <section
            aria-labelledby={`${mode}-title`}
            className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8"
          >
            <h2 className="text-2xl font-semibold" id={`${mode}-title`}>
              {isSignup ? t("auth.createAccount") : t("auth.logIn")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {isSignup
                ? t("auth.signupDescription")
                : t("auth.loginDescription")}
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {isSignup && (
                <label className="block text-sm font-semibold">
                  {t("auth.nameLabel")}
                  <input
                    autoComplete="name"
                    className="mt-2 min-h-12 w-full rounded-xl border border-line bg-canvas px-4 font-normal outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    disabled={isSubmitting}
                    name="name"
                    placeholder={t("auth.namePlaceholder")}
                    required
                    type="text"
                  />
                </label>
              )}
              <label className="block text-sm font-semibold">
                {t("auth.emailLabel")}
                <input
                  autoComplete="email"
                  className="mt-2 min-h-12 w-full rounded-xl border border-line bg-canvas px-4 font-normal outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  disabled={isSubmitting}
                  name="email"
                  placeholder={t("auth.emailPlaceholder")}
                  required
                  type="email"
                />
              </label>
              <label className="block text-sm font-semibold">
                {t("auth.passwordLabel")}
                <input
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className="mt-2 min-h-12 w-full rounded-xl border border-line bg-canvas px-4 font-normal outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  disabled={isSubmitting}
                  name="password"
                  minLength={8}
                  placeholder={t("auth.passwordPlaceholder")}
                  required
                  type="password"
                />
              </label>
              <div aria-live="polite">
                {errorMessage && (
                  <p
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    role="alert"
                  >
                    {errorMessage}
                  </p>
                )}
                {successMessage && (
                  <p className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
                    {successMessage}
                  </p>
                )}
              </div>
              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-900 px-6 text-sm font-semibold text-white hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? isSignup
                    ? t("auth.creatingAccount")
                    : t("auth.loggingIn")
                  : isSignup
                    ? t("auth.createAccount")
                    : t("auth.logIn")}
              </button>
            </form>
          </section>
        </PageContainer>
      </main>
    </div>
  );
}

