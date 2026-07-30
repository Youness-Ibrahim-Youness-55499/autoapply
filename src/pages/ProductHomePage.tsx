import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";

const startingPoints = [
  {
    description: "The route is ready. Reading and managing your private application records begins in Phase 2.",
    label: "Applications",
    to: "/app/applications",
  },
  {
    description: "Review the account information available now and see what candidate details are still missing.",
    label: "Profile",
    to: "/app/profile",
  },
  {
    description: "See the current document-storage state before private uploads are introduced.",
    label: "Documents",
    to: "/app/documents",
  },
];

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
        title="Overview"
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <ProductPageHeader
          description="The secure workspace foundation is ready. Product features will now be connected one at a time, beginning with the application tracker."
          eyebrow="Private workspace"
          title={`Welcome, ${name}.`}
        />

        <section className="mt-10 max-w-5xl">
          <div className="flex items-center gap-3 rounded-card border border-brand-200 bg-brand-50 px-5 py-4 text-brand-950">
            <span className="size-2.5 shrink-0 rounded-full bg-emerald-500" />
            <div>
              <h3 className="text-sm font-semibold">Account connected</h3>
              <p className="mt-0.5 break-all text-xs text-brand-800">
                Signed in as {session?.user.email}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {startingPoints.map((item) => (
              <Link
                className="group rounded-card border border-line bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200"
                key={item.to}
                to={item.to}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold">{item.label}</h3>
                  <span aria-hidden="true" className="text-brand-600 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </PageContainer>
    </>
  );
}
