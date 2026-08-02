import { isApplicationStatus, type ApplicationStatus } from "./types";

export type ApplicationFormValues = {
  applied_at: string | null;
  company_name: string;
  cover_letter_document_id: string | null;
  cv_document_id: string | null;
  deadline: string | null;
  follow_up_at: string | null;
  job_description: string | null;
  job_title: string;
  job_url: string | null;
  location: string | null;
  notes: string | null;
  offer_amount: string | null;
  offer_date: string | null;
  offer_notes: string | null;
  recruiter_email: string | null;
  recruiter_name: string | null;
  recruiter_phone: string | null;
  rejection_reason: string | null;
  salary: string | null;
  status: ApplicationStatus;
};

export type ApplicationFormContext = {
  availableCoverLetterDocumentIds: string[];
  availableCvDocumentIds: string[];
};

export type ApplicationFormParseResult =
  | { error: string; success: false }
  | { success: true; values: ApplicationFormValues };

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function getSafeOptionalUrl(value: string): { error: string; value: string | null } {
  if (!value) {
    return { error: "", value: null };
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { error: "Use an HTTP or HTTPS job link.", value: null };
    }

    return { error: "", value: url.href };
  } catch {
    return {
      error: "Enter a complete job link, such as https://example.com/job.",
      value: null,
    };
  }
}

const recruiterEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Parses and validates raw <form> FormData for an application record into
 * the shape the applications table expects. Pure and framework-free so it
 * can be tested without rendering ApplicationForm or mocking Supabase.
 */
export function parseApplicationFormInput(
  formData: FormData,
  context: ApplicationFormContext,
): ApplicationFormParseResult {
  const companyName = readField(formData, "company_name");
  const jobTitle = readField(formData, "job_title");
  const location = readField(formData, "location");
  const jobUrlResult = getSafeOptionalUrl(readField(formData, "job_url"));
  const status = readField(formData, "status");
  const appliedAt = readField(formData, "applied_at");
  const notes = readField(formData, "notes");
  const jobDescription = readField(formData, "job_description");
  const salary = readField(formData, "salary");
  const deadline = readField(formData, "deadline");
  const recruiterName = readField(formData, "recruiter_name");
  const recruiterEmail = readField(formData, "recruiter_email");
  const recruiterPhone = readField(formData, "recruiter_phone");
  const followUpAt = readField(formData, "follow_up_at");
  const rejectionReason = readField(formData, "rejection_reason");
  const offerAmount = readField(formData, "offer_amount");
  const offerDate = readField(formData, "offer_date");
  const offerNotes = readField(formData, "offer_notes");
  const cvDocumentId = readField(formData, "cv_document_id");
  const coverLetterDocumentId = readField(formData, "cover_letter_document_id");

  if (!companyName || !jobTitle) {
    return { error: "Company and job title are required.", success: false };
  }

  if (!isApplicationStatus(status)) {
    return { error: "Choose a valid application status.", success: false };
  }

  if (jobUrlResult.error) {
    return { error: jobUrlResult.error, success: false };
  }

  if (recruiterEmail && !recruiterEmailPattern.test(recruiterEmail)) {
    return { error: "Enter a valid recruiter email address.", success: false };
  }

  if (cvDocumentId && !context.availableCvDocumentIds.includes(cvDocumentId)) {
    return { error: "Choose an available CV.", success: false };
  }

  if (
    coverLetterDocumentId &&
    !context.availableCoverLetterDocumentIds.includes(coverLetterDocumentId)
  ) {
    return { error: "Choose an available cover letter.", success: false };
  }

  return {
    success: true,
    values: {
      applied_at: appliedAt || null,
      company_name: companyName,
      cover_letter_document_id: coverLetterDocumentId || null,
      cv_document_id: cvDocumentId || null,
      deadline: deadline || null,
      follow_up_at: followUpAt || null,
      job_description: jobDescription || null,
      job_title: jobTitle,
      job_url: jobUrlResult.value,
      location: location || null,
      notes: notes || null,
      offer_amount: status === "offer" ? offerAmount || null : null,
      offer_date: status === "offer" ? offerDate || null : null,
      offer_notes: status === "offer" ? offerNotes || null : null,
      recruiter_email: recruiterEmail || null,
      recruiter_name: recruiterName || null,
      recruiter_phone: recruiterPhone || null,
      rejection_reason: status === "rejected" ? rejectionReason || null : null,
      salary: salary || null,
      status,
    },
  };
}
