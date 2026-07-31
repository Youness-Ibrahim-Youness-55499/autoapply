import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";
import {
  isApplicationStatus,
  type Application,
  type ApplicationStatus,
} from "./types";

type ApplicationsState = {
  applications: Application[];
  errorMessage: string;
  isLoading: boolean;
  refresh: () => void;
  removeLocally: (id: string) => void;
  retry: () => void;
  updateStatusLocally: (id: string, status: ApplicationStatus) => void;
};

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isApplication(value: unknown): value is Application {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.id === "string" &&
    typeof row.company_name === "string" &&
    typeof row.job_title === "string" &&
    isApplicationStatus(row.status) &&
    isNullableString(row.job_url) &&
    isNullableString(row.location) &&
    isNullableString(row.notes) &&
    isNullableString(row.applied_at) &&
    isNullableString(row.job_description) &&
    isNullableString(row.salary) &&
    isNullableString(row.deadline) &&
    isNullableString(row.recruiter_name) &&
    isNullableString(row.recruiter_email) &&
    isNullableString(row.recruiter_phone) &&
    isNullableString(row.follow_up_at) &&
    isNullableString(row.rejection_reason) &&
    isNullableString(row.offer_amount) &&
    isNullableString(row.offer_date) &&
    isNullableString(row.offer_notes) &&
    isNullableString(row.cv_document_id) &&
    isNullableString(row.cover_letter_document_id) &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

export function useApplications(): ApplicationsState {
  const { session } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [requestVersion, setRequestVersion] = useState(0);
  const userId = session?.user.id;

  useEffect(() => {
    let isCurrent = true;

    async function loadApplications() {
      if (!userId) {
        setApplications([]);
        setErrorMessage("Your session is not available. Please log in again.");
        setIsLoading(false);
        return;
      }

      setErrorMessage("");
      setIsLoading(true);

      const { data, error } = await supabase
        .from("applications")
        .select(
          "id, company_name, job_title, status, job_url, location, notes, applied_at, job_description, salary, deadline, recruiter_name, recruiter_email, recruiter_phone, follow_up_at, rejection_reason, offer_amount, offer_date, offer_notes, cv_document_id, cover_letter_document_id, created_at, updated_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!isCurrent) {
        return;
      }

      if (error) {
        setApplications([]);
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (!(data ?? []).every(isApplication)) {
        setApplications([]);
        setErrorMessage("The application data returned in an unexpected format.");
        setIsLoading(false);
        return;
      }

      setApplications(data ?? []);
      setIsLoading(false);
    }

    void loadApplications();

    return () => {
      isCurrent = false;
    };
  }, [requestVersion, userId]);

  const refresh = () => setRequestVersion((version) => version + 1);

  function removeLocally(id: string) {
    setApplications((currentApplications) =>
      currentApplications.filter((application) => application.id !== id),
    );
  }

  function updateStatusLocally(id: string, status: ApplicationStatus) {
    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === id ? { ...application, status } : application,
      ),
    );
  }

  return {
    applications,
    errorMessage,
    isLoading,
    refresh,
    removeLocally,
    retry: refresh,
    updateStatusLocally,
  };
}

