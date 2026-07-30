import { useState } from "react";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { Button } from "../components/ui/Button";
import { AddApplicationForm } from "../features/applications/AddApplicationForm";
import { ApplicationList } from "../features/applications/ApplicationList";
import { useApplications } from "../features/applications/useApplications";

export function ApplicationsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { applications, errorMessage, isLoading, refresh, retry } = useApplications();

  function handleCreated() {
    setIsFormOpen(false);
    refresh();
  }

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

        <div className="mt-7">
          <Button
            aria-controls="add-application-form"
            aria-expanded={isFormOpen}
            onClick={() => setIsFormOpen((isOpen) => !isOpen)}
          >
            {isFormOpen ? "Close form" : "Add application"}
          </Button>
        </div>

        {isFormOpen && (
          <AddApplicationForm
            onCancel={() => setIsFormOpen(false)}
            onCreated={handleCreated}
          />
        )}

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
              description="There are no application records in your workspace yet. Use Add application to save your first opportunity."
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
