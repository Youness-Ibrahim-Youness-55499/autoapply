import { Badge } from "../../../components/ui/Badge";
import { useTranslation } from "../../../i18n";
import { ProfileSectionCard } from "./ProfileSectionCard";

const SKILLS_ICON = (
  <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
    <path d="m9 8-4 4 4 4m6-8 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
  </svg>
);

type ProfileSkillsCardProps = {
  onEdit: () => void;
  skills: string[];
};

// Flat list only -- the design reference this card is modeled after
// groups skills into categories (Programming languages, Frameworks,
// etc.), but autoapply's profiles.skills column stores a single flat
// text[] with no category field anywhere in the schema. Inventing
// categories would mean guessing at data that doesn't exist; showing
// them flat is the honest read of what's actually stored.
export function ProfileSkillsCard({ onEdit, skills }: ProfileSkillsCardProps) {
  const { t } = useTranslation();

  return (
    <ProfileSectionCard
      editLabel={t("profile.edit")}
      icon={SKILLS_ICON}
      iconClassName="bg-brand-100 text-brand-800"
      onEdit={onEdit}
      subtitle={t(skills.length === 1 ? "profile.skills.subtitleOne" : "profile.skills.subtitleOther", {
        count: skills.length,
      })}
      title={t("profile.skills.title")}
    >
      {skills.length === 0 ? (
        <p className="text-sm text-ink-muted">{t("profile.skills.empty")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
      )}
    </ProfileSectionCard>
  );
}
