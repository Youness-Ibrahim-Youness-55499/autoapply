import { useMemo, useState } from "react";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { Button } from "../components/ui/Button";
import {
  ApplicationFilters,
  type ApplicationStatusFilter,
} from "../features/applications/ApplicationFilters";
import { ApplicationForm } from "../features/applications/ApplicationForm";
import { ApplicationList } from "../features/applications/ApplicationList";
import { ApplicationWorkflowPanel } from "../features/applications/ApplicationWorkflowPanel";
import { DeleteApplicationDialog } from "../features/applications/DeleteApplicationDialog";
import type { Application } from "../features/applications/types";
import { useApplications } from "../features/applications/useApplications";

export function ApplicationsPage() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);
  const [deletingApplication, setDeletingApplication] =
    useState<Application | null>(null);
  const [workflowApplication, setWorkflowApplication] =
    useState<Application | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ApplicationStatusFilter>("all");
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

  const visibleApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return applications.filter((application) => {
      const matchesStatus =
        statusFilter === "all" || application.status === statusFilter;
      const searchableText = [
        application.job_title,
        application.company_name,
        application.location ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [applications, query, statusFilter]);

  function closeForm() {
    setIsCreateFormOpen(false);
    setEditingApplication(null);
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
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
    if (workflowApplication?.id === id) {
      setWorkflowApplication(null);
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

  function openWorkflow(application: Application) {
    setWorkflowApplication(application);
    requestAnimationFrame(() => {
      document.getElementById("application-workflow")?.scrollIntoView({
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
            <>
              <ApplicationFilters
                onQueryChange={setQuery}
                onReset={clearFilters}
                onStatusChange={setStatusFilter}
                query={query}
                status={statusFilter}
              />

              {visibleApplications.length > 0 ? (
                <ApplicationList
                  applications={visibleApplications}
                  onDelete={setDeletingApplication}
                  onEdit={openEditForm}
                  onStatusUpdated={updateStatusLocally}
                  onWorkflow={openWorkflow}
                />
              ) : (
                <EmptyState
                  action={
                    <Button onClick={clearFilters} variant="secondary">
                      Clear filters
                    </Button>
                  }
                  description="Try a different role, company, location, or application status."
                  title="No matching applications"
                />
              )}
            </>
          )}

          {workflowApplication && (
            <ApplicationWorkflowPanel
              application={
                applications.find((item) => item.id === workflowApplication.id) ??
                workflowApplication
              }
              key={workflowApplication.id}
              onClose={() => setWorkflowApplication(null)}
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

