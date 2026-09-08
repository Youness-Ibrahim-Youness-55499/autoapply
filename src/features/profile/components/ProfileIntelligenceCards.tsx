import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { useTranslation } from "../../../i18n";
import type { CandidateProfile } from "../profile.types";
import { ProfileSectionCard } from "./ProfileSectionCard";

const icons = {
  application: <path d="M7 4h10v16H7zM9.5 8h5m-5 4h5m-5 4h3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />,
  eligibility: <path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Zm-3 9 2 2 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />,
  languages: <path d="M4 5h10M9 3v2c0 4-2 7-5 9m3-5c1 2 3 4 5 5m2-5 4 11m2-11-4 11m-1.3-4h4.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />,
};

function Icon({ children }: { children: React.ReactNode }) {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">{children}</svg>;
}

type EditableCardProps = {
  onEdit: () => void;
  profile: CandidateProfile;
};

export function ProfileInterpretationCard({ onEdit, profile }: EditableCardProps) {
  const { t } = useTranslation();
  const roles = profile.desiredRoles.slice(0, 3);
  return (
    <Card className="border-brand-200 bg-gradient-to-br from-white to-brand-50/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-brand-700">{t("profile.interpretation.eyebrow")}</p>
          <h2 className="mt-2 text-xl font-semibold">{t("profile.interpretation.title")}</h2>
        </div>
        <button className="text-sm font-semibold text-brand-800 hover:underline" onClick={onEdit} type="button">
          {t("profile.edit")}
        </button>
      </div>
      <div className="mt-5">
        <p className="text-2xl font-semibold">{profile.headline || t("profile.interpretation.headlineMissing")}</p>
        <p className="mt-1 text-sm text-ink-muted">{profile.location || t("profile.interpretation.locationMissing")}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {profile.skills.slice(0, 6).map((skill) => <Badge key={skill}>{skill}</Badge>)}
        {!profile.skills.length && <p className="text-sm text-ink-muted">{t("profile.interpretation.skillsMissing")}</p>}
      </div>
      <div className="mt-6 border-t border-brand-100 pt-5">
        <p className="eyebrow">{t("profile.interpretation.bestFit")}</p>
        {roles.length ? (
          <ul className="mt-2 space-y-1 text-sm font-semibold">{roles.map((role) => <li key={role}>→ {role}</li>)}</ul>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">{t("profile.interpretation.rolesMissing")}</p>
        )}
      </div>
    </Card>
  );
}

export function MatchingMarketCard() {
  const { t } = useTranslation();
  return (
    <Card>
      <p className="eyebrow">{t("profile.market.eyebrow")}</p>
      <h2 className="mt-2 text-xl font-semibold">{t("profile.market.title")}</h2>
      <div className="mt-5 rounded-xl border border-dashed border-line bg-canvas p-5">
        <p className="font-semibold">{t("profile.market.emptyTitle")}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t("profile.market.emptyDescription")}</p>
      </div>
      <Link className="mt-5 inline-flex text-sm font-semibold text-brand-800 hover:underline" to="/app/applications">
        {t("profile.market.cta")} →
      </Link>
    </Card>
  );
}

