import { useState, type FormEvent } from "react";

type TagEditorProps = {
  label: string;
  maxItems?: number;
  onChange: (items: string[]) => void;
  placeholder: string;
  value: string[];
};

export function TagEditor({
  label,
  maxItems = 20,
  onChange,
  placeholder,
  value,
}: TagEditorProps) {
  const [draft, setDraft] = useState("");
  const inputId = `tag-editor-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  function addTag(event: FormEvent) {
    event.preventDefault();
    const nextTag = draft.trim();

    if (
      !nextTag ||
      value.length >= maxItems ||
      value.some((item) => item.toLowerCase() === nextTag.toLowerCase())
    ) {
      return;
    }

    onChange([...value, nextTag]);
    setDraft("");
  }

  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={inputId}>
        {label}
      </label>
      <form className="mt-2 flex gap-2" onSubmit={addTag}>
        <input
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          id={inputId}
          maxLength={80}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          value={draft}
        />
        <button
          className="min-h-11 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition hover:bg-brand-50 disabled:opacity-45"
          disabled={!draft.trim() || value.length >= maxItems}
          type="submit"
        >
          Add
        </button>
      </form>

      {value.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {value.map((item) => (
            <li
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1.5 pl-3 pr-1.5 text-sm text-brand-900"
              key={item}
            >
              {item}
              <button
                aria-label={`Remove ${item}`}
                className="grid size-7 place-items-center rounded-full hover:bg-brand-100"
                onClick={() => onChange(value.filter((current) => current !== item))}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-ink-muted">
        {value.length}/{maxItems}
      </p>
    </div>
  );
}
