-- Complete document management, job information, and application workflow.

alter table public.documents
  add column if not exists display_name text,
  add column if not exists category text not null default 'cv',
  add column if not exists notes text,
  add column if not exists is_default boolean not null default false;

update public.documents
set display_name = original_name
where display_name is null;

alter table public.documents
  alter column display_name set not null,
  add constraint documents_display_name_length check (
    char_length(display_name) between 1 and 160
  ),
  add constraint documents_category_check check (
    category in ('cv', 'cover_letter', 'certificate', 'reference')
  ),
  add constraint documents_notes_length check (
    notes is null or char_length(notes) <= 5000
  ),
  add constraint documents_default_must_be_cv check (
    not is_default or category = 'cv'
  );

create unique index if not exists documents_one_default_cv_per_user_idx
  on public.documents (user_id)
  where is_default and category = 'cv';

create unique index if not exists documents_id_user_id_idx
  on public.documents (id, user_id);

create or replace function public.update_document_metadata(
  p_document_id uuid,
  p_display_name text,
  p_category text,
  p_notes text,
  p_is_default boolean
)
returns public.documents
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_document public.documents;
begin
  update public.documents
  set
    display_name = trim(p_display_name),
    category = p_category,
    notes = nullif(trim(p_notes), ''),
    is_default = false
  where
    id = p_document_id
    and user_id = (select auth.uid())
  returning * into updated_document;

  if not found then
    raise exception 'Document not found'
      using errcode = 'P0002';
  end if;

  if p_category <> 'cv' then
    update public.applications
    set cv_document_id = null
    where
      user_id = (select auth.uid())
      and cv_document_id = p_document_id;
  end if;

  if p_category <> 'cover_letter' then
    update public.applications
    set cover_letter_document_id = null
    where
      user_id = (select auth.uid())
      and cover_letter_document_id = p_document_id;
  end if;

  if p_is_default and p_category = 'cv' then
    update public.documents
    set is_default = false
    where
      user_id = (select auth.uid())
      and category = 'cv'
      and id <> p_document_id;

    update public.documents
    set is_default = true
    where id = p_document_id
    returning * into updated_document;
  end if;

  return updated_document;
end;
$$;

revoke all on function public.update_document_metadata(
  uuid,
  text,
  text,
  text,
  boolean
) from public;
grant execute on function public.update_document_metadata(
  uuid,
  text,
  text,
  text,
  boolean
) to authenticated;
grant execute on function public.update_document_metadata(
  uuid,
  text,
  text,
  text,
  boolean
) to service_role;

alter table public.applications
  add column if not exists job_description text,
  add column if not exists salary text,
  add column if not exists deadline date,
  add column if not exists recruiter_name text,
  add column if not exists recruiter_email text,
  add column if not exists recruiter_phone text,
  add column if not exists follow_up_at date,
  add column if not exists rejection_reason text,
  add column if not exists offer_amount text,
  add column if not exists offer_date date,
  add column if not exists offer_notes text,
  add column if not exists cv_document_id uuid,
  add column if not exists cover_letter_document_id uuid;

alter table public.applications
  add constraint applications_job_description_length check (
    job_description is null or char_length(job_description) <= 50000
  ),
  add constraint applications_salary_length check (
    salary is null or char_length(salary) <= 160
  ),
  add constraint applications_recruiter_name_length check (
    recruiter_name is null or char_length(recruiter_name) <= 160
  ),
  add constraint applications_recruiter_email_length check (
    recruiter_email is null or char_length(recruiter_email) <= 254
  ),
  add constraint applications_recruiter_phone_length check (
    recruiter_phone is null or char_length(recruiter_phone) <= 80
  ),
  add constraint applications_rejection_reason_length check (
    rejection_reason is null or char_length(rejection_reason) <= 5000
  ),
  add constraint applications_offer_amount_length check (
    offer_amount is null or char_length(offer_amount) <= 160
  ),
  add constraint applications_offer_notes_length check (
    offer_notes is null or char_length(offer_notes) <= 5000
  ),
  add constraint applications_cv_document_owner_fk
    foreign key (cv_document_id, user_id)
    references public.documents (id, user_id)
    on delete set null (cv_document_id),
  add constraint applications_cover_letter_document_owner_fk
    foreign key (cover_letter_document_id, user_id)
    references public.documents (id, user_id)
    on delete set null (cover_letter_document_id);

