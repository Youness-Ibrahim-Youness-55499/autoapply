import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { Button } from "../../components/ui/Button";
import { useDocuments } from "../documents/useDocuments";
import { supabase } from "../../lib/supabase";
import { applicationStatusDetails } from "./applicationStatus";
import {
  applicationStatuses,
  isApplicationStatus,
  type Application,
  type ApplicationStatus,
} from "./types";

type ApplicationFormProps = {
  application?: Application;
  onCancel: () => void;
  onSaved: () => void;
};

const inputClasses =
  "mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60";

function getSafeOptionalUrl(value: string) {
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

export function ApplicationForm({
  application,
  onCancel,
  onSaved,
}: ApplicationFormProps) {
  const { session } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(
    application?.status ?? "saved",
  );
  const isEditing = Boolean(application);
  const {
    documents,
    isLoading: areDocumentsLoading,
    loadErrorMessage: documentsError,
  } = useDocuments();
  const cvDocuments = documents.filter((document) => document.category === "cv");
  const coverLetterDocuments = documents.filter(
    (document) => document.category === "cover_letter",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const userId = session?.user.id;

    if (!userId) {
      setErrorMessage("Your session is not available. Please log in again.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const companyName = String(formData.get("company_name") ?? "").trim();
    const jobTitle = String(formData.get("job_title") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const jobUrlResult = getSafeOptionalUrl(
      String(formData.get("job_url") ?? "").trim(),
    );
    const status = String(formData.get("status") ?? "");
    const appliedAt = String(formData.get("applied_at") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();
    const jobDescription = String(formData.get("job_description") ?? "").trim();
    const salary = String(formData.get("salary") ?? "").trim();
    const deadline = String(formData.get("deadline") ?? "").trim();
    const recruiterName = String(formData.get("recruiter_name") ?? "").trim();
    const recruiterEmail = String(formData.get("recruiter_email") ?? "").trim();
    const recruiterPhone = String(formData.get("recruiter_phone") ?? "").trim();
    const followUpAt = String(formData.get("follow_up_at") ?? "").trim();
    const rejectionReason = String(formData.get("rejection_reason") ?? "").trim();
    const offerAmount = String(formData.get("offer_amount") ?? "").trim();
    const offerDate = String(formData.get("offer_date") ?? "").trim();
    const offerNotes = String(formData.get("offer_notes") ?? "").trim();
    const cvDocumentId = String(formData.get("cv_document_id") ?? "").trim();
    const coverLetterDocumentId = String(
      formData.get("cover_letter_document_id") ?? "",
    ).trim();

    if (!companyName || !jobTitle) {
      setErrorMessage("Company and job title are required.");
      return;
    }

    if (!isApplicationStatus(status)) {
      setErrorMessage("Choose a valid application status.");
      return;
    }

    if (jobUrlResult.error) {
      setErrorMessage(jobUrlResult.error);
      return;
    }

    if (recruiterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recruiterEmail)) {
      setErrorMessage("Enter a valid recruiter email address.");
      return;
    }

    if (cvDocumentId && !cvDocuments.some((item) => item.id === cvDocumentId)) {
      setErrorMessage("Choose an available CV.");
      return;
    }

    if (
      coverLetterDocumentId &&
      !coverLetterDocuments.some((item) => item.id === coverLetterDocumentId)
    ) {
      setErrorMessage("Choose an available cover letter.");
      return;
    }

    setIsSubmitting(true);

    const values = {
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
    };

    if (application) {
      const { data, error } = await supabase
        .from("applications")
        .update(values)
        .eq("id", application.id)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      if (!data) {
        setErrorMessage("This application could not be found or is no longer available.");
        setIsSubmitting(false);
        return;
      }
    } else {
      const { error } = await supabase.from("applications").insert({
        ...values,
        user_id: userId,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }
    }

    onSaved();
  }

  return (
    <section
      aria-labelledby="application-form-title"
      className="mt-8 max-w-4xl rounded-card border border-brand-200 bg-surface p-6 shadow-card sm:p-8"
      id="application-form"
    >
      <div>
        <p className="eyebrow">{isEditing ? "Update record" : "New record"}</p>
        <h3 className="mt-2 text-2xl font-semibold" id="application-form-title">
          {isEditing ? "Edit application" : "Add an application"}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {isEditing
            ? "Review the saved details and change only what needs updating."
            : "Save the opportunity now. You can update its details and status later."}
        </p>
      </div>

      <form className="mt-7" onSubmit={handleSubmit}>
        <fieldset disabled={isSubmitting}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Company
              <input
                autoFocus
                className={inputClasses}
                defaultValue={application?.company_name}
                maxLength={160}
                name="company_name"
                placeholder="Company name"
                required
              />
            </label>
            <label className="text-sm font-semibold">
              Job title
              <input
                className={inputClasses}
                defaultValue={application?.job_title}
                maxLength={160}
                name="job_title"
                placeholder="Role title"
                required
              />
            </label>
            <label className="text-sm font-semibold">
              Location <span className="font-normal text-ink-muted">(optional)</span>
              <input
                className={inputClasses}
                defaultValue={application?.location ?? ""}
                maxLength={160}
                name="location"
                placeholder="Berlin, Remote..."
              />
            </label>
            <label className="text-sm font-semibold">
              Job link <span className="font-normal text-ink-muted">(optional)</span>
              <input
                className={inputClasses}
                defaultValue={application?.job_url ?? ""}
                maxLength={2048}
                name="job_url"
                placeholder="https://..."
                type="url"
              />
            </label>
            <label className="text-sm font-semibold">
              Status
              <select
                className={inputClasses}
                name="status"
                onChange={(event) => {
                  if (isApplicationStatus(event.target.value)) {
                    setSelectedStatus(event.target.value);
                  }
                }}
                value={selectedStatus}
              >
                {applicationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {applicationStatusDetails[status].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Applied date <span className="font-normal text-ink-muted">(optional)</span>
              <input
                className={inputClasses}
                defaultValue={application?.applied_at ?? ""}
                name="applied_at"
                type="date"
              />
            </label>
            <label className="text-sm font-semibold">
              Salary <span className="font-normal text-ink-muted">(optional)</span>
              <input
                className={inputClasses}
                defaultValue={application?.salary ?? ""}
                maxLength={160}
                name="salary"
                placeholder="€65,000–€75,000"
              />
            </label>
            <label className="text-sm font-semibold">
              Application deadline{" "}
              <span className="font-normal text-ink-muted">(optional)</span>
              <input
                className={inputClasses}
                defaultValue={application?.deadline ?? ""}
                name="deadline"
                type="date"
              />
            </label>
            <label className="text-sm font-semibold">
              Follow-up date{" "}
              <span className="font-normal text-ink-muted">(optional)</span>
              <input
                className={inputClasses}
                defaultValue={application?.follow_up_at ?? ""}
                name="follow_up_at"
                type="date"
              />
            </label>
          </div>

          <label className="mt-5 block text-sm font-semibold">
            Job description{" "}
            <span className="font-normal text-ink-muted">(optional)</span>
            <textarea
              className={`${inputClasses} min-h-52 py-3`}
              defaultValue={application?.job_description ?? ""}
              maxLength={50000}
              name="job_description"
              placeholder="Paste the job description here. Nothing will be fetched automatically."
            />
          </label>

          <label className="mt-5 block text-sm font-semibold">
            Personal notes{" "}
            <span className="font-normal text-ink-muted">(optional)</span>
            <textarea
              className={`${inputClasses} min-h-28 py-3`}
              defaultValue={application?.notes ?? ""}
              maxLength={10000}
              name="notes"
              placeholder="Add useful context about this opportunity."
            />
          </label>

          <div className="mt-7 border-t border-line pt-6">
            <h4 className="text-lg font-semibold">Recruiter or hiring contact</h4>
            <div className="mt-4 grid gap-5 sm:grid-cols-3">
              <label className="text-sm font-semibold">
                Name
                <input
                  className={inputClasses}
                  defaultValue={application?.recruiter_name ?? ""}
                  maxLength={160}
                  name="recruiter_name"
                />
              </label>
              <label className="text-sm font-semibold">
                Email
                <input
                  className={inputClasses}
                  defaultValue={application?.recruiter_email ?? ""}
                  maxLength={254}
                  name="recruiter_email"
                  type="email"
                />
              </label>
              <label className="text-sm font-semibold">
                Phone
                <input
                  className={inputClasses}
                  defaultValue={application?.recruiter_phone ?? ""}
                  maxLength={80}
                  name="recruiter_phone"
                />
              </label>
            </div>
          </div>

          <div className="mt-7 border-t border-line pt-6">
            <h4 className="text-lg font-semibold">Application documents</h4>
            <p className="mt-1 text-sm text-ink-muted">
              Associate private files already stored in your document workspace.
            </p>
            {documentsError && (
              <p className="mt-3 text-sm text-red-700">
                Documents could not be loaded: {documentsError}
              </p>
            )}
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                CV
                <select
                  className={inputClasses}
                  defaultValue={application?.cv_document_id ?? ""}
                  disabled={areDocumentsLoading || Boolean(documentsError)}
                  name="cv_document_id"
                >
                  <option value="">No CV selected</option>
                  {cvDocuments.map((document) => (
                    <option key={document.id} value={document.id}>
                      {document.displayName}
                      {document.isDefault ? " — Default" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Cover letter
                <select
                  className={inputClasses}
                  defaultValue={application?.cover_letter_document_id ?? ""}
                  disabled={areDocumentsLoading || Boolean(documentsError)}
                  name="cover_letter_document_id"
                >
                  <option value="">No cover letter selected</option>
                  {coverLetterDocuments.map((document) => (
                    <option key={document.id} value={document.id}>
                      {document.displayName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {selectedStatus === "rejected" && (
            <label className="mt-7 block border-t border-line pt-6 text-sm font-semibold">
              Rejection reason{" "}
              <span className="font-normal text-ink-muted">
                (saved only when status is Rejected)
              </span>
              <textarea
                className={`${inputClasses} min-h-24 py-3`}
                defaultValue={application?.rejection_reason ?? ""}
                maxLength={5000}
                name="rejection_reason"
              />
            </label>
          )}

          {selectedStatus === "offer" && (
            <div className="mt-7 border-t border-line pt-6">
              <h4 className="text-lg font-semibold">Offer details</h4>
              <p className="mt-1 text-sm text-ink-muted">
                These fields are saved only when the application status is Offer.
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Offer amount
                  <input
                    className={inputClasses}
                    defaultValue={application?.offer_amount ?? ""}
                    maxLength={160}
                    name="offer_amount"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Offer date
                  <input
                    className={inputClasses}
                    defaultValue={application?.offer_date ?? ""}
                    name="offer_date"
                    type="date"
                  />
                </label>
              </div>
              <label className="mt-5 block text-sm font-semibold">
                Offer notes
                <textarea
                  className={`${inputClasses} min-h-24 py-3`}
                  defaultValue={application?.offer_notes ?? ""}
                  maxLength={5000}
                  name="offer_notes"
                />
              </label>
            </div>
          )}
        </fieldset>

        {errorMessage && (
          <p
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button disabled={isSubmitting} onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Saving..."
              : isEditing
                ? "Save changes"
                : "Save application"}
          </Button>
        </div>
      </form>
    </section>
  );
}

