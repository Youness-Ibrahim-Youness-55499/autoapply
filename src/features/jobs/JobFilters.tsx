import { useState, type ReactNode } from "react";
import { SearchIcon } from "../../components/icons/BrandIcons";
import { useTranslation } from "../../i18n";
import {
  SALARY_MAX,
  SALARY_MIN,
  SALARY_STEP,
  toggleInSet,
  type JobFilterState,
} from "./jobFilterState";
import {
  companySizes,
  experienceLevels,
  jobTypes,
  jobWorkModes,
  type MockJob,
} from "./mockJobs";

type Option = { count: number; value: string };

function buildOptions(values: readonly string[], pick: (job: MockJob) => string, jobs: MockJob[]): Option[] {
  return values.map((value) => ({ count: jobs.filter((job) => pick(job) === value).length, value }));
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function CheckboxList({
  onToggle,
  options,
  selected,
}: {
  onToggle: (value: string) => void;
  options: Option[];
  selected: Set<string>;
}) {
  return (
    <div className="mt-2.5 space-y-2.5">
      {options.map((option) => (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink" key={option.value}>
          <input
            checked={selected.has(option.value)}
            className="size-4 accent-brand-800"
            onChange={() => onToggle(option.value)}
            type="checkbox"
          />
          <span className="flex-1">{option.value}</span>
          <span className="text-xs text-ink-muted">{option.count}</span>
        </label>
      ))}
    </div>
  );
}

function StaticSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="border-t border-line py-4 first:border-t-0 first:pt-0">
      <p className="text-sm font-bold">{title}</p>
      {children}
    </div>
  );
}

