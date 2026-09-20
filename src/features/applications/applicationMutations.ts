import { supabase } from "../../lib/supabase";
import type { ApplicationStatus } from "./types";

export type StatusUpdateResult = { message: string | null; ok: false } | { ok: true };

// Persists a status change. `message: null` on failure means the row wasn't
// found (deleted elsewhere); callers translate that case themselves.
export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  status: ApplicationStatus,
): Promise<StatusUpdateResult> {
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) return { message: error.message, ok: false };
  if (!data) return { message: null, ok: false };
  return { ok: true };
}
