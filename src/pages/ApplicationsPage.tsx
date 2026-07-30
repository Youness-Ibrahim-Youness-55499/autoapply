import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";

export function ApplicationsPage() {
  return (
    <>
      <Seo
        description="Organize and review your job applications."
        noIndex
        path="/app/applications"
        title="Applications"
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <ProductPageHeader
          description="This will become the reliable record of every opportunity and its current status."
          title="Applications"
        />
        <div className="mt-10 max-w-4xl">
          <EmptyState
            description="The tracker is not reading application records yet. Connecting this page to your private Supabase data is the first task in Phase 2."
            title="No applications to show yet"
          />
        </div>
      </PageContainer>
    </>
  );
}
