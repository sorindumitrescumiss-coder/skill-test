-- Backend profile storage for TrueAssess profile page.
-- Run this in Supabase SQL editor.

alter table if exists public.profiles
  add column if not exists phone text,
  add column if not exists location text,
  add column if not exists summary text,
  add column if not exists resume_file_name text,
  add column if not exists resume_uploaded_at timestamptz,
  add column if not exists profile_completed boolean default false,
  add column if not exists updated_at timestamptz default now();

-- Optional app-level users table sync columns (public.users in Supabase Table Editor)
alter table if exists public.users
  add column if not exists full_name text,
  add column if not exists role text,
  add column if not exists company_name text,
  add column if not exists phone text,
  add column if not exists location text,
  add column if not exists summary text;

create or replace function public.set_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Signup trigger: copy phone / location / summary from auth metadata into profiles (same as SignUpForm options.data)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, company_name, phone, location, summary)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'candidate'),
    nullif(new.raw_user_meta_data->>'company_name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'location', ''),
    nullif(new.raw_user_meta_data->>'summary', '')
  );
  on conflict (id) do nothing;
  return new;
end;
$$;
