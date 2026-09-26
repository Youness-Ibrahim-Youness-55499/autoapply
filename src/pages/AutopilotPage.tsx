import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  CloseIcon,
  CompaniesIcon,
  DownloadIcon,
  GrowthIcon,
  LocationIcon,
  PeopleIcon,
  SalaryIcon,
  SearchIcon,
  SparkleIcon,
  StarIcon,
  SupportIcon,
  TrustIcon,
  WorkIcon,
  WorkplaceIcon,
} from "../components/icons/BrandIcons";
import { PageContainer } from "../components/layout/PageContainer";
import { Seo } from "../components/Seo";
import { Card } from "../components/ui/Card";
import { DemoBadge } from "../components/ui/DemoBadge";
import { Toggle } from "../components/ui/Toggle";
import { matchJob } from "../features/jobs/matchJob";
import { matchLabelKey } from "../features/jobs/matchLabel";
import { mockJobs } from "../features/jobs/mockJobs";
import { SalarySlider } from "../features/jobs/JobFilters";
import { useProfile } from "../features/profile/useProfile";
import { useTranslation } from "../i18n";

const SAMPLE_MATCH_COUNT = 3;
// Static example figures for the preview panel -- there's no job-scanning
// pipeline behind this yet, so these are clearly marked as sample data
// (DemoBadge) rather than presented as a live estimate.
const PREVIEW_ESTIMATE = { autoApplied: 5, needsApproval: 6, scanned: 4200, strongMatches: 18 };

type AutomationRuleKey = "autoApply" | "needsApproval" | "neverBelow" | "savedAnswers";

const AUTOMATION_RULES: { icon: ReactNode; key: AutomationRuleKey }[] = [
  { icon: <WorkplaceIcon className="size-4" />, key: "autoApply" },
  { icon: <CalendarIcon className="size-4" />, key: "needsApproval" },
  { icon: <CloseIcon className="size-4" />, key: "neverBelow" },
  { icon: <DownloadIcon className="size-4" />, key: "savedAnswers" },
];

