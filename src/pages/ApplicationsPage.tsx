import { useState } from "react";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { Button } from "../components/ui/Button";
import { ApplicationForm } from "../features/applications/ApplicationForm";
import { ApplicationList } from "../features/applications/ApplicationList";
import { DeleteApplicationDialog } from "../features/applications/DeleteApplicationDialog";
import type { Application } from "../features/applications/types";
import { useApplications } from "../features/applications/useApplications";

export function ApplicationsPage() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);
  const [deletingApplication, setDeletingApplication] =
    useState<Application | null>(null);
  const {
    applications,
    errorMessage,
    isLoading,
    refresh,
    removeLocally,
    retry,
    updateStatusLocally,
  } = useApplications();
  const isFormOpen = isCreateFormOpen || Boolean(editingApplication);

  function closeForm() {
    setIsCreateFormOpen(false);
    setEditingApplication(null);
  }

  function handleSaved() {
    closeForm();
    refresh();
  }

  function handleDeleted(id: string) {
    removeLocally(id);

    if (editingApplication?.id === id) {
      closeForm();
    }

    setDeletingApplication(null);
  }

  function toggleCreateForm() {
    if (isFormOpen) {
      closeForm();
      return;
    }

    setIsCreateFormOpen(true);
  }

  function openEditForm(application: Application) {
    setIsCreateFormOpen(false);
    setEditingApplication(application);

    requestAnimationFrame(() => {
      document.getElementById("application-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
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
            aria-controls="application-form"
            aria-expanded={isFormOpen}
            onClick={toggleCreateForm}
          >
            {isFormOpen ? "Close form" : "Add application"}
          </Button>
        </div>

        {isFormOpen && (
          <ApplicationForm
            application={editingApplication ?? undefined}
            key={editingApplication?.id ?? "create"}
            onCancel={closeForm}
            onSaved={handleSaved}
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
            <ApplicationList
              applications={applications}
              onDelete={setDeletingApplication}
              onEdit={openEditForm}
              onStatusUpdated={updateStatusLocally}
            />
          )}
        </div>
      </PageContainer>

      {deletingApplication && (
        <DeleteApplicationDialog
          application={deletingApplication}
          onCancel={() => setDeletingApplication(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
