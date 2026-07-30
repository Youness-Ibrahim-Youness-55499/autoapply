import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";

export function DocumentsPage() {
  return (
    <>
      <Seo
        description="Manage the source documents used for your applications."
        noIndex
        path="/app/documents"
        title="Documents"
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <ProductPageHeader
          description="Documents will hold the source material you approve for future resume and cover-letter tailoring."
          title="Documents"
        />
        <div className="mt-10 max-w-4xl">
          <EmptyState
            description="No files are stored or processed yet. Private Supabase Storage and secure CV upload will be introduced in Phase 4."
            title="No documents uploaded"
          />
        </div>
      </PageContainer>
    </>
  );
}
