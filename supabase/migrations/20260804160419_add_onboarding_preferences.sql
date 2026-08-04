-- Onboarding flow: job-search preferences not covered by the Phase 3
-- profile expansion (preferred_locations, minimum_salary, visa_status,
-- preferred_languages, excluded_companies, excluded_industries,
-- application_mode). Same shape as 20260730220000_expand_candidate_profile.sql.

alter table public.profiles
  add column if not exists preferred_locations text[] not null default '{}',
  add column if not exists minimum_salary integer,
  add column if not exists visa_status text not null default 'prefer_not_to_say',
  add column if not exists preferred_languages text[] not null default '{}',
  add column if not exists excluded_companies text[] not null default '{}',
  add column if not exists excluded_industries text[] not null default '{}',
  add column if not exists application_mode text not null default 'manual';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_visa_status_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_visa_status_check
      check (visa_status in (
        'citizen_or_permanent_resident',
        'has_work_permit',
        'requires_sponsorship',
        'prefer_not_to_say'
      ));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_application_mode_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_application_mode_check
      check (application_mode in ('manual', 'auto'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_minimum_salary_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_minimum_salary_check
      check (minimum_salary is null or minimum_salary >= 0);
  end if;
end
$$;

comment on column public.profiles.preferred_locations is
  'Job-search target locations chosen during onboarding/preferences -- distinct from the free-text "location" (current residence) field.';
comment on column public.profiles.visa_status is
  'Self-reported work-authorization status for job matching.';
comment on column public.profiles.application_mode is
  'Stated preference only (manual review vs. auto-apply intent) -- no automated submission pipeline exists yet.';
