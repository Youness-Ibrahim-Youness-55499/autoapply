import { applicationStatuses, type Application, type ApplicationStatus } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export type DashboardStats = {
  addedThisWeek: number;
  byStatus: Map<ApplicationStatus, number>;
  incompleteReminders: Application[];
  interviewCount: number;
  offerCount: number;
  overdueFollowUps: Application[];
  recentActivity: Application[];
  responseCount: number;
  total: number;
  upcomingDeadlines: Application[];
};

function byTimestamp(getIsoDate: (application: Application) => string) {
  return (a: Application, b: Application) =>
    new Date(getIsoDate(a)).getTime() - new Date(getIsoDate(b)).getTime();
}

/**
 * Derives the overview-page dashboard statistics from a candidate's
 * applications. Pure and deterministic (given the same `now`) so it can be
 * unit tested without React or a live clock.
 */
export function calculateDashboardStats(
  applications: Application[],
  now: number = Date.now(),
): DashboardStats {
  const total = applications.length;
  const weekAgo = now - 7 * DAY_MS;
  const inTwoWeeks = now + 14 * DAY_MS;

  const addedThisWeek = applications.filter(
    (application) => new Date(application.created_at).getTime() >= weekAgo,
  ).length;

  const byStatus = new Map<ApplicationStatus, number>();
  for (const status of applicationStatuses) {
    byStatus.set(status, 0);
  }
  for (const application of applications) {
    byStatus.set(application.status, (byStatus.get(application.status) ?? 0) + 1);
  }

  const responseCount = applications.filter(
    (application) => application.status !== "saved" && application.status !== "applied",
  ).length;
  const interviewCount = applications.filter((application) => application.status === "interview").length;
  const offerCount = applications.filter((application) => application.status === "offer").length;

  const upcomingDeadlines = applications
    .filter((application): application is Application & { deadline: string } => {
      if (!application.deadline) return false;
      const deadlineTs = new Date(application.deadline).getTime();
      return deadlineTs >= now && deadlineTs <= inTwoWeeks;
    })
    .sort(byTimestamp((application) => application.deadline as string));

  const overdueFollowUps = applications
    .filter((application): application is Application & { follow_up_at: string } => {
      if (!application.follow_up_at) return false;
      return new Date(application.follow_up_at).getTime() < now;
    })
    .sort(byTimestamp((application) => application.follow_up_at as string));

  const incompleteReminders = applications
    .filter((application): application is Application & { follow_up_at: string } => {
      if (!application.follow_up_at) return false;
      return new Date(application.follow_up_at).getTime() >= now;
    })
    .sort(byTimestamp((application) => application.follow_up_at as string));

  const recentActivity = [...applications]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  return {
    addedThisWeek,
    byStatus,
    incompleteReminders,
    interviewCount,
    offerCount,
    overdueFollowUps,
    recentActivity,
    responseCount,
    total,
    upcomingDeadlines,
  };
}