function ChipField({
  chips,
  helper,
  icon,
  onAdd,
  onRemove,
  placeholder,
  title,
}: {
  chips: string[];
  helper: string;
  icon: ReactNode;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder: string;
  title: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim();
    if (value && !chips.includes(value)) onAdd(value);
    setDraft("");
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="flex items-start gap-2.5">
        <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center text-ink-muted">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">{helper}</p>
        </div>
      </div>
      {chips.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800"
              key={chip}
            >
              {chip}
              <button aria-label={chip} onClick={() => onRemove(chip)} type="button">
                <CloseIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        className="mt-2.5 w-full truncate rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs outline-none placeholder:text-ink-muted focus-visible:border-brand-400"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        placeholder={placeholder}
        value={draft}
      />
    </div>
  );
}

function RobotIllustration() {
  return (
    <div aria-hidden="true" className="relative hidden h-36 w-32 shrink-0 sm:block">
      <span className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 bg-brand-500" />
      <span className="absolute left-1/2 top-[-2px] size-2.5 -translate-x-1/2 rounded-full bg-brand-400 shadow-[0_0_10px_rgba(16,185,129,.6)]" />
      <div className="absolute left-1/2 top-3 h-16 w-24 -translate-x-1/2 rounded-[28px] border-2 border-brand-700/20 bg-gradient-to-b from-white to-brand-100 shadow-lg">
        <div className="absolute inset-2.5 flex items-center justify-center gap-4 rounded-[22px] bg-brand-950">
          <span className="h-2 w-4 rounded-t-full border-2 border-b-0 border-brand-300" />
          <span className="h-2 w-4 rounded-t-full border-2 border-b-0 border-brand-300" />
        </div>
      </div>
      <div className="absolute left-1/2 top-[4.6rem] h-[4.6rem] w-[4.6rem] -translate-x-1/2 rounded-[28px_28px_20px_20px] border border-brand-100 bg-gradient-to-b from-white to-brand-100" />
      <div className="absolute left-1 top-[4.9rem] h-14 w-9 rotate-[35deg] rounded-full bg-gradient-to-br from-brand-400 to-brand-700" />
      <div className="absolute right-1 top-[4.9rem] h-14 w-9 -rotate-[26deg] rounded-full bg-gradient-to-br from-brand-400 to-brand-700" />

      <span className="absolute right-0 top-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white bg-white/90 px-2 py-1.5 text-[0.625rem] font-bold text-ink shadow-md">
        <SearchIcon className="size-3.5 text-ink-muted" />
        Find jobs
      </span>
      <span className="absolute -right-4 top-14 inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white bg-white/90 px-2 py-1.5 text-[0.625rem] font-bold text-ink shadow-md">
        <StarIcon className="size-3.5 text-accent-gold" />
        Match with AI
      </span>
      <span className="absolute right-0 top-[5.6rem] inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white bg-white/90 px-2 py-1.5 text-[0.625rem] font-bold text-ink shadow-md">
        <WorkIcon className="size-3.5 text-ink-muted" />
        Apply for you
      </span>
    </div>
  );
}

export function AutopilotPage() {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const [roles, setRoles] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState(50000);
  const [salaryMax, setSalaryMax] = useState(120000);
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [sponsorship, setSponsorship] = useState<"yes" | "no" | "open">("open");
  const [excludedCompanies, setExcludedCompanies] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [rules, setRules] = useState<Record<AutomationRuleKey, boolean>>({
    autoApply: true,
    needsApproval: true,
    neverBelow: true,
    savedAnswers: true,
  });
  const [isActive, setIsActive] = useState(false);

  function loadFromProfile() {
    setRoles(profile.desiredRoles);
    setLocations(profile.preferredLocations);
    if (profile.minimumSalary !== null) setSalaryMin(profile.minimumSalary);
    if (profile.maximumSalary !== null) setSalaryMax(profile.maximumSalary);
    setExcludedCompanies(profile.applicationExclusions.blockedCompanies);
    setSkills(profile.skills);
    setSponsorship(profile.workAuthorization === "requires_sponsorship" ? "yes" : profile.workAuthorization ? "no" : "open");
  }

  // Illustrative -- ranked against the same sample catalog the rest of the
  // app uses, so at least the companies/titles/scores are real matches, not
  // invented ones, even though the panel itself is clearly marked as a preview.
  const sampleMatches = useMemo(
    () =>
      mockJobs
        .map((job) => ({ job, match: matchJob(job, profile) }))
        .sort((a, b) => b.match.percent - a.match.percent)
        .slice(0, SAMPLE_MATCH_COUNT),
    [profile],
  );

  return (
    <>
      <Seo description={t("seo.autopilot.description")} noIndex path="/app/autopilot" title={t("nav.autopilot")} />
      <PageContainer className="space-y-5 py-6 sm:py-8 lg:px-8" size="wide">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Jobman <span className="text-brand-700">Autopilot</span>
            </h1>
            <p className="mt-2 text-sm text-ink-muted">{t("autopilot.pageSubtitle")}</p>
          </div>

          <div className="relative flex items-center gap-4 overflow-hidden rounded-card border border-line bg-[linear-gradient(135deg,var(--color-brand-50)_0%,#e6f9f2_55%,#f7f7d9_100%)] p-5">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold leading-tight tracking-tight">
                {t("autopilot.heroTitle")}
                <br />
                <span className="text-brand-700">{t("autopilot.heroTitleAccent")}</span>
              </h2>
              <p className="mt-2.5 max-w-xs text-sm text-ink-muted">{t("autopilot.heroBody")}</p>
            </div>
            <RobotIllustration />
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)]">
          <div className="space-y-5">
            <Card padding="sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    <SparkleIcon className="size-4.5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold tracking-tight">{t("autopilot.preferencesTitle")}</h2>
                    <p className="mt-0.5 text-xs text-ink-muted">{t("autopilot.preferencesSubtitle")}</p>
                  </div>
                </div>
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-canvas"
                  onClick={loadFromProfile}
                  type="button"
                >
                  <PeopleIcon className="size-3.5" />
                  {t("autopilot.loadFromProfile")}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <ChipField
                  chips={roles}
                  helper={t("autopilot.field.rolesHelper")}
                  icon={<WorkIcon className="size-5" />}
                  onAdd={(value) => setRoles((current) => [...current, value])}
                  onRemove={(value) => setRoles((current) => current.filter((item) => item !== value))}
                  placeholder={t("autopilot.field.rolesPlaceholder")}
                  title={t("autopilot.field.rolesTitle")}
                />
                <ChipField
                  chips={locations}
                  helper={t("autopilot.field.locationsHelper")}
                  icon={<LocationIcon className="size-5" />}
                  onAdd={(value) => setLocations((current) => [...current, value])}
                  onRemove={(value) => setLocations((current) => current.filter((item) => item !== value))}
                  placeholder={t("autopilot.field.locationsPlaceholder")}
                  title={t("autopilot.field.locationsTitle")}
                />

                <div className="rounded-xl border border-line bg-surface p-3.5">
                  <div className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center text-ink-muted">
                      <SalaryIcon className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold">{t("autopilot.field.salaryTitle")}</h3>
                      <p className="mt-0.5 text-xs text-ink-muted">{t("autopilot.field.salaryHelper")}</p>
                    </div>
                  </div>
                  <SalarySlider max={salaryMax} min={salaryMin} onChange={(min, max) => { setSalaryMin(min); setSalaryMax(max); }} />
                </div>

                <ChipField
                  chips={workModes}
                  helper={t("autopilot.field.workModeHelper")}
                  icon={<WorkplaceIcon className="size-5" />}
                  onAdd={(value) => setWorkModes((current) => [...current, value])}
                  onRemove={(value) => setWorkModes((current) => current.filter((item) => item !== value))}
                  placeholder={t("autopilot.field.workModePlaceholder")}
                  title={t("autopilot.field.workModeTitle")}
                />
                <ChipField
                  chips={experienceLevels}
                  helper={t("autopilot.field.experienceHelper")}
                  icon={<GrowthIcon className="size-5" />}
                  onAdd={(value) => setExperienceLevels((current) => [...current, value])}
                  onRemove={(value) => setExperienceLevels((current) => current.filter((item) => item !== value))}
                  placeholder={t("autopilot.field.experiencePlaceholder")}
                  title={t("autopilot.field.experienceTitle")}
                />

                <div className="rounded-xl border border-line bg-surface p-3.5">
                  <div className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center text-ink-muted">
                      <SupportIcon className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold">{t("autopilot.field.visaTitle")}</h3>
                      <p className="mt-0.5 text-xs text-ink-muted">{t("autopilot.field.visaHelper")}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 space-y-1.5">
                    {(["yes", "no", "open"] as const).map((value) => (
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ink" key={value}>
                        <input
                          checked={sponsorship === value}
                          className="size-3.5 accent-brand-700"
                          name="autopilot-visa"
                          onChange={() => setSponsorship(value)}
                          type="radio"
                        />
                        {t(`autopilot.field.visa.${value}`)}
                      </label>
                    ))}
                  </div>
                </div>

                <ChipField
                  chips={excludedCompanies}
                  helper={t("autopilot.field.excludedCompaniesHelper")}
                  icon={<CompaniesIcon className="size-5" />}
                  onAdd={(value) => setExcludedCompanies((current) => [...current, value])}
                  onRemove={(value) => setExcludedCompanies((current) => current.filter((item) => item !== value))}
                  placeholder={t("autopilot.field.excludedCompaniesPlaceholder")}
                  title={t("autopilot.field.excludedCompaniesTitle")}
                />
                <ChipField
                  chips={skills}
                  helper={t("autopilot.field.skillsHelper")}
                  icon={<StarIcon className="size-5" />}
                  onAdd={(value) => setSkills((current) => [...current, value])}
                  onRemove={(value) => setSkills((current) => current.filter((item) => item !== value))}
                  placeholder={t("autopilot.field.skillsPlaceholder")}
                  title={t("autopilot.field.skillsTitle")}
                />
              </div>
            </Card>

            <Card padding="sm">
              <div className="flex items-start gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <TrustIcon className="size-4.5" />
                </span>
                <div>
                  <h2 className="text-base font-bold tracking-tight">{t("autopilot.rulesTitle")}</h2>
                  <p className="mt-0.5 text-xs text-ink-muted">{t("autopilot.rulesSubtitle")}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {AUTOMATION_RULES.map(({ icon, key }) => (
                  <div className="rounded-xl border border-line bg-surface p-3.5" key={key}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-bold">
                        <span aria-hidden="true" className="text-brand-700">
                          {icon}
                        </span>
                        {t(`autopilot.rule.${key}.title`)}
                      </span>
                      <Toggle
                        checked={rules[key]}
                        label={t(`autopilot.rule.${key}.title`)}
                        onChange={(checked) => setRules((current) => ({ ...current, [key]: checked }))}
                      />
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">{t(`autopilot.rule.${key}.text`)}</p>
                    <p className="mt-3 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-[0.6875rem] font-semibold text-ink-muted">
                      {t(`autopilot.rule.${key}.foot`)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card padding="sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <SparkleIcon className="size-4.5 text-brand-700" />
                  <h2 className="text-base font-bold tracking-tight">{t("autopilot.preview.title")}</h2>
                </div>
                <DemoBadge />
              </div>
              <p className="mt-1 text-xs text-ink-muted">{t("autopilot.preview.subtitle")}</p>

              <div className="mt-3.5 flex items-center gap-3 rounded-xl border border-line bg-brand-50/60 p-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-brand-700">
                  <SearchIcon className="size-5" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold leading-none">{PREVIEW_ESTIMATE.scanned.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-ink-muted">{t("autopilot.preview.scannedLabel")}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-brand-100 bg-brand-50 p-2.5 text-brand-800">
                  <StarIcon className="size-4" />
                  <p className="mt-1.5 text-lg font-extrabold leading-none">{PREVIEW_ESTIMATE.strongMatches}</p>
                  <p className="mt-1 text-[0.625rem] leading-tight text-ink-muted">{t("autopilot.preview.strongLabel")}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-amber-700">
                  <CalendarIcon className="size-4" />
                  <p className="mt-1.5 text-lg font-extrabold leading-none">{PREVIEW_ESTIMATE.needsApproval}</p>
                  <p className="mt-1 text-[0.625rem] leading-tight text-ink-muted">{t("autopilot.preview.approvalLabel")}</p>
                </div>
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-2.5 text-sky-700">
                  <WorkIcon className="size-4" />
                  <p className="mt-1.5 text-lg font-extrabold leading-none">{PREVIEW_ESTIMATE.autoApplied}</p>
                  <p className="mt-1 text-[0.625rem] leading-tight text-ink-muted">{t("autopilot.preview.autoLabel")}</p>
                </div>
              </div>

              <div className="mt-3.5 rounded-xl border border-line">
                <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
                  <p className="text-xs font-bold">{t("autopilot.preview.matchListTitle")}</p>
                  <Link className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800" to="/app/jobs">
                    {t("dashboard.viewAll")}
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                </div>
                <ul>
                  {sampleMatches.map(({ job, match }) => (
                    <li className="flex items-center gap-2.5 border-b border-line px-3 py-2.5 last:border-b-0" key={job.id}>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas text-xs font-extrabold text-ink">
                        {job.company.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold">{job.title}</span>
                        <span className="block truncate text-[0.6875rem] text-ink-muted">
                          {job.company} · {job.location}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-brand-50 px-2 py-1 text-[0.6875rem] font-bold text-brand-700">
                        {t(matchLabelKey(match.percent))} · {match.percent}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`mt-3.5 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-white transition ${
                  isActive
                    ? "bg-[linear-gradient(135deg,#075d49,#064435)]"
                    : "bg-[linear-gradient(135deg,#06a978,#087653)] hover:brightness-105"
                }`}
                onClick={() => setIsActive((current) => !current)}
                type="button"
              >
                <SparkleIcon className="size-6 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold">
                    {isActive ? t("autopilot.activate.ctaActive") : t("autopilot.activate.cta")}
                  </span>
                  <span className="mt-0.5 block text-xs opacity-90">
                    {isActive ? t("autopilot.activate.bodyActive") : t("autopilot.activate.body")}
                  </span>
                </span>
                <ArrowRightIcon className="size-5 shrink-0" />
              </button>

              <div className="mt-3.5 grid grid-cols-3 gap-2.5 border-t border-line pt-3.5">
                <div className="flex items-start gap-1.5 text-brand-700">
                  <CheckCircleIcon className="size-4 shrink-0" />
                  <span>
                    <span className="block text-[0.6875rem] font-bold text-ink">{t("autopilot.trust.control.title")}</span>
                    <span className="block text-[0.625rem] leading-tight text-ink-muted">{t("autopilot.trust.control.body")}</span>
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-brand-700">
                  <TrustIcon className="size-4 shrink-0" />
                  <span>
                    <span className="block text-[0.6875rem] font-bold text-ink">{t("autopilot.trust.secure.title")}</span>
                    <span className="block text-[0.625rem] leading-tight text-ink-muted">{t("autopilot.trust.secure.body")}</span>
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-brand-700">
                  <SupportIcon className="size-4 shrink-0" />
                  <span>
                    <span className="block text-[0.6875rem] font-bold text-ink">{t("autopilot.trust.ai.title")}</span>
                    <span className="block text-[0.625rem] leading-tight text-ink-muted">{t("autopilot.trust.ai.body")}</span>
                  </span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </PageContainer>
    </>
  );
}
