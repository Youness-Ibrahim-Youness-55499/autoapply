import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export type ApplicationChecklist = {
  id: string;
  user_id: string;
  application_id: string;
  cv_selected: boolean;
  cover_letter_prepared: boolean;
  contact_details_reviewed: boolean;
  screening_completed: boolean;
  job_description_saved: boolean;
  final_review_completed: boolean;
  submission_confirmed: boolean;
  created_at: string;
  updated_at: string;
};

export function useApplicationChecklist(applicationId?: string) {
  const [checklist, setChecklist] = useState<ApplicationChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;
    async function load() {
      if (!applicationId) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from("application_checklists")
        .select("*")
        .eq("application_id", applicationId)
        .maybeSingle();
      if (!isCurrent) return;
      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }
      if (data) {
        setChecklist(data as ApplicationChecklist);
      } else {
        setChecklist(null);
      }
      setIsLoading(false);
    }

    void load();

    return () => { isCurrent = false; };
  }, [applicationId]);

  async function createOrUpdate(values: Partial<ApplicationChecklist>) {
    if (!applicationId) throw new Error("No application id");
    const existing = checklist;
    if (!existing) {
      const { data, error } = await supabase
        .from("application_checklists")
        .insert({ application_id: applicationId, ...values })
        .select("*")
        .maybeSingle();
      if (error) throw error;
      setChecklist(data as ApplicationChecklist);
      return data as ApplicationChecklist;
    }

    const { data, error } = await supabase
      .from("application_checklists")
      .update(values)
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    setChecklist(data as ApplicationChecklist);
    return data as ApplicationChecklist;
  }

  return { checklist, isLoading, errorMessage, createOrUpdate };
}
