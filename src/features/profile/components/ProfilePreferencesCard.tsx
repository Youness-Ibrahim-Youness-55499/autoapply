import { Badge } from "../../../components/ui/Badge";
import {
  employmentTypeOptions,
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

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type ProfilePreferencesCardProps = {
  onEdit: () => void;
  profile: CandidateProfile;
};

// Named "Role preferences," matching the existing edit form's own
// terminology, rather than the design reference's "Application
// defaults" -- autoapply doesn't auto-fill ATS forms, so that label
// would claim a capability the product doesn't have.
export function ProfilePreferencesCard({ onEdit, profile }: ProfilePreferencesCardProps) {
  return (
    <ProfileSectionCard
      editLabel="Edit"
      icon={PREFERENCES_ICON}
      iconClassName="bg-blue-100 text-blue-700"
      onEdit={onEdit}
      subtitle="The roles and work style you're looking for."
      title="Role preferences"
    >
      <div>
        <p className="eyebrow">Desired roles</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {profile.desiredRoles.length === 0 ? (
            <p className="text-sm text-ink-muted">No desired roles added yet.</p>
          ) : (
            profile.desiredRoles.map((role) => <Badge key={role}>{role}</Badge>)
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">Work style</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {workPreferences.map((preference) => (
            <Badge
              key={preference}
              tone={profile.workPreference === preference ? "active" : "inactive"}
            >
              <span aria-hidden="true">
                {profile.workPreference === preference ? "✓" : "✕"}
              </span>
              {label(preference)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">Employment type</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {employmentTypeOptions.map((type) => {
            const active = profile.employmentTypes.includes(type);
            return (
              <Badge key={type} tone={active ? "active" : "inactive"}>
                <span aria-hidden="true">{active ? "✓" : "✕"}</span>
                {type}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <p className="eyebrow">Relocation</p>
        <div className="mt-2.5">
          <Badge tone={profile.willingToRelocate ? "active" : "inactive"}>
            <span aria-hidden="true">{profile.willingToRelocate ? "✓" : "✕"}</span>
            Can relocate
          </Badge>
        </div>
      </div>
    </ProfileSectionCard>
  );
}
