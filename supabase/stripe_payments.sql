-- Run in Supabase SQL Editor after app_schema.sql.
-- Tracks Stripe Checkout payments for skill test attempts.

create table if not exists public.skill_test_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  field_id text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired')),
  consumed_at timestamptz,
  attempt_id uuid references public.test_attempts (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skill_test_payments_user_id_idx on public.skill_test_payments (user_id);
create index if not exists skill_test_payments_status_idx on public.skill_test_payments (user_id, status) where consumed_at is null;

alter table public.skill_test_payments enable row level security;

create policy "skill_test_payments_select_own"
  on public.skill_test_payments for select
  to authenticated
  using (auth.uid() = user_id);

-- Inserts/updates only via service role (API routes + webhooks)
