import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { SkipLink } from "../components/SkipLink";
import { PageContainer } from "../components/layout/PageContainer";

type AuthPageProps = {
  mode: "login" | "signup";
};

export function AuthPage({ mode }: AuthPageProps) {
  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen bg-canvas">
      <Seo
        description={
          isSignup
            ? "Create your Autoapply workspace and bring every job-search step into one organized place."
            : "Log in to Autoapply to continue organizing applications, materials, and follow-ups."
        }
        noIndex
        path={`/${mode}`}
        title={isSignup ? "Create your account" : "Log in"}
      />
      <SkipLink />
      <header className="border-b border-line bg-surface">
        <PageContainer>
          <div className="flex min-h-18 items-center justify-between">
            <Link
              className="text-lg font-bold tracking-[-0.03em] text-brand-900"
              to="/"
            >
              autoapply
            </Link>
            <Link
              className="text-sm font-semibold text-brand-800 hover:text-brand-600"
              to={isSignup ? "/login" : "/signup"}
            >
              {isSignup ? "Already have an account? Log in" : "New here? Sign up"}
            </Link>
          </div>
        </PageContainer>
      </header>

      <main id="main-content">
        <PageContainer className="grid min-h-[calc(100vh-4.5rem)] items-center gap-12 py-16 lg:grid-cols-[1fr_0.8fr]">
          <div className="max-w-xl">
            <p className="eyebrow">{isSignup ? "Create your workspace" : "Welcome back"}</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
              {isSignup
                ? "Bring your job search into focus."
                : "Continue where you left off."}
            </h1>
            <p className="lead mt-6">
              {isSignup
                ? "Start with one organized place for opportunities, tailored materials, and every next step."
                : "Open your workspace to review applications, prepare materials, and follow up with confidence."}
            </p>
          </div>

          <section
            aria-labelledby={`${mode}-title`}
            className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8"
          >
            <h2 className="text-2xl font-semibold" id={`${mode}-title`}>
              {isSignup ? "Create an account" : "Log in"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              This is the route foundation. Secure authentication will be connected
              in a later step.
            </p>

            <form className="mt-8 space-y-5" onSubmit={(event) => event.preventDefault()}>
              {isSignup && (
                <label className="block text-sm font-semibold">
                  Name
                  <input
                    autoComplete="name"
                    className="mt-2 min-h-12 w-full rounded-xl border border-line bg-canvas px-4 font-normal outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  name="name"
                  placeholder="Your name"
                  required
                  type="text"
                  />
                </label>
              )}
              <label className="block text-sm font-semibold">
                Email
                <input
                  autoComplete="email"
                  className="mt-2 min-h-12 w-full rounded-xl border border-line bg-canvas px-4 font-normal outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </label>
              <label className="block text-sm font-semibold">
                Password
                <input
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className="mt-2 min-h-12 w-full rounded-xl border border-line bg-canvas px-4 font-normal outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  name="password"
                  minLength={8}
                  placeholder="At least 8 characters"
                  required
                  type="password"
                />
              </label>
              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-900 px-6 text-sm font-semibold text-white hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
                type="submit"
              >
                {isSignup ? "Create account" : "Log in"}
              </button>
            </form>
          </section>
        </PageContainer>
      </main>
    </div>
  );
}

