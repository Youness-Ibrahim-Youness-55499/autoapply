import { useState } from "react";
import { useTranslation } from "../../i18n";
import { TemplateEditor } from "./TemplateEditor";
import { useTemplates, type TemplateInput } from "./useTemplates";
import { Button } from "../../components/ui/Button";

export function TemplatesPage() {
  const {
    templates,
    categories,
    isLoading,
    loadErrorMessage,
    actionErrorMessage,
    successMessage,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    createCategory,
  } = useTemplates();
  const [editing, setEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleCreate = async (values: TemplateInput) => {
    await createTemplate(values);
  };

  const handleUpdate = async (id: string, values: TemplateInput) => {
    await updateTemplate(id, values);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await deleteTemplate(id);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateTemplate(id);
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    const didSucceed = await createCategory(newCategory.trim());
    if (didSucceed) {
      setNewCategory("");
    }
  };

  const { t } = useTranslation();

  return (
    <section className="py-10 sm:py-14 lg:px-10">
      <div className="max-w-6xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t("templates.title")}</h2>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsCreating(true)}>{t("templates.new")}</Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {isLoading ? (
            <div>Loading templates…</div>
          ) : loadErrorMessage ? (
            <div className="text-red-700">{loadErrorMessage}</div>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="rounded-card border border-line bg-surface p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">{template.title}</div>
                    <div className="mt-1 text-xs text-ink-muted">{template.kind} {template.category ? `— ${template.category.name}` : ""}</div>
                    <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap text-sm">{template.content}</pre>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => navigator.clipboard?.writeText(template.content)} className="text-sm text-ink-muted">{t("templates.copy")}</button>
                    <button onClick={() => setEditing(template.id)} className="text-sm">{t("templates.edit")}</button>
                    <button onClick={() => handleDuplicate(template.id)} className="text-sm">{t("templates.duplicate")}</button>
                    <button onClick={() => handleDelete(template.id)} className="text-sm text-rose-600">{t("templates.delete")}</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {actionErrorMessage ? (
          <p className="mt-4 text-sm text-red-700">{actionErrorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className="mt-4 text-sm text-emerald-700">{successMessage}</p>
        ) : null}

        <div className="mt-6">
          <h3 className="text-sm font-semibold">{t("templates.categories")}</h3>
          <div className="mt-3 flex gap-3">
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder={t("templates.addCategory")} className="rounded-xl border border-line bg-canvas px-4 py-2 text-sm" />
            <Button onClick={handleCreateCategory}>{t("templates.addCategory")}</Button>
          </div>
        </div>
      </div>

      {(isCreating || editing) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <button className="mb-4 text-sm text-ink-muted" onClick={() => { setIsCreating(false); setEditing(null); }}>Close</button>
              <TemplateEditor
                template={templates.find((t) => t.id === editing)}
                categories={categories}
                onCancel={() => { setIsCreating(false); setEditing(null); }}
                onSave={async (values) => {
                  if (editing) {
                    await handleUpdate(editing, values);
                  } else {
                    await handleCreate(values);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
