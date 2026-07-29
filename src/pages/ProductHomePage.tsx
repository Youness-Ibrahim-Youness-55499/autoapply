import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { supabase } from "../lib/supabase";

export function ProductHomePage() {
  const { session } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const metadataName = session?.user.user_metadata.name;
  const name =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : "there";

  async function handleSignOut() {
    setErrorMessage("");
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage(error.message);
      setIsSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Seo
        description="Your private Autoapply workspace."
        noIndex
        path="/app"
        title="Your workspace"
      />
      <header className="border-b border-line bg-surface">
        <PageContainer className="flex min-h-18 items-center justify-between">
          <Link
            className="text-lg font-bold tracking-[-0.03em] text-brand-900"
            to="/"
          >
            autoapply
          </Link>
          <Button
            disabled={isSigningOut}
            onClick={handleSignOut}
            size="sm"
            variant="secondary"
          >
            {isSigningOut ? "Logging out..." : "Log out"}
          </Button>
        </PageContainer>
      </header>

      <main>
        <PageContainer className="py-16 sm:py-24" size="narrow">
          <p className="eyebrow">Private workspace</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            Welcome, {name}.
          </h1>
          <p className="lead mt-5 max-w-2xl">
            Your account is connected. The application tracker will be built
            here in the next focused step.
          </p>

          <section className="mt-10 rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
            <p className="text-sm font-semibold text-ink-muted">Signed in as</p>
            <p className="mt-2 break-all text-lg font-semibold">
              {session?.user.email}
            </p>
            {errorMessage && (
              <p
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {errorMessage}
              </p>
            )}
          </section>
        </PageContainer>
      </main>
    </div>
  );
}
