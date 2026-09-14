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
        <div className="space-y-5">
          <div>
            <p className="eyebrow">{t("profile.skills.strong")}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {skills.slice(0, 5).map((skill) => <Badge key={skill} tone="active">{skill}</Badge>)}
            </div>
          </div>
          {skills.length > 5 && <div><p className="eyebrow">{t("profile.skills.additional")}</p><div className="mt-2.5 flex flex-wrap gap-2">{skills.slice(5).map((skill) => <Badge key={skill}>{skill}</Badge>)}</div></div>}
          <div className="rounded-xl border border-dashed border-line bg-canvas p-4">
            <p className="text-sm font-semibold">{t("profile.skills.marketTitle")}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{t("profile.skills.marketEmpty")}</p>
          </div>
        </div>
      )}
    </ProfileSectionCard>
  );
}
