create type public.application_status as enum (
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_name text not null check (
    char_length(company_name) between 1 and 160
  ),
  job_title text not null check (
    char_length(job_title) between 1 and 160
  ),
  status public.application_status not null default 'saved',
  job_url text check (
    job_url is null or char_length(job_url) <= 2048
  ),
  location text check (
    location is null or char_length(location) <= 160
  ),
  notes text check (
    notes is null or char_length(notes) <= 10000
  ),
  applied_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_id_created_at_idx
  on public.applications (user_id, created_at desc);

create index applications_user_id_status_idx
  on public.applications (user_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name)
select
  id,
  coalesce(raw_user_meta_data ->> 'name', '')
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.applications enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.applications from anon;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.applications to authenticated;
grant usage on type public.application_status to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.applications to service_role;
grant usage on type public.application_status to service_role;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can read their own applications"
on public.applications
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own applications"
on public.applications
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own applications"
on public.applications
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own applications"
on public.applications
for delete
to authenticated
using ((select auth.uid()) = user_id);
