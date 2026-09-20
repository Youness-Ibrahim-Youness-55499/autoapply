import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { StatTile } from "../components/app/StatTile";
import { ForwardIcon, PeopleIcon, SuccessIcon, WorkIcon } from "../components/icons/BrandIcons";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { Button } from "../components/ui/Button";
import { ApplicationFilters } from "../features/applications/ApplicationFilters";
import { ApplicationForm } from "../features/applications/ApplicationForm";
import { ApplicationKanban } from "../features/applications/ApplicationKanban";
import { ApplicationWorkflowPanel } from "../features/applications/ApplicationWorkflowPanel";
import { recentCounts } from "../features/applications/activityStats";
import { getApplicationStats } from "../features/applications/applicationStats";
import { ApplicationsInsights } from "../features/applications/ApplicationsInsights";
import { useWorkspaceEvents } from "../features/applications/useWorkspaceEvents";
import { DeleteApplicationDialog } from "../features/applications/DeleteApplicationDialog";
import type { Application } from "../features/applications/types";
import { useApplications } from "../features/applications/useApplications";
import { useTranslation } from "../i18n";

export function ApplicationsPage() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);
  const [deletingApplication, setDeletingApplication] =
    useState<Application | null>(null);
  const [workflowApplication, setWorkflowApplication] =
    useState<Application | null>(null);
  const [query, setQuery] = useState("");
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

  const { activity, events } = useWorkspaceEvents();
  const stats = useMemo(() => getApplicationStats(applications), [applications]);
  const recent = useMemo(() => recentCounts(applications, activity, 7), [applications, activity]);

  const visibleApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (normalizedQuery.length === 0) {
      return applications;
    }

    return applications.filter((application) => {
      const searchableText = [
        application.job_title,
        application.company_name,
        application.location ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [applications, query]);

  function closeForm() {
    setIsCreateFormOpen(false);
    setEditingApplication(null);
  }

  function clearFilters() {
    setQuery("");
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

  const location = useLocation();
  const { t } = useTranslation();

  function weekDelta(count: number) {
    return count > 0 ? t("dashboard.deltaThisWeek", { count }) : undefined;
  }

  useEffect(() => {
    // If the URL contains a hash with an application id, open its edit form.
    const hash = location.hash?.replace("#", "");
    if (!hash) return;
    const target = applications.find((a) => a.id === hash);
    if (target) {
      openEditForm(target);
    }
  }, [location.hash, applications]);

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
        description={t("seo.applications.description")}
        noIndex
        path="/app/applications"
        title={t("applications.title")}
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <ProductPageHeader
            description={t("applications.description")}
            title={t("applications.title")}
          />

          <div className="soft-card w-full max-w-md rounded-card border border-line px-6 py-6 sm:w-auto">
            <h2 className="text-xl font-bold leading-tight">
              {t("applications.promoLine1")}
              <br />
              {t("applications.promoLine2")}{" "}
              <span className="text-brand-700">{t("applications.promoLine3")}</span>
            </h2>
          </div>
        </div>

        <div className="mt-7">
          <Button
            aria-controls="application-form"
            aria-expanded={isFormOpen}
            onClick={toggleCreateForm}
          >
            {isFormOpen ? t("applications.closeForm") : t("applications.addApplication")}
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

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile delta={weekDelta(recent.applications)} icon={<WorkIcon />} label={t("dashboard.statTotal")} value={stats.total} />
          <StatTile delta={weekDelta(recent.interviews)} icon={<PeopleIcon />} label={t("dashboard.statInterviews")} value={stats.interviews} />
          <StatTile delta={weekDelta(recent.offers)} icon={<SuccessIcon />} label={t("dashboard.statOffers")} value={stats.offers} />
          <StatTile
            icon={<ForwardIcon />}
            label={t("dashboard.statResponseRate")}
            value={`${stats.responseRate}%`}
          />
        </div>

        <div className="mt-8">
          {isLoading && (
            <LoadingState
              description={t("loading.applicationsDescription")}
              title={t("loading.applications")}
            />
          )}

          {!isLoading && errorMessage && (
            <ErrorState
              action={<Button onClick={retry}>{t("tryAgain")}</Button>}
              description={errorMessage}
              title={t("errors.applicationsLoad")}
            />
          )}

          {!isLoading && !errorMessage && applications.length === 0 && (
            <EmptyState
              description={t("applications.noApplicationsDescription")}
              title={t("table.noApplications")}
            />
          )}

          {!isLoading && !errorMessage && applications.length > 0 && (
            <>
              <ApplicationFilters onQueryChange={setQuery} onReset={clearFilters} query={query} />

              {visibleApplications.length > 0 ? (
                <ApplicationKanban
                  applications={visibleApplications}
                  events={events}
                  onAdd={toggleCreateForm}
                  onDelete={setDeletingApplication}
                  onEdit={openEditForm}
                  onStatusUpdated={updateStatusLocally}
                  onWorkflow={openWorkflow}
                />
              ) : (
                <EmptyState
                  action={
                    <Button onClick={clearFilters} variant="secondary">
                      {t("filters.clear")}
                    </Button>
                  }
                  description={t("applications.noMatchingDescription")}
                  title={t("table.noMatching")}
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

        {!isLoading && !errorMessage && (
          <ApplicationsInsights
            activity={activity}
            applications={applications}
            events={events}
            onOpenWorkflow={openWorkflow}
          />
        )}
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