create index if not exists applications_user_id_deadline_idx
  on public.applications (user_id, deadline)
  where deadline is not null;

create index if not exists applications_user_id_follow_up_idx
  on public.applications (user_id, follow_up_at)
  where follow_up_at is not null;

create unique index if not exists applications_id_user_id_idx
  on public.applications (id, user_id);

create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  from_status public.application_status,
  to_status public.application_status not null,
  created_at timestamptz not null default now()
);

create index if not exists application_status_history_application_created_idx
  on public.application_status_history (application_id, created_at desc);

create table if not exists public.application_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  reminder_type text not null default 'follow_up' check (
    reminder_type in ('follow_up', 'deadline', 'interview', 'task')
  ),
  due_at timestamptz not null,
  notes text check (notes is null or char_length(notes) <= 2000),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists application_reminders_user_due_idx
  on public.application_reminders (user_id, due_at)
  where completed_at is null;

create table if not exists public.application_interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  stage text not null check (
    stage in ('screening', 'recruiter', 'technical', 'case_study', 'onsite', 'final', 'other')
  ),
  scheduled_at timestamptz not null,
  location text check (location is null or char_length(location) <= 500),
  notes text check (notes is null or char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.application_status_history
  add constraint application_status_history_owner_fk
    foreign key (application_id, user_id)
    references public.applications (id, user_id)
    on delete cascade;

alter table public.application_reminders
  add constraint application_reminders_owner_fk
    foreign key (application_id, user_id)
    references public.applications (id, user_id)
    on delete cascade;

alter table public.application_interviews
  add constraint application_interviews_owner_fk
    foreign key (application_id, user_id)
    references public.applications (id, user_id)
    on delete cascade;

create index if not exists application_interviews_application_scheduled_idx
  on public.application_interviews (application_id, scheduled_at desc);

drop trigger if exists application_reminders_set_updated_at
  on public.application_reminders;
create trigger application_reminders_set_updated_at
before update on public.application_reminders
for each row execute function public.set_updated_at();

drop trigger if exists application_interviews_set_updated_at
  on public.application_interviews;
create trigger application_interviews_set_updated_at
before update on public.application_interviews
for each row execute function public.set_updated_at();

create or replace function public.record_application_status_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.application_status_history (
      user_id,
      application_id,
      from_status,
      to_status
    )
    values (
      new.user_id,
      new.id,
      case when tg_op = 'INSERT' then null else old.status end,
      new.status
    );
  end if;

  return new;
end;
$$;

insert into public.application_status_history (
  user_id,
  application_id,
  from_status,
  to_status,
  created_at
)
select
  application.user_id,
  application.id,
  null,
  application.status,
  application.created_at
from public.applications as application
where not exists (
  select 1
  from public.application_status_history as history
  where history.application_id = application.id
);

drop trigger if exists applications_record_status_history
  on public.applications;
create trigger applications_record_status_history
after insert or update of status on public.applications
for each row execute function public.record_application_status_history();

alter table public.application_status_history enable row level security;
alter table public.application_reminders enable row level security;
alter table public.application_interviews enable row level security;

revoke all on table public.application_status_history from anon;
revoke all on table public.application_reminders from anon;
revoke all on table public.application_interviews from anon;

grant select on table public.application_status_history to authenticated;
grant select, insert, update, delete on table public.application_reminders
  to authenticated;
grant select, insert, update, delete on table public.application_interviews
  to authenticated;

grant all on table public.application_status_history to service_role;
grant all on table public.application_reminders to service_role;
grant all on table public.application_interviews to service_role;

create policy "Users can read their own status history"
on public.application_status_history
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read their own reminders"
on public.application_reminders
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own reminders"
on public.application_reminders
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own reminders"
on public.application_reminders
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own reminders"
on public.application_reminders
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read their own interviews"
on public.application_interviews
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own interviews"
on public.application_interviews
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own interviews"
on public.application_interviews
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own interviews"
on public.application_interviews
for delete
to authenticated
using ((select auth.uid()) = user_id);
