-- Server-side NFT mint audit + idempotency (one mint per skill test attempt).
-- Run in Supabase SQL Editor after app_schema.sql.
-- Rows are inserted/updated only from API routes using the service role.

alter table public.profiles
  add column if not exists wallet_address text;

comment on column public.profiles.wallet_address is 'EVM recipient for automated credential NFT mints';

create table if not exists public.skill_test_nft_mints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  attempt_id uuid not null unique,
  result_id uuid references public.skill_test_results (id) on delete set null,
  credential_id text,
  wallet_address text not null,
  chain_id integer not null,
  contract_address text not null,
  tx_hash text,
  token_id text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed')),
  trigger_source text not null check (trigger_source in ('submit', 'claim')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skill_test_nft_mints_user_id_idx on public.skill_test_nft_mints (user_id);

-- Service role bypasses RLS; block direct client access.
alter table public.skill_test_nft_mints enable row level security;
