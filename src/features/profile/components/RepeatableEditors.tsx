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
          <h3 className="text-lg font-semibold">Work experience</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Add the evidence Autoapply can use when matching roles.
          </p>
        </div>
        <button
          className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-brand-50"
          onClick={add}
          type="button"
        >
          Add role
        </button>
      </div>

      {value.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-line bg-canvas p-5 text-sm text-ink-muted">
          No work experience added yet.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {value.map((entry, index) => (
            <fieldset
              className="rounded-xl border border-line bg-canvas/55 p-5"
              key={entry.id}
            >
              <legend className="px-2 text-sm font-semibold">
                Role {index + 1}
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Job title
                  <input
                    className={inputClasses}
                    maxLength={160}
                    onChange={(event) => update(entry.id, { role: event.target.value })}
                    required
                    value={entry.role}
                  />
                </label>
                <label className="text-sm font-semibold">
                  Company
                  <input
                    className={inputClasses}
                    maxLength={160}
                    onChange={(event) => update(entry.id, { company: event.target.value })}
                    required
                    value={entry.company}
                  />
                </label>
                <label className="text-sm font-semibold">
                  Location
                  <input
                    className={inputClasses}
                    maxLength={160}
                    onChange={(event) => update(entry.id, { location: event.target.value })}
                    value={entry.location}
                  />
                </label>
                <span className="hidden sm:block" />
                <label className="text-sm font-semibold">
                  Start date
                  <input
                    className={inputClasses}
                    onChange={(event) => update(entry.id, { startDate: event.target.value })}
                    type="month"
                    value={entry.startDate}
                  />
                </label>
                <label className="text-sm font-semibold">
                  End date
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
                I currently work here
              </label>
              <label className="mt-4 block text-sm font-semibold">
                Achievements and responsibilities
                <textarea
                  className={textareaClasses}
                  maxLength={2000}
                  onChange={(event) =>
                    update(entry.id, { description: event.target.value })
                  }
                  placeholder="Focus on outcomes, scope, and measurable impact."
                  value={entry.description}
                />
              </label>
              <button
                className="mt-4 text-sm font-semibold text-red-700 hover:underline"
                onClick={() => onChange(value.filter((item) => item.id !== entry.id))}
                type="button"
              >
                Remove role
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
          <h3 className="text-lg font-semibold">Education</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Record degrees, training, or other relevant study.
          </p>
        </div>
        <button
          className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-brand-50"
          onClick={add}
          type="button"
        >
          Add education
        </button>
      </div>

      {value.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-line bg-canvas p-5 text-sm text-ink-muted">
          No education added yet.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {value.map((entry, index) => (
            <fieldset
              className="rounded-xl border border-line bg-canvas/55 p-5"
              key={entry.id}
            >
              <legend className="px-2 text-sm font-semibold">
                Education {index + 1}
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Institution
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
                  Degree or qualification
                  <input
                    className={inputClasses}
                    maxLength={160}
                    onChange={(event) => update(entry.id, { degree: event.target.value })}
                    required
                    value={entry.degree}
                  />
                </label>
                <label className="text-sm font-semibold">
                  Field of study
                  <input
                    className={inputClasses}
                    maxLength={160}
                    onChange={(event) => update(entry.id, { field: event.target.value })}
                    value={entry.field}
                  />
                </label>
                <span className="hidden sm:block" />
                <label className="text-sm font-semibold">
                  Start date
                  <input
                    className={inputClasses}
                    onChange={(event) => update(entry.id, { startDate: event.target.value })}
                    type="month"
                    value={entry.startDate}
                  />
                </label>
                <label className="text-sm font-semibold">
                  End date
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
                Remove education
              </button>
            </fieldset>
          ))}
        </div>
      )}
    </div>
  );
}
