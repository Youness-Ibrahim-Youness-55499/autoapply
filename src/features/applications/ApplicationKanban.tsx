import { useMemo, useState, type DragEvent } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { CalendarIcon } from "../../components/icons/BrandIcons";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { useToast } from "../../components/ui/Toast";
import { useTranslation } from "../../i18n";
import { formatRelative } from "../../lib/relativeTime";
import { updateApplicationStatus } from "./applicationMutations";
import { applicationStatusDetails } from "./applicationStatus";
import { ApplicationStatusControl } from "./ApplicationStatusControl";
import { applicationStatuses, type Application, type ApplicationStatus } from "./types";
import type { WorkspaceEvent } from "./useWorkspaceEvents";

type ApplicationKanbanProps = {
  applications: Application[];
  events: WorkspaceEvent[];
  onAdd: () => void;
  onDelete: (application: Application) => void;
  onEdit: (application: Application) => void;
  onStatusUpdated: (id: string, status: ApplicationStatus) => void;
  onWorkflow: (application: Application) => void;
};

const columnStyles: Record<ApplicationStatus, { dot: string; tint: string }> = {
  applied: { dot: "bg-brand-500", tint: "bg-brand-50/60" },
  interview: { dot: "bg-amber-400", tint: "bg-amber-50/70" },
  offer: { dot: "bg-yellow-500", tint: "bg-yellow-50/70" },
  rejected: { dot: "bg-slate-700", tint: "bg-slate-100" },
  saved: { dot: "bg-slate-400", tint: "bg-slate-50" },
  withdrawn: { dot: "bg-slate-300", tint: "bg-slate-50" },
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function KanbanCard({
  application,
  isDragging,
  nextInterview,
  onDelete,
  onDragEnd,
  onDragStart,
  onEdit,
  onStatusUpdated,
  onWorkflow,
}: {
  application: Application;
  isDragging: boolean;
  nextInterview: Date | undefined;
  onDelete: (application: Application) => void;
  onDragEnd: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onEdit: (application: Application) => void;
  onStatusUpdated: (id: string, status: ApplicationStatus) => void;
  onWorkflow: (application: Application) => void;
}) {
  const { locale, t } = useTranslation();

  let meta: { icon: boolean; text: string; tone: string };
  if (nextInterview) {
    meta = {
      icon: true,
      text: t("applications.kanban.metaInterview", { when: formatRelative(nextInterview, locale) }),
      tone: "text-brand-700",
    };
  } else if (application.status === "applied" && application.applied_at) {
    meta = {
      icon: false,
      text: t("applications.kanban.metaApplied", { when: formatRelative(new Date(application.applied_at), locale) }),
      tone: "text-ink-muted",
    };
  } else {
    meta = {
      icon: false,
      text: t("applications.kanban.metaUpdated", { when: formatRelative(new Date(application.updated_at), locale) }),
      tone: "text-ink-muted",
    };
  }

  return (
    <div
      className={`cursor-grab rounded-xl border border-line bg-surface p-3.5 shadow-soft transition active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
      draggable
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-canvas text-xs font-extrabold text-ink">
          {initialsOf(application.company_name)}
        </span>
        <button className="min-w-0 flex-1 text-left" onClick={() => onEdit(application)} type="button">
          <span className="block truncate text-sm font-bold">{application.company_name}</span>
          <span className="block truncate text-xs text-ink-muted">{application.job_title}</span>
        </button>
        <ActionMenu
          items={[
            { label: t("applications.list.edit"), onSelect: () => onEdit(application) },
            { label: t("applications.list.workflow"), onSelect: () => onWorkflow(application) },
            { danger: true, label: t("applications.list.delete"), onSelect: () => onDelete(application) },
          ]}
          label={t("applications.kanban.menuAria", { company: application.company_name })}
        />
      </div>

      <p className={`mt-2.5 flex items-center gap-1.5 text-xs font-semibold ${meta.tone}`}>
        {meta.icon && <CalendarIcon className="size-3.5" />}
        {meta.text}
      </p>

      <div className="mt-2.5">
        <ApplicationStatusControl
          application={application}
          onUpdated={(status) => onStatusUpdated(application.id, status)}
        />
      </div>
    </div>
  );
}

export function ApplicationKanban({
  applications,
  events,
  onAdd,
  onDelete,
  onEdit,
  onStatusUpdated,
  onWorkflow,
}: ApplicationKanbanProps) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { toast } = useToast();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<ApplicationStatus | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<ApplicationStatus, Application[]>(
      applicationStatuses.map((status) => [status, []]),
    );
    for (const application of applications) {
      map.get(application.status)?.push(application);
    }
    return map;
  }, [applications]);

  const nextInterviewByApplication = useMemo(() => {
    const now = Date.now();
    const map = new Map<string, Date>();
    for (const event of events) {
      if (event.kind !== "interview" || event.at.getTime() < now) continue;
      const existing = map.get(event.applicationId);
      if (!existing || event.at < existing) map.set(event.applicationId, event.at);
    }
    return map;
  }, [events]);

  async function handleDrop(status: ApplicationStatus, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    setOverStatus(null);
    setDraggingId(null);

    const application = applications.find((item) => item.id === id);
    const userId = session?.user.id;
    if (!application || !userId || application.status === status) return;

    const result = await updateApplicationStatus(userId, application.id, status);

    if (!result.ok) {
      toast({
        description: result.message ?? t("applications.statusControl.notFound"),
        title: t("applications.kanban.moveFailed"),
        type: "error",
      });
      return;
    }

    onStatusUpdated(application.id, status);
    toast({
      title: t("applications.kanban.moved", { status: t(applicationStatusDetails[status].labelKey) }),
      type: "success",
    });
  }

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
      <div className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] gap-3">
        {applicationStatuses.map((status) => {
          const items = grouped.get(status) ?? [];
          const styles = columnStyles[status];

          return (
            <div
              className={`rounded-2xl border p-3 transition ${styles.tint} ${
                overStatus === status ? "border-brand-500 ring-2 ring-brand-200" : "border-line"
              }`}
              key={status}
              onDragLeave={() => setOverStatus((current) => (current === status ? null : current))}
              onDragOver={(event) => {
                event.preventDefault();
                setOverStatus(status);
              }}
              onDrop={(event) => void handleDrop(status, event)}
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <span aria-hidden="true" className={`size-2.5 rounded-full ${styles.dot}`} />
                  {t(applicationStatusDetails[status].labelKey)}
                </span>
                <span className="text-xs font-semibold text-ink-muted">{items.length}</span>
              </div>

              <div className="space-y-2">
                {items.map((application) => (
                  <KanbanCard
                    application={application}
                    isDragging={draggingId === application.id}
                    key={application.id}
                    nextInterview={nextInterviewByApplication.get(application.id)}
                    onDelete={onDelete}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverStatus(null);
                    }}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", application.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDraggingId(application.id);
                    }}
                    onEdit={onEdit}
                    onStatusUpdated={onStatusUpdated}
                    onWorkflow={onWorkflow}
                  />
                ))}
              </div>

              <button
                className="mt-2 w-full rounded-xl border border-dashed border-line bg-surface/60 py-2.5 text-xs font-semibold text-ink-muted transition hover:border-brand-300 hover:text-brand-800"
                onClick={onAdd}
                type="button"
              >
                {t("applications.kanban.addApplication")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
