-- Run this in Supabase SQL Editor.
-- Creates a simple results table plus RLS policies for anon read/write.

create table if not exists public.results (
  id bigint generated always as identity primary key,
  wallet_address text not null,
  score integer not null check (score >= 0 and score <= 100),
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.results enable row level security;

-- Allow public (anon) users to read rows.
create policy "anon can read results"
on public.results
for select
to anon
using (true);

-- Allow public (anon) users to insert rows.
create policy "anon can insert results"
on public.results
for insert
to anon
with check (true);
