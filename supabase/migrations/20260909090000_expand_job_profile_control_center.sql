-- Candidate job-search and autonomous-application preferences.

alter table public.profiles
  add column if not exists preferred_locations text[] not null default '{}',
  add column if not exists minimum_salary integer,
  add column if not exists maximum_salary integer,
  add column if not exists travel_willingness text not null default 'none',
  add column if not exists company_types text[] not null default '{}',
  add column if not exists work_authorization text,
  add column if not exists earliest_start_date date,
  add column if not exists notice_period text,
  add column if not exists languages jsonb not null default '[]'::jsonb,
  add column if not exists auto_apply_levels text[] not null default '{}',
  add column if not exists minimum_match_score integer not null default 80,
  add column if not exists cv_tailoring boolean not null default true,
  add column if not exists cover_letter_preference text not null default 'required',
  add column if not exists application_exclusions jsonb not null default '{}'::jsonb;

alter table public.profiles
  drop constraint if exists profiles_salary_range_check,
  add constraint profiles_salary_range_check check (
    (minimum_salary is null or minimum_salary >= 0)
    and (maximum_salary is null or maximum_salary >= 0)
    and (minimum_salary is null or maximum_salary is null or maximum_salary >= minimum_salary)
  ),
  drop constraint if exists profiles_travel_willingness_check,
  add constraint profiles_travel_willingness_check check (travel_willingness in ('none', 'occasional', 'frequent')),
  drop constraint if exists profiles_work_authorization_check,
  add constraint profiles_work_authorization_check check (
    work_authorization is null or work_authorization in (
      'eu_eea', 'permanent_residence', 'eu_blue_card', 'job_seeker_visa', 'requires_sponsorship', 'other'
    )
  ),
  drop constraint if exists profiles_minimum_match_score_check,
  add constraint profiles_minimum_match_score_check check (minimum_match_score between 0 and 100),
  drop constraint if exists profiles_cover_letter_preference_check,
  add constraint profiles_cover_letter_preference_check check (cover_letter_preference in ('always', 'required', 'never')),
  drop constraint if exists profiles_languages_array_check,
  add constraint profiles_languages_array_check check (jsonb_typeof(languages) = 'array'),
  drop constraint if exists profiles_application_exclusions_object_check,
  add constraint profiles_application_exclusions_object_check check (jsonb_typeof(application_exclusions) = 'object');