function CollapsibleSection({ children, title }: { children: ReactNode; title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-line py-3.5">
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between text-sm font-bold"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {title}
        <svg
          aria-hidden="true"
          className={`size-4 text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </button>
      {isOpen && children}
    </div>
  );
}

function SalarySlider({
  max,
  min,
  onChange,
}: {
  max: number;
  min: number;
  onChange: (min: number, max: number) => void;
}) {
  const { t } = useTranslation();
  const span = SALARY_MAX - SALARY_MIN;
  const left = ((min - SALARY_MIN) / span) * 100;
  const right = 100 - ((max - SALARY_MIN) / span) * 100;

  return (
    <div className="mt-3">
      <div className="dual-range">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ left: `${left}%`, right: `${right}%` }}
        />
        <input
          aria-label={t("jobs.filters.salaryMin")}
          max={SALARY_MAX}
          min={SALARY_MIN}
          onChange={(event) => onChange(Math.min(Number(event.target.value), max), max)}
          step={SALARY_STEP}
          type="range"
          value={min}
        />
        <input
          aria-label={t("jobs.filters.salaryMax")}
          max={SALARY_MAX}
          min={SALARY_MIN}
          onChange={(event) => onChange(min, Math.max(Number(event.target.value), min))}
          step={SALARY_STEP}
          type="range"
          value={max}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-xs font-semibold text-ink-muted">
        <span>€{Math.round(min / 1000)}K</span>
        <span>
          €{Math.round(max / 1000)}K{max >= SALARY_MAX ? "+" : ""}
        </span>
      </div>
    </div>
  );
}

export function JobFilters({
  filters,
  jobs,
  onChange,
  onClear,
}: {
  filters: JobFilterState;
  jobs: MockJob[];
  onChange: (filters: JobFilterState) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const [locationQuery, setLocationQuery] = useState("");

  const locationOptions = buildOptions(
    uniqueSorted(jobs.map((job) => job.location)),
    (job) => job.location,
    jobs,
  ).filter((option) => option.value.toLowerCase().includes(locationQuery.trim().toLowerCase()));
  const industryOptions = buildOptions(uniqueSorted(jobs.map((job) => job.industry)), (job) => job.industry, jobs);
  const skillOptions = jobs
    .flatMap((job) => job.tags)
    .reduce<Option[]>((acc, tag) => {
      const existing = acc.find((option) => option.value === tag);
      if (existing) existing.count += 1;
      else acc.push({ count: 1, value: tag });
      return acc;
    }, [])
    .sort((a, b) => a.value.localeCompare(b.value));

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold">{t("jobs.filters.title")}</h3>
        <button
          className="text-xs font-semibold text-brand-700 hover:text-brand-800"
          onClick={() => {
            setLocationQuery("");
            onClear();
          }}
          type="button"
        >
          {t("jobs.filters.clearAll")}
        </button>
      </div>

      <StaticSection title={t("jobs.filters.workMode")}>
        <CheckboxList
          onToggle={(value) => onChange({ ...filters, workModes: toggleInSet(filters.workModes, value) })}
          options={buildOptions(jobWorkModes, (job) => job.workMode, jobs)}
          selected={filters.workModes}
        />
      </StaticSection>

      <StaticSection title={t("jobs.filters.visaSponsorship")}>
        <CheckboxList
          onToggle={() => onChange({ ...filters, visaSponsorshipOnly: !filters.visaSponsorshipOnly })}
          options={[
            { count: jobs.filter((job) => job.sponsorsVisa).length, value: t("jobs.filters.visaSponsorshipYes") },
          ]}
          selected={filters.visaSponsorshipOnly ? new Set([t("jobs.filters.visaSponsorshipYes")]) : new Set()}
        />
      </StaticSection>

      <StaticSection title={t("jobs.filters.location")}>
        <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2">
          <SearchIcon className="size-4 shrink-0 text-ink-muted" />
          <input
            aria-label={t("jobs.filters.locationSearch")}
            className="w-full min-w-0 border-none bg-transparent text-xs outline-none placeholder:text-ink-muted"
            onChange={(event) => setLocationQuery(event.target.value)}
            placeholder={t("jobs.filters.locationSearch")}
            value={locationQuery}
          />
        </div>
        <CheckboxList
          onToggle={(value) => onChange({ ...filters, locations: toggleInSet(filters.locations, value) })}
          options={locationOptions}
          selected={filters.locations}
        />
      </StaticSection>

      <StaticSection title={t("jobs.filters.jobType")}>
        <CheckboxList
          onToggle={(value) => onChange({ ...filters, jobTypes: toggleInSet(filters.jobTypes, value) })}
          options={buildOptions(jobTypes, (job) => job.jobType, jobs)}
          selected={filters.jobTypes}
        />
      </StaticSection>

      <StaticSection title={t("jobs.filters.salary")}>
        <SalarySlider
          max={filters.salaryMax}
          min={filters.salaryMin}
          onChange={(salaryMin, salaryMax) => onChange({ ...filters, salaryMax, salaryMin })}
        />
      </StaticSection>

      <CollapsibleSection title={t("jobs.filters.experience")}>
        <CheckboxList
          onToggle={(value) => onChange({ ...filters, experienceLevels: toggleInSet(filters.experienceLevels, value) })}
          options={buildOptions(experienceLevels, (job) => job.experienceLevel, jobs)}
          selected={filters.experienceLevels}
        />
      </CollapsibleSection>

      <CollapsibleSection title={t("jobs.filters.companySize")}>
        <CheckboxList
          onToggle={(value) => onChange({ ...filters, companySizes: toggleInSet(filters.companySizes, value) })}
          options={buildOptions(companySizes, (job) => job.companySize, jobs)}
          selected={filters.companySizes}
        />
      </CollapsibleSection>

      <CollapsibleSection title={t("jobs.filters.industry")}>
        <CheckboxList
          onToggle={(value) => onChange({ ...filters, industries: toggleInSet(filters.industries, value) })}
          options={industryOptions}
          selected={filters.industries}
        />
      </CollapsibleSection>

      <CollapsibleSection title={t("jobs.filters.skills")}>
        <CheckboxList
          onToggle={(value) => onChange({ ...filters, skills: toggleInSet(filters.skills, value) })}
          options={skillOptions}
          selected={filters.skills}
        />
      </CollapsibleSection>
    </div>
  );
}
