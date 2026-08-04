import { Button } from "../../components/ui/Button";
import { useTranslation } from "../../i18n";
import { ApplicationStatusControl } from "./ApplicationStatusControl";
import type { Application, ApplicationStatus } from "./types";

type ApplicationListProps = {
  applications: Application[];
  onDelete: (application: Application) => void;
  onEdit: (application: Application) => void;
  onStatusUpdated: (id: string, status: ApplicationStatus) => void;
  onWorkflow: (application: Application) => void;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: string, unavailableLabel: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? unavailableLabel : dateFormatter.format(date);
}

function getSafeJobUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function JobTitle({ application }: { application: Application }) {
  const { t } = useTranslation();
  const jobUrl = getSafeJobUrl(application.job_url);

  if (!jobUrl) {
    return <span className="font-semibold">{application.job_title}</span>;
  }

  return (
    <a
      className="font-semibold text-brand-800 hover:text-brand-600 hover:underline"
      href={jobUrl}
      rel="noreferrer"
      target="_blank"
    >
      {application.job_title}
      <span className="sr-only">
        {t("applications.list.opensInNewTab", { company: application.company_name })}
      </span>
    </a>
  );
}

export function ApplicationList({
  applications,
  onDelete,
  onEdit,
  onStatusUpdated,
  onWorkflow,
}: ApplicationListProps) {
  const { t } = useTranslation();
  const notSpecified = t("applications.list.notSpecified");
  const dateUnavailable = t("applications.list.dateUnavailable");

  return (
    <section aria-labelledby="application-list-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t("applications.list.eyebrow")}</p>
          <h3 className="mt-2 text-xl font-semibold" id="application-list-title">
            {t("applications.title")}
          </h3>
        </div>
        <p className="text-sm font-semibold text-ink-muted">
          {t(applications.length === 1 ? "applications.list.countOne" : "applications.list.countOther", {
            count: applications.length,
          })}
        </p>
      </div>

      <div className="hidden overflow-hidden rounded-card border border-line bg-surface shadow-card md:block">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-6 py-4 font-semibold" scope="col">{t("applications.list.colRole")}</th>
              <th className="px-6 py-4 font-semibold" scope="col">{t("applications.list.colLocation")}</th>
              <th className="px-6 py-4 font-semibold" scope="col">{t("applications.list.colStatus")}</th>
              <th className="px-6 py-4 font-semibold" scope="col">{t("applications.list.colAdded")}</th>
              <th className="px-6 py-4 text-right font-semibold" scope="col">{t("applications.list.colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {applications.map((application) => (
              <tr className="transition hover:bg-canvas/70" key={application.id}>
                <td className="px-6 py-5">
                  <JobTitle application={application} />
                  <p className="mt-1 text-sm text-ink-muted">{application.company_name}</p>
                </td>
                <td className="px-6 py-5 text-sm text-ink-muted">
                  {application.location || notSpecified}
                </td>
                <td className="px-6 py-5">
                  <ApplicationStatusControl
                    application={application}
                    onUpdated={(status) => onStatusUpdated(application.id, status)}
                  />
                </td>
                <td className="px-6 py-5 text-sm text-ink-muted">
                  <time dateTime={application.created_at}>
                    {formatDate(application.created_at, dateUnavailable)}
                  </time>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <Button
                      aria-label={t("applications.list.manageWorkflowAria", {
                        company: application.company_name,
                        job: application.job_title,
                      })}
                      onClick={() => onWorkflow(application)}
                      size="sm"
                      variant="secondary"
                    >
                      {t("applications.list.workflow")}
                    </Button>
                    <Button
                      aria-label={t("applications.list.editAria", {
                        company: application.company_name,
                        job: application.job_title,
                      })}
                      onClick={() => onEdit(application)}
                      size="sm"
                      variant="secondary"
                    >
                      {t("applications.list.edit")}
                    </Button>
                    <Button
                      aria-label={t("applications.list.deleteAria", {
                        company: application.company_name,
                        job: application.job_title,
                      })}
                      onClick={() => onDelete(application)}
                      size="sm"
                      variant="quiet"
                    >
                      {t("applications.list.delete")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {applications.map((application) => (
          <li className="rounded-card border border-line bg-surface p-5 shadow-card" key={application.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <JobTitle application={application} />
                <p className="mt-1 truncate text-sm text-ink-muted">{application.company_name}</p>
              </div>
              <ApplicationStatusControl
                    application={application}
                    onUpdated={(status) => onStatusUpdated(application.id, status)}
                  />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t("applications.list.colLocation")}</dt>
                <dd className="mt-1">{application.location || notSpecified}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t("applications.list.colAdded")}</dt>
                <dd className="mt-1">
                  <time dateTime={application.created_at}>
                    {formatDate(application.created_at, dateUnavailable)}
                  </time>
                </dd>
              </div>
            </dl>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Button onClick={() => onWorkflow(application)} size="sm" variant="secondary">
                {t("applications.list.workflow")}
              </Button>
              <Button
                onClick={() => onEdit(application)}
                size="sm"
                variant="secondary"
              >
                {t("applications.list.edit")}
              </Button>
              <Button
                onClick={() => onDelete(application)}
                size="sm"
                variant="quiet"
              >
                {t("applications.list.delete")}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
