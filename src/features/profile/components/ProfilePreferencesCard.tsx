import { Badge } from "../../../components/ui/Badge";
import { useTranslation } from "../../../i18n";
import {
  applicationModeLabelKeys,
  employmentTypeLabelKeys,
  employmentTypeOptions,
  visaStatusLabelKeys,
  workPreferenceLabelKeys,
  workPreferences,
  type CandidateProfile,
} from "../profile.types";
import { ProfileSectionCard } from "./ProfileSectionCard";

const PREFERENCES_ICON = (
  <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
    <path d="M4 7h10m-4 10h10M4 17h2m10-10h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    <circle cx="8" cy="7" r="2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="16" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

type ProfilePreferencesCardProps = {
  onEdit: () => void;
  profile: CandidateProfile;
};

// Named "Role preferences," matching the existing edit form's own
// terminology, rather than the design reference's "Application
// defaults" -- autoapply doesn't auto-fill ATS forms, so that label
// would claim a capability the product doesn't have.
export function ProfilePreferencesCard({ onEdit, profile }: ProfilePreferencesCardProps) {
  const { t } = useTranslation();

  return (
    <ProfileSectionCard
      editLabel={t("profile.edit")}
      icon={PREFERENCES_ICON}
      iconClassName="bg-blue-100 text-blue-700"
      onEdit={onEdit}
      subtitle={t("profile.preferences.subtitle")}
      title={t("profile.preferences.title")}
    >
      <div>
        <p className="eyebrow">{t("profile.preferences.desiredRoles")}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {profile.desiredRoles.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("profile.preferences.desiredRolesEmpty")}</p>
          ) : (
            profile.desiredRoles.map((role) => <Badge key={role}>{role}</Badge>)
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">{t("profile.preferences.locations")}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {profile.preferredLocations.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("profile.preferences.locationsEmpty")}</p>
          ) : (
            profile.preferredLocations.map((location) => <Badge key={location}>{location}</Badge>)
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">{t("profile.preferences.workStyle")}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {workPreferences.map((preference) => {
            const active = profile.workPreference === preference;
            return (
              <Badge key={preference} tone={active ? "active" : "inactive"}>
                <span aria-hidden="true">{active ? "✓" : "✕"}</span>
                {t(workPreferenceLabelKeys[preference])}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">{t("profile.preferences.employmentType")}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {employmentTypeOptions.map((type) => {
            const active = profile.employmentTypes.includes(type);
            return (
              <Badge key={type} tone={active ? "active" : "inactive"}>
                <span aria-hidden="true">{active ? "✓" : "✕"}</span>
                {t(employmentTypeLabelKeys[type])}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">{t("profile.preferences.minimumSalary")}</p>
        <div className="mt-2.5">
          <p className="text-sm text-ink-muted">
            {profile.minimumSalary === null
              ? t("profile.preferences.minimumSalaryEmpty")
              : profile.minimumSalary.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">{t("profile.preferences.visaStatus")}</p>
        <div className="mt-2.5">
          <Badge>{t(visaStatusLabelKeys[profile.visaStatus])}</Badge>
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">{t("profile.preferences.languages")}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {profile.preferredLanguages.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("profile.preferences.languagesEmpty")}</p>
          ) : (
            profile.preferredLanguages.map((language) => <Badge key={language}>{language}</Badge>)
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">{t("profile.preferences.relocation")}</p>
        <div className="mt-2.5">
          <Badge tone={profile.willingToRelocate ? "active" : "inactive"}>
            <span aria-hidden="true">{profile.willingToRelocate ? "✓" : "✕"}</span>
            {t("profile.preferences.canRelocate")}
          </Badge>
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">{t("profile.preferences.excludedCompanies")}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {profile.excludedCompanies.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("profile.preferences.excludedCompaniesEmpty")}</p>
          ) : (
            profile.excludedCompanies.map((company) => <Badge key={company}>{company}</Badge>)
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">{t("profile.preferences.excludedIndustries")}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {profile.excludedIndustries.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("profile.preferences.excludedIndustriesEmpty")}</p>
          ) : (
            profile.excludedIndustries.map((industry) => <Badge key={industry}>{industry}</Badge>)
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">{t("profile.preferences.applicationMode")}</p>
        <div className="mt-2.5">
          <Badge>{t(applicationModeLabelKeys[profile.applicationMode])}</Badge>
        </div>
      </div>
    </ProfileSectionCard>
  );
}
