-- Add missing indexes on foreign-key columns used for lookups.
--
-- templates.category_id and application_templates.template_id are both FKs
-- with no supporting index, unlike every other FK column in this schema
-- (e.g. application_templates_app_idx already covers application_id).
-- Without these, checking template usage before a delete, or grouping
-- templates by category, requires a sequential scan.

create index if not exists templates_category_id_idx
  on public.templates (category_id);

create index if not exists application_templates_template_id_idx
  on public.application_templates (template_id);
