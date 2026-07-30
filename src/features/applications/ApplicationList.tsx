import type { Application, ApplicationStatus } from "./types";

type ApplicationListProps = {
  applications: Application[];
};

const statusDetails: Record<
  ApplicationStatus,
  { label: string; styles: string }
> = {
  saved: { label: "Saved", styles: "bg-slate-100 text-slate-700" },
  applied: { label: "Applied", styles: "bg-blue-50 text-blue-700" },
  interview: { label: "Interview", styles: "bg-violet-50 text-violet-700" },
  offer: { label: "Offer", styles: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", styles: "bg-red-50 text-red-700" },
  withdrawn: { label: "Withdrawn", styles: "bg-amber-50 text-amber-800" },
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : dateFormatter.format(date);
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

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const details = statusDetails[status];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${details.styles}`}>
      {details.label}
    </span>
  );
}

function JobTitle({ application }: { application: Application }) {
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
      <span className="sr-only"> at {application.company_name} (opens in a new tab)</span>
    </a>
  );
}

export function ApplicationList({ applications }: ApplicationListProps) {
  return (
    <section aria-labelledby="application-list-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your records</p>
          <h3 className="mt-2 text-xl font-semibold" id="application-list-title">
            Applications
          </h3>
        </div>
        <p className="text-sm font-semibold text-ink-muted">
          {applications.length} {applications.length === 1 ? "application" : "applications"}
        </p>
      </div>

      <div className="hidden overflow-hidden rounded-card border border-line bg-surface shadow-card md:block">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-6 py-4 font-semibold" scope="col">Role</th>
              <th className="px-6 py-4 font-semibold" scope="col">Location</th>
              <th className="px-6 py-4 font-semibold" scope="col">Status</th>
              <th className="px-6 py-4 font-semibold" scope="col">Added</th>
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
                  {application.location || "Not specified"}
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={application.status} />
                </td>
                <td className="px-6 py-5 text-sm text-ink-muted">
                  <time dateTime={application.created_at}>{formatDate(application.created_at)}</time>
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
              <StatusBadge status={application.status} />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Location</dt>
                <dd className="mt-1">{application.location || "Not specified"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Added</dt>
                <dd className="mt-1">
                  <time dateTime={application.created_at}>{formatDate(application.created_at)}</time>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
