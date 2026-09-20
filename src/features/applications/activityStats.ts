import type { ActivityEntry } from "./useWorkspaceEvents";
import type { Application } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const RESPONSE_STATUSES = ["interview", "offer", "rejected"];

export type WeeklyActivity = {
  applications: number[];
  interviews: number[];
  responses: number[];
  starts: Date[];
};

function addedAt(application: Application) {
  return new Date(application.applied_at ?? application.created_at);
}

// Rolling 7-day buckets ending at `now` (oldest first). Everything is derived
// from real rows: applications by date added/applied, and status changes
// from application_status_history.
export function buildWeeklyActivity(
  applications: Application[],
  activity: ActivityEntry[],
  weeks: number,
  now: Date = new Date(),
): WeeklyActivity {
  const starts = Array.from({ length: weeks }, (_, index) => new Date(now.getTime() - (weeks - index) * WEEK_MS));
  const result: WeeklyActivity = {
    applications: new Array(weeks).fill(0),
    interviews: new Array(weeks).fill(0),
    responses: new Array(weeks).fill(0),
    starts,
  };

  function bucketOf(date: Date) {
    const index = Math.floor((date.getTime() - starts[0].getTime()) / WEEK_MS);
    return index >= 0 && index < weeks ? index : -1;
  }

  for (const application of applications) {
    const index = bucketOf(addedAt(application));
    if (index >= 0) result.applications[index] += 1;
  }

  for (const entry of activity) {
    const index = bucketOf(entry.at);
    if (index < 0) continue;
    if (RESPONSE_STATUSES.includes(entry.toStatus)) result.responses[index] += 1;
    if (entry.toStatus === "interview") result.interviews[index] += 1;
  }

  return result;
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

// Counts for the trailing `days` days -- used for the "+N this week" deltas.
export function recentCounts(applications: Application[], activity: ActivityEntry[], days: number, now: Date = new Date()) {
  const since = now.getTime() - days * DAY_MS;

  return {
    applications: applications.filter((application) => addedAt(application).getTime() >= since).length,
    interviews: activity.filter((entry) => entry.toStatus === "interview" && entry.at.getTime() >= since).length,
    offers: activity.filter((entry) => entry.toStatus === "offer" && entry.at.getTime() >= since).length,
  };
}
