import { useAuth } from "../auth/AuthProvider";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";

export function ProductHomePage() {
  const { session } = useAuth();
  const metadataName = session?.user.user_metadata.name;
  const name =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : "there";

  return (
    <>
      <Seo
        description="Your private Autoapply workspace."
        noIndex
        path="/app"
        title="Your workspace"
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <p className="eyebrow">Private workspace</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Welcome, {name}.
        </h2>
        <p className="lead mt-5 max-w-2xl">
          Your account is connected. The application tracker will be built here
          in the next focused step.
        </p>

        <section className="mt-10 max-w-3xl rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
          <p className="text-sm font-semibold text-ink-muted">Signed in as</p>
          <p className="mt-2 break-all text-lg font-semibold">
            {session?.user.email}
          </p>
        </section>
      </PageContainer>
    </>
  );
}
