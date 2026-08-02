import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";

export const templateKinds = ["cover_letter", "screening", "paragraph"] as const;
export type TemplateKind = (typeof templateKinds)[number];

export function isTemplateKind(value: unknown): value is TemplateKind {
  return typeof value === "string" && templateKinds.includes(value as TemplateKind);
}

export type TemplateCategory = { id: string; name: string };

export type Template = {
  category: TemplateCategory | null;
  category_id: string | null;
  content: string;
  created_at: string;
  id: string;
  kind: TemplateKind;
  title: string;
  updated_at: string;
  user_id: string;
};

export type TemplateInput = {
  category_id?: string | null;
  content: string;
  kind: TemplateKind;
  title: string;
};

const templateColumns = "*, category:template_categories(id, name)";

function isTemplateCategory(value: unknown): value is TemplateCategory {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.name === "string";
}

function normalizeTemplate(value: unknown): Template | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const rawCategory = Array.isArray(row.category) ? row.category[0] : row.category;
  const category = rawCategory === null || rawCategory === undefined ? null : rawCategory;

  if (
    typeof row.id !== "string" ||
    typeof row.user_id !== "string" ||
    (row.category_id !== null && typeof row.category_id !== "string") ||
    typeof row.title !== "string" ||
    !isTemplateKind(row.kind) ||
    typeof row.content !== "string" ||
    typeof row.created_at !== "string" ||
    typeof row.updated_at !== "string" ||
    (category !== null && !isTemplateCategory(category))
  ) {
    return null;
  }

  return {
    category: category as TemplateCategory | null,
    category_id: row.category_id as string | null,
    content: row.content,
    created_at: row.created_at,
    id: row.id,
    kind: row.kind,
    title: row.title,
    updated_at: row.updated_at,
    user_id: row.user_id,
  };
}

function validateTemplateInput(values: TemplateInput): string {
  const title = values.title.trim();

  if (!title) return "Template title is required.";
  if (title.length > 160) return "Template title must be 160 characters or fewer.";
  if (!isTemplateKind(values.kind)) return "Choose a valid template type.";
  if (values.content.trim().length > 20000) {
    return "Template content must be 20,000 characters or fewer.";
  }

  return "";
}

