-- Stores backend-visible lifecycle data for full exam-period screen capture.
-- Run this in Supabase SQL Editor.

create table if not exists public.skill_test_recordings (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.test_attempts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'started' check (status in ('started', 'capture_stopped', 'uploaded', 'upload_failed')),
  started_at timestamptz,
  capture_stopped_at timestamptz,
  uploaded_at timestamptz,
  storage_path text,
  mime_type text,
  bytes bigint,
  captured_bytes bigint,
  upload_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skill_test_recordings_user_id_idx on public.skill_test_recordings (user_id);
create index if not exists skill_test_recordings_attempt_id_idx on public.skill_test_recordings (attempt_id);

create or replace function public.set_skill_test_recordings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_skill_test_recordings_updated_at on public.skill_test_recordings;
create trigger trg_skill_test_recordings_updated_at
before update on public.skill_test_recordings
for each row execute function public.set_skill_test_recordings_updated_at();

alter table public.skill_test_recordings enable row level security;

drop policy if exists "skill_test_recordings_select_own" on public.skill_test_recordings;
create policy "skill_test_recordings_select_own"
  on public.skill_test_recordings for select
  to authenticated
  using (auth.uid() = user_id);

-- Inserts/updates are performed by server routes via service role key.
