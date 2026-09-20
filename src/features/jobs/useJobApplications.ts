import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useTranslation } from "../../i18n";
import { supabase } from "../../lib/supabase";
import type { Application } from "../applications/types";
// The minimum a job needs to become an application row: a sample listing
// (MockJob) or a live opening from the job service both fit.
export type TrackableJob = {
  company: string;
  description?: string;
  id: string;
  location: string;
  salaryMax?: number;
  salaryMin?: number;
  title: string;
};

// Tracks which mock jobs already have a real application record, and lets
// the UI create one (status "saved" for the bookmark action, "applied" for
// Apply). There's no jobs-catalog table to link against, so a job counts as
// already tracked when an application matches on company + title -- good
// enough for this placeholder job list, per applications table's actual
// schema (no job_id column).
export function useJobApplications(applications: Application[]) {
  const { session } = useAuth();
  const { t } = useTranslation();
  const userId = session?.user.id;
  const [pendingJobId, setPendingJobId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const trackedByJobKey = useMemo(() => {
    const map = new Map<string, Application["status"]>();
    for (const application of applications) {
      map.set(`${application.company_name}::${application.job_title}`, application.status);
    }
    return map;
  }, [applications]);

  function statusFor(job: Pick<TrackableJob, "company" | "title">) {
    return trackedByJobKey.get(`${job.company}::${job.title}`) ?? null;
  }

  const track = useCallback(
    async (job: TrackableJob, status: "applied" | "saved") => {
      if (!userId) {
        setErrorMessage(t("error.sessionMissing"));
        return false;
      }

      setErrorMessage("");
      setPendingJobId(job.id);

      const { error } = await supabase.from("applications").insert({
        applied_at: status === "applied" ? new Date().toISOString() : null,
        company_name: job.company,
        cover_letter_document_id: null,
        cv_document_id: null,
        deadline: null,
        follow_up_at: null,
        job_description: job.description ?? null,
        job_title: job.title,
        job_url: null,
        location: job.location,
        notes: null,
        offer_amount: null,
        offer_date: null,
        offer_notes: null,
        recruiter_email: null,
        recruiter_name: null,
        recruiter_phone: null,
        rejection_reason: null,
        salary: job.salaryMin !== undefined && job.salaryMax !== undefined ? `${job.salaryMin}-${job.salaryMax}` : null,
        status,
        user_id: userId,
      });

      setPendingJobId("");

      if (error) {
        setErrorMessage(error.message);
        return false;
      }

      return true;
    },
    [t, userId],
  );

  return { errorMessage, pendingJobId, statusFor, track };
}
