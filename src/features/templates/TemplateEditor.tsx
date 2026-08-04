import { useState } from "react";
import { useTranslation } from "../../i18n";
import { Template, TemplateKind, TemplateCategory, templateKinds } from "./useTemplates";
import { templateKindLabelKeys } from "./templateKindLabels";
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

  const { t } = useTranslation();

  return (
    <section className="rounded-card border border-line bg-surface p-6 shadow-card">
      <div>
        <h3 className="text-lg font-semibold">{template ? t("editor.edit") : t("editor.new")}</h3>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="text-sm font-semibold">
          {t("editor.title")}
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 block w-full rounded-xl border border-line bg-canvas px-4 py-2 text-sm" />
        </label>

        <label className="text-sm font-semibold">
          {t("editor.kind")}
          <select value={kind} onChange={(e) => setKind(e.target.value as TemplateKind)} className="mt-2 block w-full rounded-xl border border-line bg-canvas px-4 py-2 text-sm">
            {templateKinds.map((value) => (
              <option key={value} value={value}>{t(templateKindLabelKeys[value])}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold">
          {t("editor.category")}
          <select value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value || null)} className="mt-2 block w-full rounded-xl border border-line bg-canvas px-4 py-2 text-sm">
            <option value="">{t("editor.noCategory")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold">
          {t("editor.content")}
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="mt-2 block w-full min-h-44 rounded-xl border border-line bg-canvas px-4 py-3 text-sm" />
        </label>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>{t("editor.cancel")}</Button>
          <Button onClick={handleSave} disabled={isSaving || title.trim().length === 0}>{isSaving ? t("editor.saving") : t("editor.save")}</Button>
        </div>
      </div>
    </section>
  );
}
