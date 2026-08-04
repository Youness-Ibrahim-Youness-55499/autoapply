import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "../../i18n";
import { useDocuments } from "../documents/useDocuments";
import { useTemplates } from "../templates/useTemplates";
import { useApplicationChecklist } from "../checklists/useApplicationChecklist";
import { supabase } from "../../lib/supabase";
import { applicationStatusDetails } from "./applicationStatus";
import { parseApplicationFormInput } from "./applicationFormInput";
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

export function ApplicationForm({
  application,
  onCancel,
  onSaved,
}: ApplicationFormProps) {
  const { session } = useAuth();
  const { t } = useTranslation();
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
  const { templates } = useTemplates();

  const { checklist, createOrUpdate: updateChecklist } = useApplicationChecklist(application?.id);
  const cvDocuments = documents.filter((document) => document.category === "cv");
  const coverLetterDocuments = documents.filter(
    (document) => document.category === "cover_letter",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const userId = session?.user.id;

    if (!userId) {
      setErrorMessage(t("error.sessionMissing"));
      return;
    }

    const formData = new FormData(event.currentTarget);
    const parseResult = parseApplicationFormInput(formData, {
      availableCoverLetterDocumentIds: coverLetterDocuments.map((document) => document.id),
      availableCvDocumentIds: cvDocuments.map((document) => document.id),
    });

    if (!parseResult.success) {
      setErrorMessage(t(parseResult.error));
      return;
    }

    setIsSubmitting(true);

    const values = parseResult.values;

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
        setErrorMessage(t("applications.form.notFoundOnUpdate"));
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
        <p className="eyebrow">{t(isEditing ? "applications.form.eyebrowEdit" : "applications.form.eyebrowNew")}</p>
        <h3 className="mt-2 text-2xl font-semibold" id="application-form-title">
          {t(isEditing ? "applications.form.titleEdit" : "applications.form.titleNew")}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {t(isEditing ? "applications.form.descriptionEdit" : "applications.form.descriptionNew")}
        </p>
      </div>

      <form className="mt-7" onSubmit={handleSubmit}>
        <fieldset disabled={isSubmitting}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              {t("applications.form.companyLabel")}
              <input
                autoFocus
                className={inputClasses}
                defaultValue={application?.company_name}
                maxLength={160}
                name="company_name"
                placeholder={t("applications.form.companyPlaceholder")}
                required
              />
            </label>
            <label className="text-sm font-semibold">
              {t("applications.form.jobTitleLabel")}
              <input
                className={inputClasses}
                defaultValue={application?.job_title}
                maxLength={160}
                name="job_title"
                placeholder={t("applications.form.jobTitlePlaceholder")}
                required
              />
            </label>
            <label className="text-sm font-semibold">
              {t("applications.form.locationLabel")}{" "}
              <span className="font-normal text-ink-muted">{t("common.optional")}</span>
              <input
                className={inputClasses}
                defaultValue={application?.location ?? ""}
                maxLength={160}
                name="location"
                placeholder={t("applications.form.locationPlaceholder")}
              />
            </label>
            <label className="text-sm font-semibold">
              {t("applications.form.jobLinkLabel")}{" "}
              <span className="font-normal text-ink-muted">{t("common.optional")}</span>
              <input
                className={inputClasses}
                defaultValue={application?.job_url ?? ""}
                maxLength={2048}
                name="job_url"
                placeholder={t("applications.form.jobLinkPlaceholder")}
                type="url"
              />
            </label>
            <label className="text-sm font-semibold">
              {t("status.label")}
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
                    {t(applicationStatusDetails[status].labelKey)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              {t("applications.form.appliedDateLabel")}{" "}
              <span className="font-normal text-ink-muted">{t("common.optional")}</span>
              <input
                className={inputClasses}
                defaultValue={application?.applied_at ?? ""}
                name="applied_at"
                type="date"
              />
            </label>
            <label className="text-sm font-semibold">
              {t("applications.form.salaryLabel")}{" "}
              <span className="font-normal text-ink-muted">{t("common.optional")}</span>
              <input
                className={inputClasses}
                defaultValue={application?.salary ?? ""}
                maxLength={160}
                name="salary"
                placeholder={t("applications.form.salaryPlaceholder")}
              />
            </label>
            <label className="text-sm font-semibold">
              {t("applications.form.deadlineLabel")}{" "}
              <span className="font-normal text-ink-muted">{t("common.optional")}</span>
              <input
                className={inputClasses}
                defaultValue={application?.deadline ?? ""}
                name="deadline"
                type="date"
              />
            </label>
            <label className="text-sm font-semibold">
              {t("applications.form.followUpLabel")}{" "}
              <span className="font-normal text-ink-muted">{t("common.optional")}</span>
              <input
                className={inputClasses}
                defaultValue={application?.follow_up_at ?? ""}
                name="follow_up_at"
                type="date"
              />
            </label>
          </div>

          <label className="mt-5 block text-sm font-semibold">
            {t("applications.form.jobDescriptionLabel")}{" "}
            <span className="font-normal text-ink-muted">{t("common.optional")}</span>
            <textarea
              className={`${inputClasses} min-h-52 py-3`}
              defaultValue={application?.job_description ?? ""}
              maxLength={50000}
              name="job_description"
              placeholder={t("applications.form.jobDescriptionPlaceholder")}
            />
          </label>

          <label className="mt-5 block text-sm font-semibold">
            {t("applications.form.notesLabel")}{" "}
            <span className="font-normal text-ink-muted">{t("common.optional")}</span>
            <textarea
              className={`${inputClasses} min-h-28 py-3`}
              defaultValue={application?.notes ?? ""}
              maxLength={10000}
              name="notes"
              placeholder={t("applications.form.notesPlaceholder")}
            />
          </label>

          <div className="mt-7 border-t border-line pt-6">
            <h4 className="text-lg font-semibold">{t("applications.form.recruiterHeading")}</h4>
            <div className="mt-4 grid gap-5 sm:grid-cols-3">
              <label className="text-sm font-semibold">
                {t("applications.form.recruiterNameLabel")}
                <input
                  className={inputClasses}
                  defaultValue={application?.recruiter_name ?? ""}
                  maxLength={160}
                  name="recruiter_name"
                />
              </label>
              <label className="text-sm font-semibold">
                {t("applications.form.recruiterEmailLabel")}
                <input
                  className={inputClasses}
                  defaultValue={application?.recruiter_email ?? ""}
                  maxLength={254}
                  name="recruiter_email"
                  type="email"
                />
              </label>
              <label className="text-sm font-semibold">
                {t("applications.form.recruiterPhoneLabel")}
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
            <h4 className="text-lg font-semibold">{t("applications.form.documentsHeading")}</h4>
            <p className="mt-1 text-sm text-ink-muted">
              {t("applications.form.documentsDescription")}
            </p>
            {documentsError && (
              <p className="mt-3 text-sm text-red-700">
                {t("applications.form.documentsLoadError", { error: documentsError })}
              </p>
            )}
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                {t("applications.form.cvLabel")}
                <select
                  className={inputClasses}
                  defaultValue={application?.cv_document_id ?? ""}
                  disabled={areDocumentsLoading || Boolean(documentsError)}
                  name="cv_document_id"
                >
                  <option value="">{t("applications.form.noCvSelected")}</option>
                  {cvDocuments.map((document) => (
                    <option key={document.id} value={document.id}>
                      {document.displayName}
                      {document.isDefault ? t("applications.form.defaultSuffix") : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                {t("applications.form.coverLetterLabel")}
                <select
                  className={inputClasses}
                  defaultValue={application?.cover_letter_document_id ?? ""}
                  disabled={areDocumentsLoading || Boolean(documentsError)}
                  name="cover_letter_document_id"
                >
                  <option value="">{t("applications.form.noCoverLetterSelected")}</option>
                  {coverLetterDocuments.map((document) => (
                    <option key={document.id} value={document.id}>
                      {document.displayName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 border-t border-line pt-6">
              <h4 className="text-lg font-semibold">{t("applications.form.checklistHeading")}</h4>
              <p className="mt-1 text-sm text-ink-muted">{t("applications.form.checklistDescription")}</p>

              {application ? (
                <div className="mt-4 grid gap-3">
                  {[
                    ["cv_selected", "applications.form.checklistCvSelected"],
                    ["cover_letter_prepared", "applications.form.checklistCoverLetterPrepared"],
                    ["contact_details_reviewed", "applications.form.checklistContactDetailsReviewed"],
                    ["screening_completed", "applications.form.checklistScreeningCompleted"],
                    ["job_description_saved", "applications.form.checklistJobDescriptionSaved"],
                    ["final_review_completed", "applications.form.checklistFinalReviewCompleted"],
                    ["submission_confirmed", "applications.form.checklistSubmissionConfirmed"],
                  ].map(([key, labelKey]) => {
                    const k = key as keyof typeof checklist & string;
                    const checked = (checklist as any)?.[k] ?? false;

                    return (
                      <label key={String(key)} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={async (e) => {
                            try {
                              await updateChecklist({ [k]: e.target.checked });
                            } catch (err) {
                              // eslint-disable-next-line no-console
                              console.error(err);
                            }
                          }}
                        />
                        <span className="text-sm">{t(labelKey)}</span>
                      </label>
                    );
                  })}

                  <div className="mt-2 text-sm text-ink-muted">
                    {application ? (() => {
                      const items = [
                        checklist?.cv_selected,
                        checklist?.cover_letter_prepared,
                        checklist?.contact_details_reviewed,
                        checklist?.screening_completed,
                        checklist?.job_description_saved,
                        checklist?.final_review_completed,
                        checklist?.submission_confirmed,
                      ];
                      const done = items.filter(Boolean).length;
                      const total = items.length;
                      return t("applications.form.checklistCompletion", {
                        done,
                        percent: Math.round((done / total) * 100),
                        total,
                      });
                    })() : "—"}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">{t("applications.form.checklistSaveToEnable")}</p>
              )}
            </div>
          </div>

          {selectedStatus === "rejected" && (
            <label className="mt-7 block border-t border-line pt-6 text-sm font-semibold">
              {t("applications.form.rejectionReasonLabel")}{" "}
              <span className="font-normal text-ink-muted">
                {t("applications.form.rejectionReasonHint")}
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
              <h4 className="text-lg font-semibold">{t("applications.form.offerHeading")}</h4>
              <p className="mt-1 text-sm text-ink-muted">
                {t("applications.form.offerDescription")}
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  {t("applications.form.offerAmountLabel")}
                  <input
                    className={inputClasses}
                    defaultValue={application?.offer_amount ?? ""}
                    maxLength={160}
                    name="offer_amount"
                  />
                </label>
                <label className="text-sm font-semibold">
                  {t("applications.form.offerDateLabel")}
                  <input
                    className={inputClasses}
                    defaultValue={application?.offer_date ?? ""}
                    name="offer_date"
                    type="date"
                  />
                </label>
              </div>
              <label className="mt-5 block text-sm font-semibold">
                {t("applications.form.offerNotesLabel")}
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
            {t("applications.form.cancel")}
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting
              ? isEditing
                ? t("applications.form.updating")
                : t("common.saving")
              : isEditing
                ? t("applications.form.saveChanges")
                : t("applications.form.saveApplication")}
          </Button>
        </div>
      </form>
    </section>
  );
}
