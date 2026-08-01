import { useState } from "react";
import { Template, TemplateKind, TemplateCategory } from "./useTemplates";
import { Button } from "../../components/ui/Button";

type Props = {
  template?: Template;
  categories: TemplateCategory[];
  onCancel: () => void;
  onSave: (values: { title: string; kind: TemplateKind; content: string; category_id?: string | null }) => Promise<void>;
};

export function TemplateEditor({ template, categories, onCancel, onSave }: Props) {
  const [title, setTitle] = useState(template?.title ?? "");
  const [content, setContent] = useState(template?.content ?? "");
  const [kind, setKind] = useState<TemplateKind>(template?.kind ?? "cover_letter");
  const [categoryId, setCategoryId] = useState<string | null>(template?.category_id ?? null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave({ title: title.trim(), kind, content: content.trim(), category_id: categoryId || null });
      onCancel();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-card border border-line bg-surface p-6 shadow-card">
      <div>
        <h3 className="text-lg font-semibold">{template ? "Edit template" : "New template"}</h3>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="text-sm font-semibold">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 block w-full rounded-xl border border-line bg-canvas px-4 py-2 text-sm" />
        </label>

        <label className="text-sm font-semibold">
          Kind
          <select value={kind} onChange={(e) => setKind(e.target.value as TemplateKind)} className="mt-2 block w-full rounded-xl border border-line bg-canvas px-4 py-2 text-sm">
            <option value="cover_letter">Cover letter</option>
            <option value="screening">Screening answer</option>
            <option value="paragraph">Personal paragraph</option>
          </select>
        </label>

        <label className="text-sm font-semibold">
          Category
          <select value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value || null)} className="mt-2 block w-full rounded-xl border border-line bg-canvas px-4 py-2 text-sm">
            <option value="">(No category)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold">
          Content
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="mt-2 block w-full min-h-44 rounded-xl border border-line bg-canvas px-4 py-3 text-sm" />
        </label>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || title.trim().length === 0}>{isSaving ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </section>
  );
}
