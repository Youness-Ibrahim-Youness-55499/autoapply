import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";
import {
  interviewStages,
  isApplicationStatus,
  reminderTypes,
  type ApplicationInterview,
  type ApplicationReminder,
  type InterviewStage,
  type ReminderType,
  type StatusHistory,
} from "./types";

function normalizeHistory(value: unknown): StatusHistory | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.created_at !== "string" ||
    !isApplicationStatus(row.to_status) ||
    (row.from_status !== null && !isApplicationStatus(row.from_status))
  ) return null;
  return row as StatusHistory;
}

function normalizeReminder(value: unknown): ApplicationReminder | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.title !== "string" ||
    typeof row.due_at !== "string" ||
    !reminderTypes.includes(row.reminder_type as ReminderType) ||
    (row.notes !== null && typeof row.notes !== "string") ||
    (row.completed_at !== null && typeof row.completed_at !== "string")
  ) return null;
  return row as ApplicationReminder;
}

function normalizeInterview(value: unknown): ApplicationInterview | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.scheduled_at !== "string" ||
    !interviewStages.includes(row.stage as InterviewStage) ||
    (row.location !== null && typeof row.location !== "string") ||
    (row.notes !== null && typeof row.notes !== "string")
  ) return null;
  return row as ApplicationInterview;
}

export function useApplicationWorkflow(applicationId: string) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [reminders, setReminders] = useState<ApplicationReminder[]>([]);
  const [interviews, setInterviews] = useState<ApplicationInterview[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setErrorMessage("Your session is not available. Please log in again.");
      setIsLoading(false);
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    const [historyResult, remindersResult, interviewsResult] = await Promise.all([
      supabase
        .from("application_status_history")
        .select("id, from_status, to_status, created_at")
        .eq("application_id", applicationId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("application_reminders")
        .select("id, title, reminder_type, due_at, notes, completed_at")
        .eq("application_id", applicationId)
        .eq("user_id", userId)
        .order("due_at", { ascending: true }),
      supabase
        .from("application_interviews")
        .select("id, stage, scheduled_at, location, notes")
        .eq("application_id", applicationId)
        .eq("user_id", userId)
        .order("scheduled_at", { ascending: false }),
    ]);

    const error =
      historyResult.error || remindersResult.error || interviewsResult.error;
    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    const nextHistory = (historyResult.data ?? []).map(normalizeHistory);
    const nextReminders = (remindersResult.data ?? []).map(normalizeReminder);
    const nextInterviews = (interviewsResult.data ?? []).map(normalizeInterview);
    if (
      nextHistory.some((item) => !item) ||
      nextReminders.some((item) => !item) ||
      nextInterviews.some((item) => !item)
    ) {
      setErrorMessage("Workflow data returned in an unexpected format.");
      setIsLoading(false);
      return;
    }

    setHistory(nextHistory as StatusHistory[]);
    setReminders(nextReminders as ApplicationReminder[]);
    setInterviews(nextInterviews as ApplicationInterview[]);
    setIsLoading(false);
  }, [applicationId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addReminder(values: {
    dueAt: string;
    notes: string;
    title: string;
    type: ReminderType;
  }) {
    if (!userId) return false;
    setErrorMessage("");
    setSuccessMessage("");
    setIsSaving(true);
    const { error } = await supabase.from("application_reminders").insert({
      application_id: applicationId,
      due_at: new Date(values.dueAt).toISOString(),
      notes: values.notes.trim() || null,
      reminder_type: values.type,
      title: values.title.trim(),
      user_id: userId,
    });
    setIsSaving(false);
    if (error) {
      setErrorMessage(error.message);
      return false;
    }
    setSuccessMessage("Reminder added.");
    await load();
    return true;
  }

  async function toggleReminder(reminder: ApplicationReminder) {
    if (!userId) return;
    setErrorMessage("");
    const { error } = await supabase
      .from("application_reminders")
      .update({ completed_at: reminder.completed_at ? null : new Date().toISOString() })
      .eq("id", reminder.id)
      .eq("user_id", userId);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    await load();
  }

  async function deleteReminder(id: string) {
    if (!userId) return;
    setErrorMessage("");
    const { error } = await supabase
      .from("application_reminders")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) setErrorMessage(error.message);
    else await load();
  }

  async function addInterview(values: {
    location: string;
    notes: string;
    scheduledAt: string;
    stage: InterviewStage;
  }) {
    if (!userId) return false;
    setErrorMessage("");
    setSuccessMessage("");
    setIsSaving(true);
    const { error } = await supabase.from("application_interviews").insert({
      application_id: applicationId,
      location: values.location.trim() || null,
      notes: values.notes.trim() || null,
      scheduled_at: new Date(values.scheduledAt).toISOString(),
      stage: values.stage,
      user_id: userId,
    });
    setIsSaving(false);
    if (error) {
      setErrorMessage(error.message);
      return false;
    }
    setSuccessMessage("Interview added.");
    await load();
    return true;
  }

  async function deleteInterview(id: string) {
    if (!userId) return;
    setErrorMessage("");
    const { error } = await supabase
      .from("application_interviews")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) setErrorMessage(error.message);
    else await load();
  }

  return {
    addInterview,
    addReminder,
    deleteInterview,
    deleteReminder,
    errorMessage,
    history,
    interviews,
    isLoading,
    isSaving,
    reminders,
    retry: load,
    successMessage,
    toggleReminder,
  };
}
