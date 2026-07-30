-- Phase 3 candidate profile foundation.
-- Structured arrays keep the MVP profile atomic while preserving typed entries.

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists headline text,
  add column if not exists location text,
  add column if not exists desired_roles text[] not null default '{}',
  add column if not exists skills text[] not null default '{}',
  add column if not exists work_preference text not null default 'flexible',
  add column if not exists employment_types text[] not null default '{}',
  add column if not exists willing_to_relocate boolean not null default false,
  add column if not exists professional_summary text,
  add column if not exists experience jsonb not null default '[]'::jsonb,
  add column if not exists education jsonb not null default '[]'::jsonb,
  add column if not exists onboarding_completed boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_work_preference_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_work_preference_check
      check (work_preference in ('remote', 'hybrid', 'onsite', 'flexible'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_experience_array_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_experience_array_check
      check (jsonb_typeof(experience) = 'array');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_education_array_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_education_array_check
      check (jsonb_typeof(education) = 'array');
  end if;
end
$$;

comment on column public.profiles.experience is
  'Ordered JSON array of typed candidate work-experience entries.';
comment on column public.profiles.education is
  'Ordered JSON array of typed candidate education entries.';
