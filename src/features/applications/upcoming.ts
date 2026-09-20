import type { WorkspaceEvent } from "./useWorkspaceEvents";

const DAY_MS = 24 * 60 * 60 * 1000;

// Overdue (not completed) reminders plus anything due within `days`. Completed
// items and past interviews are excluded -- they're history, not "coming up".
export function selectUpcoming(events: WorkspaceEvent[], now: Date, days: number) {
  const horizon = now.getTime() + days * DAY_MS;

  return events.filter((event) => {
    if (event.completed) return false;
    const time = event.at.getTime();
    if (event.kind === "interview") return time >= now.getTime() && time <= horizon;
    return time <= horizon;
  });
}
