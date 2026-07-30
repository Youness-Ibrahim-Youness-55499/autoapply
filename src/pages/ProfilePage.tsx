import { useAuth } from "../auth/AuthProvider";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";

export function ProfilePage() {
  const { session } = useAuth();
  const metadataName = session?.user.user_metadata.name;
  const name =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : "Not provided";

  return (
    <>
      <Seo
        description="Review the candidate information connected to your Autoapply account."
        noIndex
        path="/app/profile"
        title="Profile"
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <ProductPageHeader
          description="Your profile will become the trusted source for matching roles and preparing accurate application materials."
          title="Profile"
        />

        <div className="mt-10 grid max-w-5xl gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
            <p className="eyebrow">Account details</p>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Name</dt>
                <dd className="mt-1 font-semibold">{name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Email</dt>
                <dd className="mt-1 break-all font-semibold">{session?.user.email}</dd>
              </div>
            </dl>
          </section>

          <EmptyState
            description="Desired roles, skills, experience, education, and work preferences are not collected yet. Profile onboarding will add them in Phase 3."
            title="Candidate profile not completed"
          />
        </div>
      </PageContainer>
    </>
  );
}
