-- Templates and application checklists

create table if not exists public.template_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists template_categories_user_name_idx
  on public.template_categories (user_id, lower(name));

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.template_categories (id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  kind text not null check (kind in ('cover_letter', 'screening', 'paragraph')),
  content text not null check (char_length(content) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists templates_user_id_kind_idx
  on public.templates (user_id, kind);

create unique index if not exists templates_id_user_id_idx
  on public.templates (id, user_id);

create table if not exists public.application_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  template_id uuid not null references public.templates (id) on delete cascade,
  template_kind text not null check (template_kind in ('cover_letter', 'screening', 'paragraph')),
  created_at timestamptz not null default now()
);

create index if not exists application_templates_app_idx
  on public.application_templates (application_id);

alter table public.application_templates
  add constraint application_templates_owner_fk
    foreign key (application_id, user_id)
    references public.applications (id, user_id)
    on delete cascade;

create table if not exists public.application_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  cv_selected boolean not null default false,
  cover_letter_prepared boolean not null default false,
  contact_details_reviewed boolean not null default false,
  screening_completed boolean not null default false,
  job_description_saved boolean not null default false,
  final_review_completed boolean not null default false,
  submission_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists application_checklists_app_user_idx
  on public.application_checklists (application_id, user_id);

alter table public.application_checklists
  add constraint application_checklists_owner_fk
    foreign key (application_id, user_id)
    references public.applications (id, user_id)
    on delete cascade;

-- Triggers to keep updated_at in sync

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    new.updated_at = now();
    return new;
  elsif tg_op = 'INSERT' then
    new.created_at = coalesce(new.created_at, now());
    new.updated_at = coalesce(new.updated_at, now());
    return new;
  end if;
  return new;
end;
$$;

-- Attach triggers

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
before insert or update on public.templates
for each row execute function public.set_updated_at();

drop trigger if exists template_categories_set_updated_at on public.template_categories;
create trigger template_categories_set_updated_at
before insert or update on public.template_categories
for each row execute function public.set_updated_at();

drop trigger if exists application_templates_set_updated_at on public.application_templates;
create trigger application_templates_set_updated_at
before insert on public.application_templates
for each row execute function public.set_updated_at();

drop trigger if exists application_checklists_set_updated_at on public.application_checklists;
create trigger application_checklists_set_updated_at
before insert or update on public.application_checklists
for each row execute function public.set_updated_at();

-- Enable RLS and policies

alter table public.template_categories enable row level security;
alter table public.templates enable row level security;
alter table public.application_templates enable row level security;
alter table public.application_checklists enable row level security;

revoke all on table public.template_categories from anon;
revoke all on table public.templates from anon;
revoke all on table public.application_templates from anon;
revoke all on table public.application_checklists from anon;

grant select on table public.template_categories to authenticated;
grant select, insert, update, delete on table public.templates to authenticated;
grant select, insert, update, delete on table public.application_templates to authenticated;
grant select, insert, update, delete on table public.application_checklists to authenticated;

grant all on table public.template_categories to service_role;
grant all on table public.templates to service_role;
grant all on table public.application_templates to service_role;
grant all on table public.application_checklists to service_role;

create policy "Users can manage their categories"
on public.template_categories
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their templates"
on public.templates
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage application templates"
on public.application_templates
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their checklists"
on public.application_checklists
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
