import { useState, type KeyboardEvent } from "react";
import { useTranslation } from "../../../i18n";

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
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const inputId = `tag-editor-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  function addTag() {
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

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  }

  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={inputId}>
        {label}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-canvas px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          id={inputId}
          maxLength={80}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          value={draft}
        />
        <button
          className="min-h-11 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition hover:bg-brand-50 disabled:opacity-45"
          disabled={!draft.trim() || value.length >= maxItems}
          onClick={addTag}
          type="button"
        >
          {t("profile.tagEditor.add")}
        </button>
      </div>

      {value.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {value.map((item) => (
            <li
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1.5 pl-3 pr-1.5 text-sm text-brand-900"
              key={item}
            >
              {item}
              <button
                aria-label={t("profile.tagEditor.remove", { item })}
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
        {t("profile.tagEditor.count", { count: value.length, max: maxItems })}
      </p>
    </div>
  );
}