export function ProfileLanguagesCard({ onEdit, profile }: EditableCardProps) {
  const { t } = useTranslation();
  return (
    <ProfileSectionCard editLabel={t("profile.edit")} icon={<Icon>{icons.languages}</Icon>} iconClassName="bg-cyan-100 text-cyan-800" onEdit={onEdit} subtitle={t("profile.languages.subtitle")} title={t("profile.languages.title")}>
      {profile.languages.length ? (
        <ul className="space-y-3">
          {profile.languages.map((language) => (
            <li className="flex items-center justify-between gap-3" key={language.id}>
              <span className="font-semibold">{language.name}</span>
              <span className="flex items-center gap-2">
                <Badge>{language.level}</Badge>
                <span className={`text-xs ${language.confirmed ? "text-emerald-700" : "text-amber-700"}`}>
                  {language.confirmed ? t("profile.confidence.confirmed") : t("profile.confidence.needsConfirmation")}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-ink-muted">{t("profile.languages.empty")}</p>}
    </ProfileSectionCard>
  );
}

export function WorkEligibilityCard({ onEdit, profile }: EditableCardProps) {
  const { t } = useTranslation();
  return (
    <ProfileSectionCard editLabel={t("profile.edit")} icon={<Icon>{icons.eligibility}</Icon>} iconClassName="bg-emerald-100 text-emerald-700" onEdit={onEdit} subtitle={t("profile.eligibility.subtitle")} title={t("profile.eligibility.title")}>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div><dt className="eyebrow">{t("profile.eligibility.authorization")}</dt><dd className="mt-1 text-sm font-semibold">{profile.workAuthorization ? t(`profile.authorization.${profile.workAuthorization}`) : t("profile.missing")}</dd></div>
        <div><dt className="eyebrow">{t("profile.eligibility.startDate")}</dt><dd className="mt-1 text-sm font-semibold">{profile.earliestStartDate || t("profile.missing")}</dd></div>
        <div><dt className="eyebrow">{t("profile.eligibility.notice")}</dt><dd className="mt-1 text-sm font-semibold">{profile.noticePeriod || t("profile.missing")}</dd></div>
      </dl>
    </ProfileSectionCard>
  );
}

export function ApplicationPreferencesCard({ onEdit, profile }: EditableCardProps) {
  const { t } = useTranslation();
  return (
    <ProfileSectionCard editLabel={t("profile.edit")} icon={<Icon>{icons.application}</Icon>} iconClassName="bg-brand-100 text-brand-800" onEdit={onEdit} subtitle={t("profile.application.subtitle")} title={t("profile.application.title")}>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div><dt className="eyebrow">{t("profile.application.autoApply")}</dt><dd className="mt-2 flex flex-wrap gap-1.5">{profile.autoApplyLevels.length ? profile.autoApplyLevels.map((level) => <Badge key={level}>{t(`profile.matchLevel.${level}`)}</Badge>) : <span className="text-sm text-ink-muted">{t("profile.missing")}</span>}</dd></div>
        <div><dt className="eyebrow">{t("profile.application.minimumScore")}</dt><dd className="mt-1 text-sm font-semibold">{profile.minimumMatchScore}%</dd></div>
        <div><dt className="eyebrow">{t("profile.application.cvTailoring")}</dt><dd className="mt-1 text-sm font-semibold">{profile.cvTailoring ? t("profile.on") : t("profile.off")}</dd></div>
        <div><dt className="eyebrow">{t("profile.application.coverLetter")}</dt><dd className="mt-1 text-sm font-semibold">{t(`profile.coverLetter.${profile.coverLetterPreference}`)}</dd></div>
      </dl>
    </ProfileSectionCard>
  );
}

export function ApplicationExclusionsCard({ onEdit, profile }: EditableCardProps) {
  const { t } = useTranslation();
  const rules = [
    profile.applicationExclusions.temporaryContracts && t("profile.exclusions.temporary"),
    profile.applicationExclusions.recruitmentAgencies && t("profile.exclusions.agencies"),
    profile.applicationExclusions.jobsBelowSalary && t("profile.exclusions.belowSalary"),
    profile.applicationExclusions.jobsRequiringRelocation && t("profile.exclusions.relocation"),
  ].filter((rule): rule is string => Boolean(rule));
  return (
    <ProfileSectionCard editLabel={t("profile.edit")} icon={<Icon><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></Icon>} iconClassName="bg-red-50 text-red-700" onEdit={onEdit} subtitle={t("profile.exclusions.subtitle")} title={t("profile.exclusions.title")}>
      {rules.length || profile.applicationExclusions.blockedCompanies.length || profile.applicationExclusions.excludedIndustries.length ? (
        <div className="flex flex-wrap gap-2">
          {rules.map((rule) => <Badge key={rule}>{rule}</Badge>)}
          {profile.applicationExclusions.excludedIndustries.map((industry) => <Badge key={industry}>{industry}</Badge>)}
          {profile.applicationExclusions.blockedCompanies.map((company) => <Badge key={company}>{company}</Badge>)}
        </div>
      ) : <p className="text-sm text-ink-muted">{t("profile.exclusions.empty")}</p>}
    </ProfileSectionCard>
  );
}

export function ProfileFutureInsights() {
  const { t } = useTranslation();
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card><p className="eyebrow">{t("profile.competitiveness.eyebrow")}</p><h2 className="mt-2 text-lg font-semibold">{t("profile.competitiveness.title")}</h2><p className="mt-4 text-sm leading-relaxed text-ink-muted">{t("profile.competitiveness.empty")}</p></Card>
      <Card className="border-brand-200 bg-brand-50/50"><p className="eyebrow text-brand-700">{t("profile.insight.eyebrow")}</p><h2 className="mt-2 text-lg font-semibold">{t("profile.insight.title")}</h2><p className="mt-4 text-sm leading-relaxed text-ink-muted">{t("profile.insight.empty")}</p></Card>
    </div>
  );
}
