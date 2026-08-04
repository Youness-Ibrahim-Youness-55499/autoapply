import { useTranslation } from "../../../i18n";
import type {
  EducationEntry,
  ExperienceEntry,
} from "../profile.types";

const inputClasses =
  "mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const textareaClasses = `${inputClasses} min-h-24 py-3`;

function entryId() {
  return crypto.randomUUID();
}

type ExperienceEditorProps = {
  onChange: (entries: ExperienceEntry[]) => void;
  value: ExperienceEntry[];
};

export function ExperienceEditor({ onChange, value }: ExperienceEditorProps) {
  const { t } = useTranslation();

  function update(id: string, changes: Partial<ExperienceEntry>) {
    onChange(
      value.map((entry) =>
        entry.id === id ? { ...entry, ...changes } : entry,
      ),
    );
  }

  function add() {
    onChange([
      ...value,
      {
        company: "",
        current: false,
        description: "",
        endDate: "",
        id: entryId(),
        location: "",
        role: "",
        startDate: "",
      },
    ]);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{t("profile.experienceEditor.title")}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            {t("profile.experienceEditor.description")}
          </p>
        </div>
        <button
          className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-brand-50"
          onClick={add}
          type="button"
        >
          {t("profile.experienceEditor.addRole")}
        </button>
      </div>

      {value.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-line bg-canvas p-5 text-sm text-ink-muted">
          {t("profile.experienceEditor.empty")}
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {value.map((entry, index) => (
            <fieldset
              className="rounded-xl border border-line bg-canvas/55 p-5"
              key={entry.id}
            >
              <legend className="px-2 text-sm font-semibold">
                {t("profile.experienceEditor.roleLegend", { number: index + 1 })}
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  {t("profile.experienceEditor.jobTitle")}
                  <input
                    className={inputClasses}
                    maxLength={160}
                    onChange={(event) => update(entry.id, { role: event.target.value })}
                    required
                    value={entry.role}
                  />
                </label>
                <label className="text-sm font-semibold">
                  {t("profile.experienceEditor.company")}
                  <input
                    className={inputClasses}
                    maxLength={160}
                    onChange={(event) => update(entry.id, { company: event.target.value })}
                    required
                    value={entry.company}
                  />
                </label>
                <label className="text-sm font-semibold">
                  {t("profile.experienceEditor.location")}
                  <input
                    className={inputClasses}
                    maxLength={160}
                    onChange={(event) => update(entry.id, { location: event.target.value })}
                    value={entry.location}
                  />
                </label>
                <span className="hidden sm:block" />
                <label className="text-sm font-semibold">
                  {t("profile.experienceEditor.startDate")}
                  <input
                    className={inputClasses}
                    onChange={(event) => update(entry.id, { startDate: event.target.value })}
                    type="month"
                    value={entry.startDate}
                  />
                </label>
                <label className="text-sm font-semibold">
                  {t("profile.experienceEditor.endDate")}
                  <input
                    className={inputClasses}
                    disabled={entry.current}
                    onChange={(event) => update(entry.id, { endDate: event.target.value })}
                    type="month"
                    value={entry.endDate}
                  />
                </label>
              </div>
              <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
                <input
                  checked={entry.current}
                  className="size-4 accent-brand-800"
                  onChange={(event) =>
                    update(entry.id, {
                      current: event.target.checked,
                      endDate: event.target.checked ? "" : entry.endDate,
                    })
                  }
                  type="checkbox"
                />
                {t("profile.experienceEditor.currentlyWorkHere")}
              </label>
              <label className="mt-4 block text-sm font-semibold">
                {t("profile.experienceEditor.achievements")}
                <textarea
                  className={textareaClasses}
                  maxLength={2000}
                  onChange={(event) =>
                    update(entry.id, { description: event.target.value })
                  }
                  placeholder={t("profile.experienceEditor.achievementsPlaceholder")}
                  value={entry.description}
                />
              </label>
              <button
                className="mt-4 text-sm font-semibold text-red-700 hover:underline"
                onClick={() => onChange(value.filter((item) => item.id !== entry.id))}
                type="button"
              >
                {t("profile.experienceEditor.removeRole")}
              </button>
            </fieldset>
          ))}
        </div>
      )}
    </div>
  );
}

type EducationEditorProps = {
  onChange: (entries: EducationEntry[]) => void;
  value: EducationEntry[];
};

export function EducationEditor({ onChange, value }: EducationEditorProps) {
  const { t } = useTranslation();

  function update(id: string, changes: Partial<EducationEntry>) {
    onChange(
      value.map((entry) =>
        entry.id === id ? { ...entry, ...changes } : entry,
      ),
    );
  }

  function add() {
    onChange([
      ...value,
      {
        degree: "",
        endDate: "",
        field: "",
        id: entryId(),
        institution: "",
        startDate: "",
      },
    ]);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{t("profile.educationEditor.title")}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            {t("profile.educationEditor.description")}
          </p>
        </div>
        <button
          className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-brand-50"
          onClick={add}
          type="button"
        >
          {t("profile.educationEditor.addEducation")}
        </button>
      </div>

      {value.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-line bg-canvas p-5 text-sm text-ink-muted">
          {t("profile.educationEditor.empty")}
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {value.map((entry, index) => (
            <fieldset
              className="rounded-xl border border-line bg-canvas/55 p-5"
              key={entry.id}
            >
              <legend className="px-2 text-sm font-semibold">
                {t("profile.educationEditor.entryLegend", { number: index + 1 })}
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  {t("profile.educationEditor.institution")}
                  <input
                    className={inputClasses}
                    maxLength={160}
                    onChange={(event) =>
                      update(entry.id, { institution: event.target.value })
                    }
                    required
                    value={entry.institution}
                  />
                </label>
                <label className="text-sm font-semibold">
                  {t("profile.educationEditor.degree")}
                  <input
                    className={inputClasses}
                    maxLength={160}
                    onChange={(event) => update(entry.id, { degree: event.target.value })}
                    required
                    value={entry.degree}
                  />
                </label>
                <label className="text-sm font-semibold">
                  {t("profile.educationEditor.field")}
                  <input
                    className={inputClasses}
                    maxLength={160}
                    onChange={(event) => update(entry.id, { field: event.target.value })}
                    value={entry.field}
                  />
                </label>
                <span className="hidden sm:block" />
                <label className="text-sm font-semibold">
                  {t("profile.experienceEditor.startDate")}
                  <input
                    className={inputClasses}
                    onChange={(event) => update(entry.id, { startDate: event.target.value })}
                    type="month"
                    value={entry.startDate}
                  />
                </label>
                <label className="text-sm font-semibold">
                  {t("profile.experienceEditor.endDate")}
                  <input
                    className={inputClasses}
                    onChange={(event) => update(entry.id, { endDate: event.target.value })}
                    type="month"
                    value={entry.endDate}
                  />
                </label>
              </div>
              <button
                className="mt-4 text-sm font-semibold text-red-700 hover:underline"
                onClick={() => onChange(value.filter((item) => item.id !== entry.id))}
                type="button"
              >
                {t("profile.educationEditor.removeEducation")}
              </button>
            </fieldset>
          ))}
        </div>
      )}
    </div>
  );
}