export function useTemplates() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [actionErrorMessage, setActionErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadAll() {
      if (!userId) {
        setTemplates([]);
        setCategories([]);
        setLoadErrorMessage("Your session is not available. Please log in again.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadErrorMessage("");

      const { data: categoryRows, error: categoryError } = await supabase
        .from("template_categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (!isCurrent) return;

      if (categoryError) {
        setLoadErrorMessage(categoryError.message);
        setIsLoading(false);
        return;
      }

      const { data: templateRows, error: templateError } = await supabase
        .from("templates")
        .select(templateColumns)
        .order("updated_at", { ascending: false });

      if (!isCurrent) return;

      if (templateError) {
        setLoadErrorMessage(templateError.message);
        setIsLoading(false);
        return;
      }

      if (!(categoryRows ?? []).every(isTemplateCategory)) {
        setLoadErrorMessage("Template category data returned in an unexpected format.");
        setIsLoading(false);
        return;
      }

      const normalizedTemplates = (templateRows ?? []).map(normalizeTemplate);

      if (normalizedTemplates.some((template) => template === null)) {
        setLoadErrorMessage("Template data returned in an unexpected format.");
        setIsLoading(false);
        return;
      }

      setCategories(categoryRows ?? []);
      setTemplates(normalizedTemplates as Template[]);
      setIsLoading(false);
    }

    void loadAll();

    return () => {
      isCurrent = false;
    };
  }, [userId, requestVersion]);

  const retry = () => setRequestVersion((version) => version + 1);

  async function createTemplate(values: TemplateInput) {
    setActionErrorMessage("");
    setSuccessMessage("");

    if (!userId) {
      setActionErrorMessage("Your session is not available. Please log in again.");
      return false;
    }

    const validationError = validateTemplateInput(values);
    if (validationError) {
      setActionErrorMessage(validationError);
      return false;
    }

    const { data, error } = await supabase
      .from("templates")
      .insert({
        category_id: values.category_id ?? null,
        content: values.content.trim(),
        kind: values.kind,
        title: values.title.trim(),
        user_id: userId,
      })
      .select(templateColumns)
      .maybeSingle();

    if (error || !data) {
      setActionErrorMessage(error?.message ?? "The template could not be created.");
      return false;
    }

    const template = normalizeTemplate(data);
    if (!template) {
      setActionErrorMessage("The created template returned in an unexpected format.");
      return false;
    }

    setTemplates((current) => [template, ...current]);
    setSuccessMessage("Template created.");
    return true;
  }

  async function updateTemplate(id: string, values: TemplateInput) {
    setActionErrorMessage("");
    setSuccessMessage("");

    if (!userId) {
      setActionErrorMessage("Your session is not available. Please log in again.");
      return false;
    }

    const validationError = validateTemplateInput(values);
    if (validationError) {
      setActionErrorMessage(validationError);
      return false;
    }

    const { data, error } = await supabase
      .from("templates")
      .update({
        category_id: values.category_id ?? null,
        content: values.content.trim(),
        kind: values.kind,
        title: values.title.trim(),
      })
      .eq("id", id)
      .select(templateColumns)
      .maybeSingle();

    if (error || !data) {
      setActionErrorMessage(error?.message ?? "This template could not be found or updated.");
      return false;
    }

    const template = normalizeTemplate(data);
    if (!template) {
      setActionErrorMessage("The updated template returned in an unexpected format.");
      return false;
    }

    setTemplates((current) =>
      current.map((item) => (item.id === template.id ? template : item)),
    );
    setSuccessMessage("Template updated.");
    return true;
  }

  async function deleteTemplate(id: string) {
    setActionErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.from("templates").delete().eq("id", id);

    if (error) {
      setActionErrorMessage(error.message);
      return false;
    }

    setTemplates((current) => current.filter((item) => item.id !== id));
    setSuccessMessage("Template deleted.");
    return true;
  }

  async function duplicateTemplate(id: string) {
    setActionErrorMessage("");
    setSuccessMessage("");

    if (!userId) {
      setActionErrorMessage("Your session is not available. Please log in again.");
      return false;
    }

    const source = templates.find((item) => item.id === id);
    if (!source) {
      setActionErrorMessage("This template could not be found.");
      return false;
    }

    const { data, error } = await supabase
      .from("templates")
      .insert({
        category_id: source.category_id,
        content: source.content,
        kind: source.kind,
        title: `${source.title} (copy)`,
        user_id: userId,
      })
      .select(templateColumns)
      .maybeSingle();

    if (error || !data) {
      setActionErrorMessage(error?.message ?? "The template could not be duplicated.");
      return false;
    }

    const template = normalizeTemplate(data);
    if (!template) {
      setActionErrorMessage("The duplicated template returned in an unexpected format.");
      return false;
    }

    setTemplates((current) => [template, ...current]);
    setSuccessMessage("Template duplicated.");
    return true;
  }

  async function createCategory(name: string) {
    setActionErrorMessage("");
    setSuccessMessage("");

    if (!userId) {
      setActionErrorMessage("Your session is not available. Please log in again.");
      return false;
    }

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 160) {
      setActionErrorMessage("Category name must contain 1 to 160 characters.");
      return false;
    }

    const { data, error } = await supabase
      .from("template_categories")
      .insert({ name: trimmedName, user_id: userId })
      .select("id, name")
      .maybeSingle();

    if (error || !data || !isTemplateCategory(data)) {
      setActionErrorMessage(error?.message ?? "The category could not be created.");
      return false;
    }

    setCategories((current) => [...current, data]);
    setSuccessMessage("Category created.");
    return true;
  }

  return {
    actionErrorMessage,
    categories,
    createCategory,
    createTemplate,
    deleteTemplate,
    duplicateTemplate,
    isLoading,
    loadErrorMessage,
    retry,
    successMessage,
    templates,
    updateTemplate,
  };
}
