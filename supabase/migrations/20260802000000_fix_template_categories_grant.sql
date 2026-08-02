-- Fix missing insert/update/delete grant on template_categories.
--
-- The RLS policy "Users can manage their categories" is `for all`, but the
-- table grant issued in 20260731160000_create_templates_and_checklists.sql
-- only covered `select` for the authenticated role. Postgres checks table
-- grants before RLS policies, so creating a category (useTemplates.ts's
-- createCategory()) fails with a permission error regardless of the RLS
-- policy being correct.

grant select, insert, update, delete on table public.template_categories to authenticated;
