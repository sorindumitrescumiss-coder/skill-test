-- Run in Supabase SQL Editor after results.sql (or merge with your project).
-- Enables: profiles on signup, skill test attempts, server-graded results, NFT eligibility flag.

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'candidate' check (role in ('candidate', 'recruiter')),
  company_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Auto-create profile when a user signs up (reads user_metadata from signUp)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'candidate'),
    nullif(new.raw_user_meta_data->>'company_name', '')
  );
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Skill test attempts (questions generated / stored server-side)
create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null default 'General',
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  questions_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  submitted_at timestamptz
);

create index if not exists test_attempts_user_id_idx on public.test_attempts (user_id);

alter table public.test_attempts enable row level security;

create policy "test_attempts_select_own"
  on public.test_attempts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "test_attempts_insert_own"
  on public.test_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "test_attempts_update_own"
  on public.test_attempts for update
  to authenticated
  using (auth.uid() = user_id);

-- Graded results (inserts only from service role / API — not from browser)
create table if not exists public.skill_test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  attempt_id uuid references public.test_attempts (id) on delete set null,
  score integer not null check (score >= 0 and score <= 100),
  passed boolean not null,
  feedback text,
  eligible_nft boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists skill_test_results_user_id_idx on public.skill_test_results (user_id);

alter table public.skill_test_results enable row level security;

create policy "skill_test_results_select_own"
  on public.skill_test_results for select
  to authenticated
  using (auth.uid() = user_id);

-- No insert/update policies for clients — use API with SUPABASE_SERVICE_ROLE_KEY

-- Credential claims (one claim per passed attempt)
create table if not exists public.skill_credential_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  attempt_id uuid not null references public.test_attempts (id) on delete cascade,
  result_id uuid references public.skill_test_results (id) on delete set null,
  credential_id text not null unique,
  created_at timestamptz not null default now(),
  unique(user_id, attempt_id)
);

create index if not exists skill_credential_claims_user_id_idx on public.skill_credential_claims (user_id);

alter table public.skill_credential_claims enable row level security;

create policy "skill_credential_claims_select_own"
  on public.skill_credential_claims for select
  to authenticated
  using (auth.uid() = user_id);
