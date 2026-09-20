import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";
import { isApplicationStatus, type ApplicationStatus } from "./types";

export type WorkspaceEvent = {
  applicationId: string;
  at: Date;
  completed: boolean;
  id: string;
  kind: "interview" | "reminder";
  title: string;
};

export type ActivityEntry = {
  applicationId: string;
  at: Date;
  fromStatus: ApplicationStatus | null;
  id: string;
  toStatus: ApplicationStatus;
};

type State = {
  activity: ActivityEntry[];
  errorMessage: string;
  events: WorkspaceEvent[];
  isLoading: boolean;
};

const HISTORY_LIMIT = 60;

// Reminders + interviews (as one dated event list) and recent status changes
// across ALL of the user's applications. Read-only; the per-application
// workflow hook (useApplicationWorkflow) remains the place that edits them.
export function useWorkspaceEvents(): State {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [state, setState] = useState<State>({ activity: [], errorMessage: "", events: [], isLoading: true });

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      if (!userId) {
        setState({ activity: [], errorMessage: "", events: [], isLoading: false });
        return;
      }

      const [reminders, interviews, history] = await Promise.all([
        supabase
          .from("application_reminders")
          .select("id, application_id, title, due_at, completed_at")
          .eq("user_id", userId)
          .order("due_at", { ascending: true }),
        supabase
          .from("application_interviews")
          .select("id, application_id, stage, scheduled_at")
          .eq("user_id", userId)
          .order("scheduled_at", { ascending: true }),
        supabase
          .from("application_status_history")
          .select("id, application_id, from_status, to_status, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(HISTORY_LIMIT),
      ]);

      if (!isCurrent) return;

      const error = reminders.error ?? interviews.error ?? history.error;
      if (error) {
        setState({ activity: [], errorMessage: error.message, events: [], isLoading: false });
        return;
      }

      const events: WorkspaceEvent[] = [
        ...(reminders.data ?? []).map((row) => ({
          applicationId: String(row.application_id),
          at: new Date(String(row.due_at)),
          completed: row.completed_at !== null,
          id: `reminder-${String(row.id)}`,
          kind: "reminder" as const,
          title: String(row.title),
        })),
        ...(interviews.data ?? []).map((row) => ({
          applicationId: String(row.application_id),
          at: new Date(String(row.scheduled_at)),
          completed: false,
          id: `interview-${String(row.id)}`,
          kind: "interview" as const,
          title: String(row.stage),
        })),
      ].sort((a, b) => a.at.getTime() - b.at.getTime());

      const activity: ActivityEntry[] = (history.data ?? [])
        .filter((row) => isApplicationStatus(row.to_status))
        .map((row) => ({
          applicationId: String(row.application_id),
          at: new Date(String(row.created_at)),
          fromStatus: isApplicationStatus(row.from_status) ? row.from_status : null,
          id: String(row.id),
          toStatus: row.to_status as ApplicationStatus,
        }));

      setState({ activity, errorMessage: "", events, isLoading: false });
    }

    void load();

    return () => {
      isCurrent = false;
    };
  }, [userId]);

  return state;
}
