import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { MatchRing } from "../../components/app/MatchRing";
import {
  BookmarkIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  CloseIcon,
  SparkleIcon,
} from "../../components/icons/BrandIcons";
import { Card } from "../../components/ui/Card";
import type { JobMatch } from "./matchJob";
import type { MockJob } from "./mockJobs";

// Shared between the real Overview page (ProductHomePage.tsx) and the
// landing page's interactive preview (HeroDashboard.tsx) -- the two are
// meant to look and behave identically, so the filter controls and job-card
// chrome live here once instead of two copies that could drift apart.

export function companyInitials(company: string) {
  return company
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export type FilterOption = { label: string; value: string };

// The plain filter fields (work mode, job type, ...) show the raw value as
// both the option's value and its label; asOptions() is the shorthand for that.
export function asOptions(values: readonly string[]): FilterOption[] {
  return values.map((value) => ({ label: value, value }));
}

// Purely decorative -- a rotating accent per card so the list doesn't read as
// one grey block. Colors carry no meaning (they aren't tied to match score or
// job data), so cycling through them by position is fine. Class names are
// spelled out in full (not built from a template) so Tailwind's scanner picks
// them up.
export const CARD_ACCENTS = [
  { bar: "bg-emerald-400", mark: "bg-emerald-100 text-emerald-800", ring: "border-emerald-200", tint: "bg-emerald-50/50" },
  { bar: "bg-sky-400", mark: "bg-sky-100 text-sky-800", ring: "border-sky-200", tint: "bg-sky-50/50" },
  { bar: "bg-violet-400", mark: "bg-violet-100 text-violet-800", ring: "border-violet-200", tint: "bg-violet-50/50" },
  { bar: "bg-amber-400", mark: "bg-amber-100 text-amber-800", ring: "border-amber-200", tint: "bg-amber-50/50" },
  { bar: "bg-rose-400", mark: "bg-rose-100 text-rose-800", ring: "border-rose-200", tint: "bg-rose-50/50" },
  { bar: "bg-teal-400", mark: "bg-teal-100 text-teal-800", ring: "border-teal-200", tint: "bg-teal-50/50" },
] as const;

// Shared row chrome (accent bar/tint, hover lift+shadow) for a job card.
export const JOB_CARD_CLASSNAME =
  "relative flex items-center gap-3 overflow-hidden rounded-xl border p-3 pl-4 transition-[translate,box-shadow] duration-[var(--duration-fast)] ease-[var(--easing-standard)] hover:-translate-y-1 hover:shadow-card";

export function Panel({ action, children, title }: { action?: ReactNode; children: ReactNode; title: string }) {
  return (
    <Card className="h-full" padding="sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function CompanyMark({ accentClassName, company }: { accentClassName: string; company: string }) {
  return (
    <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${accentClassName}`}>
      {companyInitials(company)}
    </span>
  );
}

// The job-match row used by both the Overview page's "Top matches" panel and
// the landing page's dashboard preview: accent bar, company mark, title/chips
// linking to the job detail page, match ring, and apply/save/dismiss actions.
// Labels are passed in already translated so this stays free of an i18n
// dependency, same as FilterSelect/FilterToggle above.
export function JobMatchCard({
  accentIndex,
  applyAriaLabel,
  dismissAriaLabel,
  isApplied,
  isApplyDisabled,
  isSaveDisabled,
  isSaved,
  job,
  match,
  matchLabel,
  onApply,
  onDismiss,
  onSave,
  saveAriaLabel,
}: {
  accentIndex: number;
  applyAriaLabel: string;
  dismissAriaLabel: string;
  isApplied: boolean;
  isApplyDisabled: boolean;
  isSaveDisabled: boolean;
  isSaved: boolean;
  job: MockJob;
  match: JobMatch;
  matchLabel: string;
  onApply: () => void;
  onDismiss: () => void;
  onSave: () => void;
  saveAriaLabel: string;
}) {
  const accent = CARD_ACCENTS[accentIndex % CARD_ACCENTS.length];

  return (
    <li className={`${JOB_CARD_CLASSNAME} ${accent.ring} ${accent.tint}`}>
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${accent.bar}`} />
      <CompanyMark accentClassName={accent.mark} company={job.company} />
      <Link className="min-w-0 flex-1" to={`/app/jobs/${job.id}`}>
        <span className="block truncate text-sm font-bold">{job.title}</span>
        <span className="block truncate text-xs text-ink-muted">{job.company} · {job.location}</span>
        <span className="mt-1.5 flex flex-wrap gap-1.5">
          {[job.workMode, job.jobType].map((chip) => (
            <span className="rounded-full bg-surface px-2 py-0.5 text-[0.6875rem] font-semibold text-ink" key={chip}>
              {chip}
            </span>
          ))}
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        <p className="hidden text-xs font-bold text-brand-700 sm:block">{matchLabel}</p>
        <MatchRing percent={match.percent} />
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          aria-label={applyAriaLabel}
          className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
            isApplied ? "text-brand-700" : "text-ink-muted hover:bg-surface hover:text-brand-700"
          }`}
          disabled={isApplyDisabled}
          onClick={onApply}
          type="button"
        >
          {isApplied ? <CheckCircleIcon className="size-5" /> : <SparkleIcon className="size-5" />}
        </button>
        <button
          aria-label={saveAriaLabel}
          aria-pressed={isSaved}
          className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
            isSaved ? "text-brand-700" : "text-ink-muted hover:bg-surface hover:text-ink"
          }`}
          disabled={isSaveDisabled}
          onClick={onSave}
          type="button"
        >
          <BookmarkIcon className={isSaved ? "size-5 fill-current" : "size-5"} />
        </button>
        <button
          aria-label={dismissAriaLabel}
          className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-surface hover:text-ink"
          onClick={onDismiss}
          type="button"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
    </li>
  );
}

