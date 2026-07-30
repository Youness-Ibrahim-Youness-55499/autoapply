import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { Button } from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";
import { applicationStatusDetails } from "./applicationStatus";
import {
  applicationStatuses,
  isApplicationStatus,
  type Application,
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
  const isEditing = Boolean(application);

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

    setIsSubmitting(true);

    const values = {
      applied_at: appliedAt || null,
      company_name: companyName,
      job_title: jobTitle,
      job_url: jobUrlResult.value,
      location: location || null,
      notes: notes || null,
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
                defaultValue={application?.status ?? "saved"}
                name="status"
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
          </div>

          <label className="mt-5 block text-sm font-semibold">
            Notes <span className="font-normal text-ink-muted">(optional)</span>
            <textarea
              className={`${inputClasses} min-h-28 py-3`}
              defaultValue={application?.notes ?? ""}
              maxLength={10000}
              name="notes"
              placeholder="Add useful context about this opportunity."
            />
          </label>
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
