import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "../i18n";
import { useAuth } from "../auth/AuthProvider";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { useApplications } from "../features/applications/useApplications";
import { EmptyState } from "../components/states/EmptyState";
import { LoadingState } from "../components/states/LoadingState";
import { ErrorState } from "../components/states/ErrorState";

function StatCard({ title, value, subtitle, children }: { title: string; value: string | number; subtitle?: string; children?: React.ReactNode }) {
  const pct = typeof value === "string" && value.endsWith("%") ? Number(value.replace("%", "")) : null;

  return (
    <div className="rounded-card border border-line bg-surface p-5 sm:p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-muted truncate">{title}</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-ink">{value}</p>
          {subtitle && <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>}
          {pct !== null && (
            <div className="mt-4 h-2.5 w-full rounded-full bg-white/6">
              <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
            </div>
          )}
        </div>
        <div className="hidden shrink-0 text-sm text-ink-muted sm:block">{children}</div>
      </div>
    </div>
  );
}

function ListCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-surface p-5 sm:p-6 shadow-card">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "applied"
      ? "bg-amber-600"
      : status === "interview"
      ? "bg-sky-600"
      : status === "offer"
      ? "bg-emerald-600"
      : status === "rejected"
      ? "bg-rose-600"
      : "bg-ink-muted";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${color} text-white uppercase`}>
      <span className="size-1 rounded-full bg-white/30" />
      {status}
    </span>
  );
}

const startingPoints = [
  {
    description: "The route is ready. Reading and managing your private application records begins in Phase 2.",
    label: "Applications",
    to: "/app/applications",
  },
  {
    description: "Review the account information available now and see what candidate details are still missing.",
    label: "Profile",
    to: "/app/profile",
  },
  {
    description: "See the current document-storage state before private uploads are introduced.",
    label: "Documents",
    to: "/app/documents",
  },
];

export function ProductHomePage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const metadataName = session?.user.user_metadata.name;
  const name =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : "there";
  const { applications, isLoading, errorMessage } = useApplications();

  const total = applications.length;

  const addedThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return applications.filter((a) => new Date(a.created_at).getTime() >= weekAgo).length;
  }, [applications]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of ["saved", "applied", "interview", "offer", "rejected", "withdrawn"]) {
      map.set(s, 0);
    }
    for (const app of applications) {
      map.set(app.status, (map.get(app.status) ?? 0) + 1);
    }
    return map;
  }, [applications]);

  const responseCount = useMemo(() => {
    return applications.filter((a) => a.status !== "saved" && a.status !== "applied").length;
  }, [applications]);

  const interviewCount = useMemo(() => applications.filter((a) => a.status === "interview").length, [applications]);
  const offerCount = useMemo(() => applications.filter((a) => a.status === "offer").length, [applications]);

  const upcomingDeadlines = useMemo(() => {
    const now = Date.now();
    const inTwoWeeks = now + 14 * 24 * 60 * 60 * 1000;
    return applications
      .filter((a) => a.deadline)
      .map((a) => ({ ...a, deadlineTs: new Date(a.deadline!).getTime() }))
      .filter((a) => a.deadlineTs >= now && a.deadlineTs <= inTwoWeeks)
      .sort((x, y) => x.deadlineTs - y.deadlineTs);
  }, [applications]);

  const overdueFollowUps = useMemo(() => {
    const now = Date.now();
    return applications
      .filter((a) => a.follow_up_at)
      .map((a) => ({ ...a, followTs: new Date(a.follow_up_at!).getTime() }))
      .filter((a) => a.followTs < now)
      .sort((x, y) => x.followTs - y.followTs);
  }, [applications]);

  const upcomingInterviews: typeof applications = [];

  const incompleteReminders = useMemo(() => {
    const now = Date.now();
    return applications
      .filter((a) => a.follow_up_at)
      .map((a) => ({ ...a, followTs: new Date(a.follow_up_at!).getTime() }))
      .filter((a) => a.followTs >= now)
      .sort((x, y) => x.followTs - y.followTs);
  }, [applications]);

  const recentActivity = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 6);
  }, [applications]);

  return (
    <>
      <Seo
        description="Your private Autoapply workspace."
        noIndex
        path="/app"
        title="Overview"
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <ProductPageHeader
          description={t("overview.description")}
          eyebrow={t("workspace")}
          title={t("overview.title", { name })}
        />

        <section className="mt-8 max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t("dashboard.totalApplications")} value={total} />
            <StatCard title={t("dashboard.addedThisWeek")} value={addedThisWeek} />
            <StatCard title={t("dashboard.responseRate")} value={total ? `${Math.round((responseCount / total) * 100)}%` : "—"} subtitle={t("dashboard.responseRateSubtitle")} />
            <StatCard title={t("dashboard.interviewRate")} value={total ? `${Math.round((interviewCount / total) * 100)}%` : "—"} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ListCard title={t("dashboard.applicationsByStatus")}>
                <div className="grid grid-cols-2 gap-3">
                  {Array.from(byStatus.entries()).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between gap-3 rounded-md border border-line bg-white/3 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={status} />
                      </div>
                      <div className="text-sm font-semibold">{count}</div>
                    </div>
                  ))}
                </div>
              </ListCard>

              <div className="mt-4">
                <ListCard title={t("dashboard.recentStatusActivity")}>
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-ink-muted">{t("dashboard.noRecentActivity")}</p>
                  ) : (
                    recentActivity.map((a) => (
                      <Link key={a.id} to={`/app/applications#${a.id}`} className="block rounded-md px-2 py-2 hover:bg-canvas">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold">{a.job_title} — {a.company_name}</div>
                            <div className="text-xs text-ink-muted">Updated {new Date(a.updated_at).toLocaleString()}</div>
                          </div>
                          <div className="text-sm text-ink-muted">{a.status}</div>
                        </div>
                      </Link>
                    ))
                  )}
                </ListCard>
              </div>
            </div>

            <div>
              <ListCard title={t("dashboard.upcomingDeadlines")}>
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-sm text-ink-muted">{t("dashboard.noUpcomingDeadlines")}</p>
                ) : (
                  upcomingDeadlines.map((a) => (
                    <Link key={a.id} to={`/app/applications#${a.id}`} className="block rounded-md px-2 py-2 hover:bg-canvas">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">{a.job_title}</div>
                        <div className="text-xs text-ink-muted">{new Date(a.deadline!).toLocaleDateString()}</div>
                      </div>
                    </Link>
                  ))
                )}
              </ListCard>

              <div className="mt-4">
                <ListCard title={t("dashboard.overdueFollowUps")}>
                  {overdueFollowUps.length === 0 ? (
                    <p className="text-sm text-ink-muted">{t("dashboard.noOverdueFollowUps")}</p>
                  ) : (
                    overdueFollowUps.map((a) => (
                      <Link key={a.id} to={`/app/applications#${a.id}`} className="block rounded-md px-2 py-2 hover:bg-canvas">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">{a.job_title}</div>
                          <div className="text-xs text-ink-muted">{new Date(a.follow_up_at!).toLocaleDateString()}</div>
                        </div>
                      </Link>
                    ))
                  )}
                </ListCard>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ListCard title={t("dashboard.upcomingInterviews")}>
              {upcomingInterviews.length === 0 ? (
                <p className="text-sm text-ink-muted">{t("dashboard.noUpcomingInterviews")}</p>
              ) : (
                upcomingInterviews.map((a) => (
                  <Link key={a.id} to={`/app/applications#${a.id}`} className="block rounded-md px-2 py-2 hover:bg-canvas">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">{a.job_title}</div>
                      <div className="text-xs text-ink-muted">{/* placeholder */}</div>
                    </div>
                  </Link>
                ))
              )}
            </ListCard>

            <ListCard title={t("dashboard.incompleteReminders")}>
              {incompleteReminders.length === 0 ? (
                <p className="text-sm text-ink-muted">{t("dashboard.noIncompleteReminders")}</p>
              ) : (
                incompleteReminders.map((a) => (
                  <Link key={a.id} to={`/app/applications#${a.id}`} className="block rounded-md px-2 py-2 hover:bg-canvas">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">{a.job_title}</div>
                      <div className="text-xs text-ink-muted">{new Date(a.follow_up_at!).toLocaleDateString()}</div>
                    </div>
                  </Link>
                ))
              )}
            </ListCard>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <LoadingState title={t("dashboard.loadingOverviewTitle")} description={t("dashboard.loadingOverviewDescription")} />
            ) : errorMessage ? (
              <ErrorState title={t("dashboard.errorOverviewTitle")} description={errorMessage} />
            ) : total === 0 ? (
              <EmptyState title={t("dashboard.noApplicationsYet")} description={t("dashboard.noApplicationsYetDescription")} />
            ) : null}
          </div>
        </section>
      </PageContainer>
    </>
  );
}
