import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Seo } from "../components/Seo";
import { SkipLink } from "../components/SkipLink";
import { PageContainer } from "../components/layout/PageContainer";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";
import { OnboardingSteps } from "../components/onboarding/OnboardingSteps";
import { supabase } from "../lib/supabase";
import { useTranslation } from "../i18n";

export function SignupPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { t } = useTranslation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();

    try {
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
        navigate("/onboarding", { replace: true });
        return;
      }

      setSuccessMessage(t("auth.signupSuccess"));
    } catch {
      setErrorMessage(t("auth.error.generic"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Seo
        description={t("auth.signupSeo")}
        noIndex
        path="/signup"
        title={t("auth.signupTitle")}
      />
      <SkipLink />
      <header className="border-b border-line bg-surface">
        <PageContainer>
          <div className="flex min-h-18 items-center justify-between">
            <Link to="/">
              <Logo />
            </Link>
            <Link className="text-sm font-semibold text-brand-800 hover:text-brand-600" to="/login">
              {t("auth.alreadyHaveAccount")}
            </Link>
          </div>
        </PageContainer>
      </header>

      <main id="main-content">
        <PageContainer className="py-12 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <p className="eyebrow">{t("auth.signupEyebrow")}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              {t("auth.signupHeadline")}
            </h1>
            <p className="lead mt-4">{t("auth.signupSubhead")}</p>
          </div>

          <div className="mx-auto mt-10 max-w-xl">
            <OnboardingSteps currentStep={1} />
          </div>

          <section
            aria-labelledby="signup-title"
            className="mx-auto mt-8 max-w-xl rounded-card border border-line bg-surface p-6 shadow-card sm:p-8"
          >
            <h2 className="text-2xl font-semibold" id="signup-title">
              {t("auth.createAccount")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {t("auth.signupDescription")}
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                  autoComplete="new-password"
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
                {successMessage && (
                  <p className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
                    {successMessage}
                  </p>
                )}
              </div>
              <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
                {isSubmitting ? t("auth.creatingAccount") : t("onboarding.continue")}
              </Button>
            </form>
          </section>
        </PageContainer>
      </main>
    </div>
  );
}
