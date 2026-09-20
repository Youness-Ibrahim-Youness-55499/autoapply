import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Seo } from "../components/Seo";
import { SkipLink } from "../components/SkipLink";
import { PageContainer } from "../components/layout/PageContainer";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import { useTranslation } from "../i18n";

export function AuthPage() {
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
  const { t } = useTranslation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
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
      <Seo description={t("auth.loginSeo")} noIndex path="/login" title={t("auth.loginTitle")} />
      <SkipLink />
      <header className="border-b border-line bg-surface">
        <PageContainer>
          <div className="flex min-h-18 items-center justify-between">
            <Link to="/">
              <Logo />
            </Link>
            <Link className="text-sm font-semibold text-brand-800 hover:text-brand-600" to="/signup">
              {t("auth.newHere")}
            </Link>
          </div>
        </PageContainer>
      </header>

      <main id="main-content">
        <PageContainer className="grid min-h-[calc(100vh-4.5rem)] items-center gap-12 py-16 lg:grid-cols-[1fr_0.8fr]">
          <div className="max-w-xl">
            <p className="eyebrow">{t("auth.loginEyebrow")}</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
              {t("auth.loginHeadline")}
            </h1>
            <p className="lead mt-6">{t("auth.loginSubhead")}</p>
          </div>

          <section
            aria-labelledby="login-title"
            className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8"
          >
            <h2 className="text-2xl font-semibold" id="login-title">
              {t("auth.logIn")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("auth.loginDescription")}</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                  autoComplete="current-password"
                  className="mt-2 min-h-12 w-full rounded-xl border border-line bg-canvas px-4 font-normal outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  disabled={isSubmitting}
                  minLength={8}
                  name="password"
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
              </div>
              <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
                {isSubmitting ? t("auth.loggingIn") : t("auth.logIn")}
              </Button>
            </form>
          </section>
        </PageContainer>
      </main>
    </div>
  );
}
