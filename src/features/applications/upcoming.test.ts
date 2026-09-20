import { describe, expect, it } from "vitest";
import { selectUpcoming } from "./upcoming";
import type { WorkspaceEvent } from "./useWorkspaceEvents";

const NOW = new Date("2026-06-30T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

function event(overrides: Partial<WorkspaceEvent> & { inDays: number }): WorkspaceEvent {
  const { inDays, ...rest } = overrides;

  return {
    applicationId: "a",
    at: new Date(NOW.getTime() + inDays * DAY),
    completed: false,
    id: `e${inDays}-${rest.kind ?? "reminder"}`,
    kind: "reminder",
    title: "x",
    ...rest,
  };
}

describe("selectUpcoming", () => {
  it("keeps overdue reminders and anything inside the horizon", () => {
    const events = [event({ inDays: -2 }), event({ inDays: 3 }), event({ inDays: 30 })];

    expect(selectUpcoming(events, NOW, 7).map((item) => item.id)).toEqual(["e-2-reminder", "e3-reminder"]);
  });

  it("drops completed reminders", () => {
    expect(selectUpcoming([event({ completed: true, inDays: 1 })], NOW, 7)).toEqual([]);
  });

  it("drops past interviews but keeps upcoming ones", () => {
    const events = [event({ inDays: -1, kind: "interview" }), event({ inDays: 2, kind: "interview" })];

    expect(selectUpcoming(events, NOW, 7).map((item) => item.id)).toEqual(["e2-interview"]);
  });

  it("excludes interviews beyond the horizon", () => {
    expect(selectUpcoming([event({ inDays: 10, kind: "interview" })], NOW, 7)).toEqual([]);
  });
});
