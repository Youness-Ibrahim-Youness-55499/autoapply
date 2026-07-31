import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export type TemplateKind = "cover_letter" | "screening" | "paragraph";

export type Template = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  kind: TemplateKind;
  content: string;
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string } | null;
};

export type TemplateCategory = { id: string; name: string };

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadAll() {
      setIsLoading(true);
      setErrorMessage("");

      const { data: cats, error: catErr } = await supabase
        .from("template_categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (!isCurrent) return;

      if (catErr) {
        setErrorMessage(catErr.message);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("templates")
        .select("*, category:template_categories(id, name)")
        .order("updated_at", { ascending: false });

      if (!isCurrent) return;

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setCategories(cats ?? []);
      setTemplates((data ?? []).map((row: any) => ({ ...row, category: row.category?.[0] ?? null })));
      setIsLoading(false);
    }

    void loadAll();

    return () => {
      isCurrent = false;
    };
  }, []);

  async function createTemplate(values: { title: string; kind: TemplateKind; content: string; category_id?: string | null }) {
    const { data, error } = await supabase
      .from("templates")
      .insert({ ...values })
      .select("*, category:template_categories(id, name)")
      .maybeSingle();

    if (error) throw error;

    return data as Template;
  }

  async function updateTemplate(id: string, values: Partial<Template>) {
    const { data, error } = await supabase
      .from("templates")
      .update(values)
      .eq("id", id)
      .select("*, category:template_categories(id, name)")
      .maybeSingle();

    if (error) throw error;
    return data as Template;
  }

  async function deleteTemplate(id: string) {
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) throw error;
  }

  async function duplicateTemplate(id: string) {
    const { data, error } = await supabase.from("templates").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Template not found");
    const { id: _id, created_at, updated_at, ...rest } = data as any;
    const { data: newRow, error: insertErr } = await supabase
      .from("templates")
      .insert({ ...rest, title: `${rest.title} (copy)` })
      .select("*")
      .maybeSingle();
    if (insertErr) throw insertErr;
    return newRow as Template;
  }

  async function createCategory(name: string) {
    const { data, error } = await supabase
      .from("template_categories")
      .insert({ name })
      .select("*")
      .maybeSingle();
    if (error) throw error;
    setCategories((c) => [...c, data as TemplateCategory]);
    return data as TemplateCategory;
  }

  return {
    templates,
    categories,
    isLoading,
    errorMessage,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    createCategory,
  };
}
