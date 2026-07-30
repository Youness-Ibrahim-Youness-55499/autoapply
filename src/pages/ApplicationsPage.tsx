import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { Button } from "../components/ui/Button";
import { ApplicationList } from "../features/applications/ApplicationList";
import { useApplications } from "../features/applications/useApplications";

export function ApplicationsPage() {
  const { applications, errorMessage, isLoading, retry } = useApplications();

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
          description="Review the opportunities saved in your private workspace and see where each application stands."
          title="Applications"
        />

        <div className="mt-10 max-w-6xl">
          {isLoading && (
            <LoadingState
              description="Loading your private application records."
              title="Loading applications"
            />
          )}

          {!isLoading && errorMessage && (
            <ErrorState
              action={<Button onClick={retry}>Try again</Button>}
              description={errorMessage}
              title="Applications could not be loaded"
            />
          )}

          {!isLoading && !errorMessage && applications.length === 0 && (
            <EmptyState
              description="There are no application records in your workspace yet. Adding applications will be introduced in the next focused step."
              title="No applications yet"
            />
          )}

          {!isLoading && !errorMessage && applications.length > 0 && (
            <ApplicationList applications={applications} />
          )}
        </div>
      </PageContainer>
    </>
  );
}
