import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "../../../components/ui/Button";
import {
  employmentTypeOptions,
  workPreferences,
  type CandidateProfile,
  type WorkPreference,
} from "../profile.types";
import { getProfileCompletion } from "../profile.utils";
import { EducationEditor, ExperienceEditor } from "./RepeatableEditors";
import { TagEditor } from "./TagEditor";

const inputClasses =
  "mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const textareaClasses = `${inputClasses} min-h-32 py-3`;

function ProfileSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

type ProfileFormProps = {
  isSaving: boolean;
  onSave: (profile: CandidateProfile) => Promise<boolean>;
  profile: CandidateProfile;
};

export function ProfileForm({
  isSaving,
  onSave,
  profile,
}: ProfileFormProps) {
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  function update(changes: Partial<CandidateProfile>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function toggleEmploymentType(value: string) {
    update({
      employmentTypes: draft.employmentTypes.includes(value)
        ? draft.employmentTypes.filter((item) => item !== value)
        : [...draft.employmentTypes, value],
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const completion = getProfileCompletion(draft);
    await onSave({
      ...draft,
      onboardingCompleted: completion.percentage === 100,
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <fieldset className="space-y-6" disabled={isSaving}>
        <ProfileSection
          description="The essentials recruiters and matching systems use to understand your direction."
          title="About you"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Full name
              <input
                autoComplete="name"
                className={inputClasses}
                maxLength={120}
                onChange={(event) => update({ fullName: event.target.value })}
                required
                value={draft.fullName}
              />
            </label>
            <label className="text-sm font-semibold">
              Professional headline
              <input
                className={inputClasses}
                maxLength={180}
                onChange={(event) => update({ headline: event.target.value })}
                placeholder="Senior frontend engineer"
                value={draft.headline}
              />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Location
              <input
                className={inputClasses}
                maxLength={160}
                onChange={(event) => update({ location: event.target.value })}
                placeholder="Berlin, Germany"
                value={draft.location}
              />
            </label>
          </div>
          <label className="mt-5 block text-sm font-semibold">
            Professional summary
            <textarea
              className={textareaClasses}
              maxLength={2000}
              onChange={(event) =>
                update({ professionalSummary: event.target.value })
              }
              placeholder="Summarize your experience, strengths, and the work you want to do."
              value={draft.professionalSummary}
            />
          </label>
        </ProfileSection>

        <ProfileSection
          description="Define the opportunities Autoapply should prioritize."
          title="Role preferences"
        >
          <TagEditor
            label="Desired roles"
            maxItems={10}
            onChange={(desiredRoles) => update({ desiredRoles })}
            placeholder="e.g. Product designer"
            value={draft.desiredRoles}
          />

          <div className="mt-6">
            <span className="text-sm font-semibold">Work location preference</span>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {workPreferences.map((preference) => (
                <label
                  className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
                    draft.workPreference === preference
                      ? "border-brand-500 bg-brand-50 text-brand-900"
                      : "border-line bg-canvas"
                  }`}
                  key={preference}
                >
                  <input
                    checked={draft.workPreference === preference}
                    className="accent-brand-800"
                    name="work-preference"
                    onChange={() =>
                      update({ workPreference: preference as WorkPreference })
                    }
                    type="radio"
                  />
                  {preference.charAt(0).toUpperCase() + preference.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Employment types</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {employmentTypeOptions.map((type) => (
                <label
                  className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition ${
                    draft.employmentTypes.includes(type)
                      ? "border-brand-500 bg-brand-50 text-brand-900"
                      : "border-line bg-canvas"
                  }`}
                  key={type}
                >
                  <input
                    checked={draft.employmentTypes.includes(type)}
                    className="accent-brand-800"
                    onChange={() => toggleEmploymentType(type)}
                    type="checkbox"
                  />
                  {type}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-6 flex items-center gap-3 text-sm font-semibold">
            <input
              checked={draft.willingToRelocate}
              className="size-4 accent-brand-800"
              onChange={(event) =>
                update({ willingToRelocate: event.target.checked })
              }
              type="checkbox"
            />
            I am willing to relocate
          </label>
        </ProfileSection>

        <ProfileSection
          description="Add the capabilities that should influence job matching and document tailoring."
          title="Skills"
        >
          <TagEditor
            label="Professional skills"
            maxItems={30}
            onChange={(skills) => update({ skills })}
            placeholder="e.g. React"
            value={draft.skills}
          />
        </ProfileSection>

        <ProfileSection
          description="Keep each role structured so achievements can be reused accurately."
          title="Experience"
        >
          <ExperienceEditor
            onChange={(experience) => update({ experience })}
            value={draft.experience}
          />
        </ProfileSection>

        <ProfileSection
          description="Include education and training relevant to your target roles."
          title="Education"
        >
          <EducationEditor
            onChange={(education) => update({ education })}
            value={draft.education}
          />
        </ProfileSection>
      </fieldset>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-card border border-line bg-surface/95 p-4 shadow-xl backdrop-blur sm:px-6">
        <p className="hidden text-sm text-ink-muted sm:block">
          Review your entries before saving.
        </p>
        <Button disabled={isSaving} type="submit">
          {isSaving ? "Saving profile..." : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
