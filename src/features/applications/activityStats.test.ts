import { describe, expect, it } from "vitest";
import { buildWeeklyActivity, recentCounts, sum } from "./activityStats";
import type { Application, ApplicationStatus } from "./types";
import type { ActivityEntry } from "./useWorkspaceEvents";

const NOW = new Date("2026-06-30T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

function daysAgo(days: number) {
  return new Date(NOW.getTime() - days * DAY);
}

function application(createdDaysAgo: number, appliedDaysAgo: number | null = null): Application {
  return {
    applied_at: appliedDaysAgo === null ? null : daysAgo(appliedDaysAgo).toISOString(),
    created_at: daysAgo(createdDaysAgo).toISOString(),
  } as Application;
}

function change(daysBack: number, toStatus: ApplicationStatus): ActivityEntry {
  return { applicationId: "a", at: daysAgo(daysBack), fromStatus: "applied", id: `${daysBack}-${toStatus}`, toStatus };
}

describe("buildWeeklyActivity", () => {
  it("returns one zeroed bucket per week", () => {
    const result = buildWeeklyActivity([], [], 4, NOW);

    expect(result.applications).toEqual([0, 0, 0, 0]);
    expect(result.starts).toHaveLength(4);
  });

  it("buckets applications by applied date, falling back to created date, oldest first", () => {
    const result = buildWeeklyActivity([application(1), application(2), application(10), application(20, 8)], [], 4, NOW);

    // Last bucket = last 7 days (added 1 and 2 days ago). The bucket before it
    // holds the one added 10 days ago and the one applied 8 days ago (created 20
    // days ago, but the applied date wins).
    expect(result.applications).toEqual([0, 0, 2, 2]);
  });

  it("ignores rows older than the window", () => {
    const result = buildWeeklyActivity([application(200)], [], 4, NOW);

    expect(sum(result.applications)).toBe(0);
  });

  it("counts responses (interview, offer, rejected) and interviews from status history", () => {
    const result = buildWeeklyActivity([], [change(1, "interview"), change(2, "offer"), change(3, "rejected"), change(4, "saved")], 2, NOW);

    expect(result.responses).toEqual([0, 3]);
    expect(result.interviews).toEqual([0, 1]);
  });
});

describe("recentCounts", () => {
  it("counts only what happened in the trailing window", () => {
    const counts = recentCounts(
      [application(1), application(6), application(9)],
      [change(2, "interview"), change(3, "offer"), change(10, "interview")],
      7,
      NOW,
    );

    expect(counts).toEqual({ applications: 2, interviews: 1, offers: 1 });
  });
});
