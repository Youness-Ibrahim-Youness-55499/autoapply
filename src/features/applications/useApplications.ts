import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";
import {
  isApplicationStatus,
  type Application,
} from "./types";

type ApplicationsState = {
  applications: Application[];
  errorMessage: string;
  isLoading: boolean;
  retry: () => void;
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
    isNullableString(row.applied_at) &&
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
          "id, company_name, job_title, status, job_url, location, applied_at, created_at, updated_at",
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

  return {
    applications,
    errorMessage,
    isLoading,
    retry: () => setRequestVersion((version) => version + 1),
  };
}
