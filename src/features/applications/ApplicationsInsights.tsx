import { useMemo, type ReactNode } from "react";
import { LineChart } from "../../components/charts/LineChart";
import { Logo } from "../../components/Logo";
import { ArrowRightIcon } from "../../components/icons/BrandIcons";
import { Card } from "../../components/ui/Card";
import { LinkButton } from "../../components/ui/LinkButton";
import { useTranslation } from "../../i18n";
import { formatRelative } from "../../lib/relativeTime";
import { buildWeeklyActivity } from "./activityStats";
import { applicationStatusDetails } from "./applicationStatus";
import { getApplicationStats } from "./applicationStats";
import { interviewStageLabelKeys, type Application, type InterviewStage } from "./types";
import { selectUpcoming } from "./upcoming";
import type { ActivityEntry, WorkspaceEvent } from "./useWorkspaceEvents";

const WEEKS = 8;
const UPCOMING_DAYS = 30;

function Panel({ children, title, trailing }: { children: ReactNode; title: string; trailing?: ReactNode }) {
  return (
    <Card className="h-full" padding="sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
        {trailing}
      </div>
      {children}
    </Card>
  );
}

// Upcoming tasks, recent activity and progress under the kanban board. Every
// figure comes from the user's own applications, reminders, interviews and
// status history.
export function ApplicationsInsights({
  activity,
  applications,
  events,
  onOpenWorkflow,
}: {
  activity: ActivityEntry[];
  applications: Application[];
  events: WorkspaceEvent[];
  onOpenWorkflow: (application: Application) => void;
}) {
  const { locale, t } = useTranslation();

  const applicationById = useMemo(() => new Map(applications.map((application) => [application.id, application])), [applications]);
  const upcoming = useMemo(
    () => selectUpcoming(events, new Date(), UPCOMING_DAYS).slice(0, 4),
    [events],
  );
  const weekly = useMemo(() => buildWeeklyActivity(applications, activity, WEEKS), [applications, activity]);
  const stats = useMemo(() => getApplicationStats(applications), [applications]);
  const now = new Date();

  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "short" });
  const dayFormatter = new Intl.DateTimeFormat(locale, { day: "numeric" });
  const shortDate = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  const recentActivity = activity.filter((entry) => applicationById.has(entry.applicationId)).slice(0, 5);

  return (
    <div className="mt-8 space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title={t("applications.upcoming.title")}>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("applications.upcoming.empty")}</p>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((event) => {
                const application = applicationById.get(event.applicationId);
                const isOverdue = event.kind === "reminder" && event.at < now;
                const title =
                  event.kind === "interview"
                    ? t(interviewStageLabelKeys[event.title as InterviewStage] ?? "applications.interviewStage.other")
                    : event.title;

                return (
                  <li key={event.id}>
                    <button
                      className="flex w-full items-center gap-3 py-3 text-left transition hover:opacity-80"
                      disabled={!application}
                      onClick={() => application && onOpenWorkflow(application)}
                      type="button"
                    >
                      <span className="w-10 shrink-0 text-center leading-none">
                        <span className="block text-[0.625rem] font-bold uppercase text-ink-muted">{monthFormatter.format(event.at)}</span>
                        <span className="block text-xl font-extrabold">{dayFormatter.format(event.at)}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{title}</span>
                        {application && (
                          <span className="block truncate text-xs text-ink-muted">
                            {application.company_name} · {application.job_title}
                          </span>
                        )}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold ${
                          isOverdue ? "bg-red-100 text-red-700" : "bg-brand-100 text-brand-800"
                        }`}
                      >
                        {isOverdue ? t("notifications.overdue") : formatRelative(event.at, locale, now)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title={t("applications.activity.title")}>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("applications.activity.empty")}</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentActivity.map((entry) => {
                const application = applicationById.get(entry.applicationId);

                return (
                  <li className="flex items-center gap-3 py-3" key={entry.id}>
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-canvas text-xs font-extrabold text-ink">
                      {(application?.company_name ?? "?").charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {entry.fromStatus === null
                          ? t("applications.activity.added")
                          : t("applications.activity.moved", { status: t(applicationStatusDetails[entry.toStatus].labelKey) })}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">{application?.job_title}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-muted">{formatRelative(entry.at, locale, now)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title={t("applications.progress.title")} trailing={<span className="text-xs font-semibold text-ink-muted">{t("dashboard.activityRange")}</span>}>
          <LineChart
            ariaLabel={t("applications.progress.aria")}
            labels={weekly.starts.map((start) => shortDate.format(start))}
            values={weekly.applications}
          />
          <div className="mt-3 grid grid-cols-4 gap-2 border-t border-line pt-3 text-center">
            {[
              { label: t("dashboard.activityApplications"), value: stats.total },
              { label: t("dashboard.statInterviews"), value: stats.interviews },
              { label: t("dashboard.statOffers"), value: stats.offers },
              { label: t("dashboard.statResponseRate"), value: `${stats.responseRate}%` },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-lg font-extrabold">{item.value}</p>
                <p className="text-[0.6875rem] font-semibold leading-tight text-ink-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="soft-card flex flex-wrap items-center gap-4 rounded-card border border-line p-5">
        <Logo className="h-12" variant="icon" />
        <div className="min-w-0 flex-1 basis-56">
          <p className="text-base font-bold">{t("applications.keepGoing.title")}</p>
          <p className="text-sm text-ink-muted">{t("applications.keepGoing.body")}</p>
        </div>
        <LinkButton to="/app/jobs">
          {t("applications.keepGoing.cta")}
          <ArrowRightIcon className="size-4" />
        </LinkButton>
      </div>
    </div>
  );
}
