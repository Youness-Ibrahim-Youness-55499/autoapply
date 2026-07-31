import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { applicationStatusDetails } from "./applicationStatus";
import {
  interviewStageLabels,
  interviewStages,
  reminderTypeLabels,
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

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Invalid date" : dateFormatter.format(date);
}

function formatDay(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "Invalid date" : dayFormatter.format(date);
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
  const [formError, setFormError] = useState("");

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
      setFormError("Reminder title, type, and date are required.");
      return;
    }
    if (Number.isNaN(new Date(dueAt).getTime())) {
      setFormError("Choose a valid reminder date and time.");
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
      setFormError("Interview stage and date are required.");
      return;
    }
    if (Number.isNaN(new Date(scheduledAt).getTime())) {
      setFormError("Choose a valid interview date and time.");
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
          <p className="eyebrow">Application workflow</p>
          <h3 className="mt-2 text-2xl font-semibold" id="workflow-title">
            {application.job_title} at {application.company_name}
          </h3>
          <p className="mt-2 text-sm text-ink-muted">
            Track dates, reminders, interviews, and status changes.
          </p>
        </div>
        <Button onClick={onClose} size="sm" variant="secondary">Close</Button>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-canvas p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Applied
          </dt>
          <dd className="mt-2 font-semibold">{formatDay(application.applied_at)}</dd>
        </div>
        <div className="rounded-xl border border-line bg-canvas p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Deadline
          </dt>
          <dd className="mt-2 font-semibold">{formatDay(application.deadline)}</dd>
        </div>
        <div className="rounded-xl border border-line bg-canvas p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Follow-up
          </dt>
          <dd className="mt-2 font-semibold">{formatDay(application.follow_up_at)}</dd>
        </div>
      </dl>

      {(application.rejection_reason ||
        application.offer_amount ||
        application.offer_date ||
        application.offer_notes) && (
        <div className="mt-5 rounded-xl border border-line bg-canvas p-5">
          <h4 className="font-semibold">Outcome details</h4>
          {application.rejection_reason && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">
              <strong className="text-ink">Rejection reason:</strong>{" "}
              {application.rejection_reason}
            </p>
          )}
          {(application.offer_amount || application.offer_date) && (
            <p className="mt-2 text-sm text-ink-muted">
              <strong className="text-ink">Offer:</strong>{" "}
              {[application.offer_amount, formatDay(application.offer_date)]
                .filter((value) => value && value !== "Not set")
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
        <p className="mt-8 text-sm text-ink-muted">Loading workflow details…</p>
      ) : errorMessage ? (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
          <Button className="mt-3" onClick={() => void retry()} size="sm" variant="secondary">
            Try again
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
              <h4 className="text-lg font-semibold" id="reminders-title">Reminders</h4>
              {reminders.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-line p-4 text-sm text-ink-muted">
                  No reminders yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {reminders.map((reminder) => (
                    <li className="rounded-xl border border-line bg-canvas p-4" key={reminder.id}>
                      <div className="flex items-start gap-3">
                        <input
                          aria-label={`Mark ${reminder.title} ${reminder.completed_at ? "incomplete" : "complete"}`}
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
                            {reminderTypeLabels[reminder.reminder_type]} ·{" "}
                            {formatDateTime(reminder.due_at)}
                          </p>
                          {reminder.notes && (
                            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">
                              {reminder.notes}
                            </p>
                          )}
                        </div>
                        <Button onClick={() => void deleteReminder(reminder.id)} size="sm" variant="quiet">
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form className="mt-4 rounded-xl border border-line p-4" onSubmit={handleReminderSubmit}>
                <h5 className="font-semibold">Add reminder</h5>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Title
                    <input className={inputClasses} maxLength={160} name="title" required />
                  </label>
                  <label className="text-sm font-semibold">
                    Type
                    <select className={inputClasses} name="reminder_type">
                      {reminderTypes.map((type) => (
                        <option key={type} value={type}>{reminderTypeLabels[type]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Date and time
                    <input className={inputClasses} name="due_at" required type="datetime-local" />
                  </label>
                </div>
                <label className="mt-3 block text-sm font-semibold">
                  Notes
                  <textarea className={`${inputClasses} min-h-20 py-3`} maxLength={2000} name="notes" />
                </label>
                <Button className="mt-4" disabled={isSaving} size="sm" type="submit">
                  {isSaving ? "Saving…" : "Add reminder"}
                </Button>
              </form>
            </section>

            <section aria-labelledby="interviews-title">
              <h4 className="text-lg font-semibold" id="interviews-title">Interviews</h4>
              {interviews.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-line p-4 text-sm text-ink-muted">
                  No interview stages recorded.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {interviews.map((interview) => (
                    <li className="rounded-xl border border-line bg-canvas p-4" key={interview.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{interviewStageLabels[interview.stage]}</p>
                          <p className="mt-1 text-xs text-ink-muted">
                            {formatDateTime(interview.scheduled_at)}
                            {interview.location ? ` · ${interview.location}` : ""}
                          </p>
                          {interview.notes && (
                            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">
                              {interview.notes}
                            </p>
                          )}
                        </div>
                        <Button onClick={() => void deleteInterview(interview.id)} size="sm" variant="quiet">
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form className="mt-4 rounded-xl border border-line p-4" onSubmit={handleInterviewSubmit}>
                <h5 className="font-semibold">Add interview stage</h5>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Stage
                    <select className={inputClasses} name="stage">
                      {interviewStages.map((stage) => (
                        <option key={stage} value={stage}>{interviewStageLabels[stage]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Date and time
                    <input className={inputClasses} name="scheduled_at" required type="datetime-local" />
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Location or meeting link
                    <input className={inputClasses} maxLength={500} name="location" />
                  </label>
                </div>
                <label className="mt-3 block text-sm font-semibold">
                  Notes
                  <textarea className={`${inputClasses} min-h-24 py-3`} maxLength={5000} name="notes" />
                </label>
                <Button className="mt-4" disabled={isSaving} size="sm" type="submit">
                  {isSaving ? "Saving…" : "Add interview"}
                </Button>
              </form>
            </section>
          </div>

          <section aria-labelledby="history-title" className="mt-8 border-t border-line pt-6">
            <h4 className="text-lg font-semibold" id="history-title">Status history</h4>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">No status changes recorded yet.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {history.map((item) => (
                  <li className="flex gap-3 text-sm" key={item.id}>
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-700" />
                    <p>
                      <span className="font-semibold">
                        {item.from_status
                          ? `${applicationStatusDetails[item.from_status].label} → `
                          : "Created as "}
                        {applicationStatusDetails[item.to_status].label}
                      </span>
                      <span className="ml-2 text-ink-muted">{formatDateTime(item.created_at)}</span>
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