// A single-select dropdown for one filter field, styled as a pill so the row
// reads as a toolbar rather than a form. Filled in (brand tint + a small (x))
// once a value is picked; otherwise a quiet outline showing the field's name.
export function FilterSelect({
  clearLabel,
  label,
  onChange,
  options,
  value,
}: {
  clearLabel: string;
  label: string;
  onChange: (value: string) => void;
  options: readonly FilterOption[];
  value: string;
}) {
  const isActive = value.length > 0;

  return (
    <div
      className={`inline-flex items-center rounded-full border py-1 pl-3.5 pr-1.5 transition ${
        isActive ? "border-brand-200 bg-brand-50" : "border-line bg-surface hover:border-brand-200 hover:bg-canvas"
      }`}
    >
      <div className="relative flex items-center">
        <select
          aria-label={label}
          className={`min-h-8 cursor-pointer appearance-none bg-transparent py-1 pr-5 text-sm font-semibold outline-none ${
            isActive ? "text-brand-900" : "text-ink-muted"
          }`}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">{label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className={`pointer-events-none absolute right-0 size-3.5 ${isActive ? "text-brand-600" : "text-ink-muted"}`}
        />
      </div>
      {isActive && (
        <button
          aria-label={clearLabel}
          className="ml-1 grid size-6 shrink-0 place-items-center rounded-full text-brand-700 transition hover:bg-brand-100"
          onClick={() => onChange("")}
          type="button"
        >
          <CloseIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// A yes/no filter (e.g. visa sponsorship) only ever has one useful state to
// pick, so a dropdown + separate (x) is one control too many. The whole pill
// is the control here: click it on, click the same pill again to clear it --
// no hunting for a small (x).
export function FilterToggle({ active, label, onToggle }: { active: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border py-1.5 pl-3 pr-3.5 text-sm font-semibold transition ${
        active
          ? "border-brand-200 bg-brand-50 text-brand-900"
          : "border-line bg-surface text-ink-muted hover:border-brand-200 hover:bg-canvas"
      }`}
      onClick={onToggle}
      type="button"
    >
      {active ? (
        <CheckCircleIcon className="size-4 shrink-0 text-brand-600" />
      ) : (
        <span aria-hidden="true" className="size-4 shrink-0 rounded-full border-2 border-line" />
      )}
      {label}
    </button>
  );
}
