import { useAuth } from "../auth/AuthProvider";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";

export function SettingsPage() {
  const { session } = useAuth();

  return (
    <>
      <Seo
        description="Review the current state of your Autoapply account settings."
        noIndex
        path="/app/settings"
        title="Settings"
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <ProductPageHeader
          description="Account and workspace preferences will be added only when they control real product behavior."
          title="Settings"
        />

        <section className="mt-10 max-w-3xl overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <div className="border-b border-line p-6 sm:p-8">
            <p className="eyebrow">Account</p>
            <h3 className="mt-3 text-xl font-semibold">Sign-in email</h3>
            <p className="mt-2 break-all text-sm text-ink-muted">{session?.user.email}</p>
          </div>
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold">No editable preferences yet</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
              Notification, privacy, and job-search preferences are not active in the product yet, so this page does not show controls that would have no effect.
            </p>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
