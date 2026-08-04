import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "../../i18n";
import { applicationStatusDetails } from "./applicationStatus";
import {
  interviewStageLabelKeys,
  interviewStages,
  reminderTypeLabelKeys,
  reminderTypes,
  type Application,
  type InterviewStage,
  type ReminderType,
} from "./types";
import { useApplicationWorkflow } from "./useApplicationWorkflow";

const inputClasses =
  "mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const dayFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

function formatDateTime(value: string, invalidLabel: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? invalidLabel : dateFormatter.format(date);
}

function formatDay(value: string | null, notSetLabel: string, invalidLabel: string) {
  if (!value) return notSetLabel;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? invalidLabel : dayFormatter.format(date);
}

type ApplicationWorkflowPanelProps = {
  application: Application;
  onClose: () => void;
};

export function ApplicationWorkflowPanel({
  application,
  onClose,
}: ApplicationWorkflowPanelProps) {
  const {
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
    retry,
    successMessage,
    toggleReminder,
  } = useApplicationWorkflow(application.id);
  const { t } = useTranslation();
  const [formError, setFormError] = useState("");
  const notSetLabel = t("applications.workflow.notSet");
  const invalidDateLabel = t("applications.workflow.invalidDate");

  async function handleReminderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const form = event.currentTarget;
    const values = new FormData(form);
    const title = String(values.get("title") ?? "").trim();
    const dueAt = String(values.get("due_at") ?? "");
    const type = String(values.get("reminder_type") ?? "") as ReminderType;
    const notes = String(values.get("notes") ?? "");
    if (!title || !dueAt || !reminderTypes.includes(type)) {
      setFormError(t("applications.workflow.reminderRequired"));
      return;
    }
    if (Number.isNaN(new Date(dueAt).getTime())) {
      setFormError(t("applications.workflow.reminderInvalidDate"));
      return;
    }
    if (await addReminder({ dueAt, notes, title, type })) form.reset();
  }

  async function handleInterviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const form = event.currentTarget;
    const values = new FormData(form);
    const scheduledAt = String(values.get("scheduled_at") ?? "");
    const stage = String(values.get("stage") ?? "") as InterviewStage;
    const location = String(values.get("location") ?? "");
    const notes = String(values.get("notes") ?? "");
    if (!scheduledAt || !interviewStages.includes(stage)) {
      setFormError(t("applications.workflow.interviewRequired"));
      return;
    }
    if (Number.isNaN(new Date(scheduledAt).getTime())) {
      setFormError(t("applications.workflow.interviewInvalidDate"));
      return;
    }
    if (await addInterview({ location, notes, scheduledAt, stage })) form.reset();
  }

  return (
    <section
      aria-labelledby="workflow-title"
      className="mt-8 rounded-card border border-brand-200 bg-surface p-6 shadow-card sm:p-8"
      id="application-workflow"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{t("applications.workflow.eyebrow")}</p>
          <h3 className="mt-2 text-2xl font-semibold" id="workflow-title">
            {t("applications.workflow.titleAt", {
              company: application.company_name,
              job: application.job_title,
            })}
          </h3>
          <p className="mt-2 text-sm text-ink-muted">
            {t("applications.workflow.description")}
          </p>
        </div>
        <Button onClick={onClose} size="sm" variant="secondary">{t("common.close")}</Button>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-canvas p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t("applications.workflow.statApplied")}
          </dt>
          <dd className="mt-2 font-semibold">
            {formatDay(application.applied_at, notSetLabel, invalidDateLabel)}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-canvas p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t("applications.workflow.statDeadline")}
          </dt>
          <dd className="mt-2 font-semibold">
            {formatDay(application.deadline, notSetLabel, invalidDateLabel)}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-canvas p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t("applications.workflow.statFollowUp")}
          </dt>
          <dd className="mt-2 font-semibold">
            {formatDay(application.follow_up_at, notSetLabel, invalidDateLabel)}
          </dd>
        </div>
      </dl>

      {(application.rejection_reason ||
        application.offer_amount ||
        application.offer_date ||
        application.offer_notes) && (
        <div className="mt-5 rounded-xl border border-line bg-canvas p-5">
          <h4 className="font-semibold">{t("applications.workflow.outcomeTitle")}</h4>
          {application.rejection_reason && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">
              <strong className="text-ink">{t("applications.workflow.rejectionReasonLabel")}</strong>{" "}
              {application.rejection_reason}
            </p>
          )}
          {(application.offer_amount || application.offer_date) && (
            <p className="mt-2 text-sm text-ink-muted">
              <strong className="text-ink">{t("applications.workflow.offerLabel")}</strong>{" "}
              {[application.offer_amount, formatDay(application.offer_date, notSetLabel, invalidDateLabel)]
                .filter((value) => value && value !== notSetLabel)
                .join(" · ")}
            </p>
          )}
          {application.offer_notes && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">
              {application.offer_notes}
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <p className="mt-8 text-sm text-ink-muted">{t("applications.workflow.loading")}</p>
      ) : errorMessage ? (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
          <Button className="mt-3" onClick={() => void retry()} size="sm" variant="secondary">
            {t("tryAgain")}
          </Button>
        </div>
      ) : (
        <>
          <div aria-live="polite">
            {(successMessage || formError) && (
              <p className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                formError
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-brand-200 bg-brand-50 text-brand-900"
              }`}>
                {formError || successMessage}
              </p>
            )}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <section aria-labelledby="reminders-title">
              <h4 className="text-lg font-semibold" id="reminders-title">{t("applications.workflow.remindersTitle")}</h4>
              {reminders.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-line p-4 text-sm text-ink-muted">
                  {t("applications.workflow.remindersEmpty")}
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {reminders.map((reminder) => (
                    <li className="rounded-xl border border-line bg-canvas p-4" key={reminder.id}>
                      <div className="flex items-start gap-3">
                        <input
                          aria-label={t(
                            reminder.completed_at
                              ? "applications.workflow.markIncomplete"
                              : "applications.workflow.markComplete",
                            { title: reminder.title },
                          )}
                          checked={Boolean(reminder.completed_at)}
                          className="mt-1 size-4 accent-brand-900"
                          onChange={() => void toggleReminder(reminder)}
                          type="checkbox"
                        />
                        <div className="min-w-0 flex-1">
                          <p className={reminder.completed_at ? "font-semibold line-through text-ink-muted" : "font-semibold"}>
                            {reminder.title}
                          </p>
                          <p className="mt-1 text-xs text-ink-muted">
                            {t(reminderTypeLabelKeys[reminder.reminder_type])} ·{" "}
                            {formatDateTime(reminder.due_at, invalidDateLabel)}
                          </p>
                          {reminder.notes && (
                            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">
                              {reminder.notes}
                            </p>
                          )}
                        </div>
                        <Button onClick={() => void deleteReminder(reminder.id)} size="sm" variant="quiet">
                          {t("applications.workflow.delete")}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form className="mt-4 rounded-xl border border-line p-4" onSubmit={handleReminderSubmit}>
                <h5 className="font-semibold">{t("applications.workflow.addReminderTitle")}</h5>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    {t("applications.workflow.titleLabel")}
                    <input className={inputClasses} maxLength={160} name="title" required />
                  </label>
                  <label className="text-sm font-semibold">
                    {t("applications.workflow.typeLabel")}
                    <select className={inputClasses} name="reminder_type">
                      {reminderTypes.map((type) => (
                        <option key={type} value={type}>{t(reminderTypeLabelKeys[type])}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    {t("applications.workflow.dateTimeLabel")}
                    <input className={inputClasses} name="due_at" required type="datetime-local" />
                  </label>
                </div>
                <label className="mt-3 block text-sm font-semibold">
                  {t("applications.workflow.notesLabel")}
                  <textarea className={`${inputClasses} min-h-20 py-3`} maxLength={2000} name="notes" />
                </label>
                <Button className="mt-4" disabled={isSaving} size="sm" type="submit">
                  {isSaving ? t("common.saving") : t("applications.workflow.addReminderSubmit")}
                </Button>
              </form>
            </section>

            <section aria-labelledby="interviews-title">
              <h4 className="text-lg font-semibold" id="interviews-title">{t("applications.workflow.interviewsTitle")}</h4>
              {interviews.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-line p-4 text-sm text-ink-muted">
                  {t("applications.workflow.interviewsEmpty")}
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {interviews.map((interview) => (
                    <li className="rounded-xl border border-line bg-canvas p-4" key={interview.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{t(interviewStageLabelKeys[interview.stage])}</p>
                          <p className="mt-1 text-xs text-ink-muted">
                            {formatDateTime(interview.scheduled_at, invalidDateLabel)}
                            {interview.location ? ` · ${interview.location}` : ""}
                          </p>
                          {interview.notes && (
                            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">
                              {interview.notes}
                            </p>
                          )}
                        </div>
                        <Button onClick={() => void deleteInterview(interview.id)} size="sm" variant="quiet">
                          {t("applications.workflow.delete")}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form className="mt-4 rounded-xl border border-line p-4" onSubmit={handleInterviewSubmit}>
                <h5 className="font-semibold">{t("applications.workflow.addInterviewTitle")}</h5>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    {t("applications.workflow.stageLabel")}
                    <select className={inputClasses} name="stage">
                      {interviewStages.map((stage) => (
                        <option key={stage} value={stage}>{t(interviewStageLabelKeys[stage])}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    {t("applications.workflow.dateTimeLabel")}
                    <input className={inputClasses} name="scheduled_at" required type="datetime-local" />
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    {t("applications.workflow.locationLabel")}
                    <input className={inputClasses} maxLength={500} name="location" />
                  </label>
                </div>
                <label className="mt-3 block text-sm font-semibold">
                  {t("applications.workflow.notesLabel")}
                  <textarea className={`${inputClasses} min-h-24 py-3`} maxLength={5000} name="notes" />
                </label>
                <Button className="mt-4" disabled={isSaving} size="sm" type="submit">
                  {isSaving ? t("common.saving") : t("applications.workflow.addInterviewSubmit")}
                </Button>
              </form>
            </section>
          </div>

          <section aria-labelledby="history-title" className="mt-8 border-t border-line pt-6">
            <h4 className="text-lg font-semibold" id="history-title">{t("applications.workflow.historyTitle")}</h4>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">{t("applications.workflow.historyEmpty")}</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {history.map((item) => (
                  <li className="flex gap-3 text-sm" key={item.id}>
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-700" />
                    <p>
                      <span className="font-semibold">
                        {item.from_status
                          ? `${t(applicationStatusDetails[item.from_status].labelKey)} → `
                          : t("applications.workflow.createdAs")}
                        {t(applicationStatusDetails[item.to_status].labelKey)}
                      </span>
                      <span className="ml-2 text-ink-muted">{formatDateTime(item.created_at, invalidDateLabel)}</span>
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </section>
  );
}
