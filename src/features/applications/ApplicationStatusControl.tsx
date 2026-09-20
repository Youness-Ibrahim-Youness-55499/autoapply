import { useEffect, useState, type ChangeEvent } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useTranslation } from "../../i18n";
import { updateApplicationStatus } from "./applicationMutations";
import { applicationStatusDetails } from "./applicationStatus";
import {
  applicationStatuses,
  isApplicationStatus,
  type Application,
  type ApplicationStatus,
} from "./types";

type ApplicationStatusControlProps = {
  application: Application;
  onUpdated: (status: ApplicationStatus) => void;
};

export function ApplicationStatusControl({
  application,
  onUpdated,
}: ApplicationStatusControlProps) {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState(application.status);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const errorId = `status-error-${application.id}`;

  useEffect(() => {
    setSelectedStatus(application.status);
  }, [application.status]);

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value;
    const previousStatus = selectedStatus;
    const userId = session?.user.id;

    setErrorMessage("");

    if (!isApplicationStatus(nextStatus)) {
      setErrorMessage(t("applications.statusControl.invalidStatus"));
      return;
    }

    if (!userId) {
      setErrorMessage(t("error.sessionMissing"));
      return;
    }

    if (nextStatus === previousStatus) {
      return;
    }

    setSelectedStatus(nextStatus);
    setIsSaving(true);

    const result = await updateApplicationStatus(userId, application.id, nextStatus);

    if (!result.ok) {
      setSelectedStatus(previousStatus);
      setErrorMessage(result.message ?? t("applications.statusControl.notFound"));
      setIsSaving(false);
      return;
    }

    onUpdated(nextStatus);
    setIsSaving(false);
  }

  const details = applicationStatusDetails[selectedStatus];

  return (
    <div className="min-w-32">
      <select
        aria-describedby={errorMessage ? errorId : undefined}
        aria-label={t("applications.statusControl.aria", {
          company: application.company_name,
          job: application.job_title,
        })}
        className={`min-h-9 w-full rounded-full border border-transparent px-3 text-xs font-semibold outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-wait disabled:opacity-65 ${details.styles}`}
        disabled={isSaving}
        onChange={handleChange}
        value={selectedStatus}
      >
        {applicationStatuses.map((status) => (
          <option key={status} value={status}>
            {t(applicationStatusDetails[status].labelKey)}
          </option>
        ))}
      </select>
      <div aria-live="polite">
        {isSaving && (
          <p className="mt-1 text-xs text-ink-muted">{t("common.saving")}</p>
        )}
        {errorMessage && (
          <p className="mt-1 max-w-48 text-xs leading-relaxed text-red-700" id={errorId}>
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
