-- Phase 4 private document storage and metadata.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'resumes',
  'resumes',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null unique,
  original_name text not null check (
    char_length(original_name) between 1 and 255
  ),
  mime_type text not null check (
    mime_type in (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  ),
  size_bytes bigint not null check (
    size_bytes > 0 and size_bytes <= 10485760
  ),
  processing_status text not null default 'uploaded' check (
    processing_status in ('uploaded', 'processing', 'ready', 'failed')
  ),
  structured_data jsonb not null default '{}'::jsonb check (
    jsonb_typeof(structured_data) = 'object'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_user_id_created_at_idx
  on public.documents (user_id, created_at desc);

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

alter table public.documents enable row level security;

revoke all on table public.documents from anon;
grant select, insert, update, delete on table public.documents to authenticated;
grant all on table public.documents to service_role;

drop policy if exists "Users can read their own documents" on public.documents;
create policy "Users can read their own documents"
on public.documents
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own documents" on public.documents;
create policy "Users can create their own documents"
on public.documents
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own documents" on public.documents;
create policy "Users can update their own documents"
on public.documents
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own documents" on public.documents;
create policy "Users can delete their own documents"
on public.documents
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can upload their own resumes" on storage.objects;
create policy "Users can upload their own resumes"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can read their own resumes" on storage.objects;
create policy "Users can read their own resumes"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and owner_id = (select auth.uid())
);

drop policy if exists "Users can delete their own resumes" on storage.objects;
create policy "Users can delete their own resumes"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resumes'
  and owner_id = (select auth.uid())
);
