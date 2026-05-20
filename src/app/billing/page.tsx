'use client';

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import {
  SKILL_DIFFICULTY_PRICING,
  formatSkillPrice,
  type SkillDifficulty,
} from '@/lib/stripe/pricing';
import { CheckCircle2, CreditCard, Loader2, Sparkles } from 'lucide-react';

type PricingTier = {
  id: SkillDifficulty;
  label: string;
  formattedPrice: string;
};

const FALLBACK_TIERS: PricingTier[] = (
  Object.entries(SKILL_DIFFICULTY_PRICING) as [SkillDifficulty, { label: string; amountCents: number }][]
).map(([id, { label, amountCents }]) => ({
  id,
  label,
  formattedPrice: formatSkillPrice(amountCents),
}));

export default function BillingPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [pricingTiers, setPricingTiers] = React.useState<PricingTier[]>(FALLBACK_TIERS);
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<SkillDifficulty>('intermediate');
  const [paymentRequired, setPaymentRequired] = React.useState(true);
  const [stripeConfigured, setStripeConfigured] = React.useState(false);
  const [hasCredit, setHasCredit] = React.useState(false);
  const [statusLoading, setStatusLoading] = React.useState(true);
  const [checkoutBusy, setCheckoutBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedTier =
    pricingTiers.find((t) => t.id === selectedDifficulty) ??
    pricingTiers.find((t) => t.id === 'intermediate') ??
    pricingTiers[0];

  React.useEffect(() => {
    const sb = getSupabaseBrowser();
    void sb.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadStatus = React.useCallback(async () => {
    setStatusLoading(true);
    setError(null);
    try {
      const configRes = await fetch('/api/stripe/config');
      const config = (await configRes.json()) as {
        paymentRequired?: boolean;
        stripeConfigured?: boolean;
        pricingTiers?: PricingTier[];
      };
      if (config.pricingTiers?.length) {
        setPricingTiers(config.pricingTiers);
      }
      setPaymentRequired(Boolean(config.paymentRequired));
      setStripeConfigured(Boolean(config.stripeConfigured));

      if (!user) {
        setHasCredit(false);
        return;
      }

      const creditsRes = await fetch('/api/stripe/credits');
      const credits = (await creditsRes.json()) as {
        credit?: { id: string } | null;
        paymentRequired?: boolean;
        error?: string;
      };
      if (!creditsRes.ok) {
        setError(credits.error ?? 'Could not load payment status.');
        return;
      }
      setHasCredit(Boolean(credits.credit) || credits.paymentRequired === false);
    } catch {
      setError('Could not load billing information.');
    } finally {
      setStatusLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const startCheckout = async () => {
    setCheckoutBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: selectedDifficulty }),
      });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !j.url) {
        setError(j.error ?? 'Checkout could not be started.');
        return;
      }
      window.location.href = j.url;
    } catch {
      setError('Could not connect to Stripe.');
    } finally {
      setCheckoutBusy(false);
    }
  };

  const busy = authLoading || statusLoading;

  return (
    <AppLayout activePath="/billing">
      <div className="relative isolate mx-auto max-w-lg px-1 py-4 sm:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[min(100%,480px)] -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-32 right-0 h-40 w-40 rounded-full bg-indigo-300/25 blur-3xl"
        />

        <header className="relative text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-violet-700 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Billing
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Pay for a skill test attempt
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            One payment unlocks one exam session. Pick your difficulty — pricing updates automatically.
          </p>
        </header>

        <div className="relative mt-8">
          {busy ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 py-14 text-sm text-slate-600 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
              <Loader2 className="h-4 w-4 animate-spin text-violet-600" aria-hidden />
              Loading…
            </div>
          ) : !stripeConfigured ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
              <p className="font-semibold">Stripe is not configured</p>
              <p className="mt-1">
                Add <code className="text-xs">STRIPE_SECRET_KEY</code> and{' '}
                <code className="text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your environment.
              </p>
            </div>
          ) : !user ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/60">
              <p className="text-sm text-slate-600">Sign in to pay securely with Stripe.</p>
              <Link
                href="/sign-up-login-screen?next=/billing"
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500"
              >
                Sign in to continue
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60">
              <div className="border-b border-slate-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50/80 px-6 py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Exam fee</p>
                    <p className="mt-1 bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-4xl font-bold tabular-nums text-transparent">
                      {selectedTier?.formattedPrice ?? '$30.00'}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">{selectedTier?.label ?? 'Intermediate'}</span>
                      <span className="text-slate-400"> · </span>
                      per attempt
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
                    <CreditCard className="h-5 w-5 text-violet-600" aria-hidden />
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Difficulty level</p>
                <ul className="mt-3 space-y-2" role="radiogroup" aria-label="Difficulty level">
                  {pricingTiers.map((tier) => {
                    const selected = selectedDifficulty === tier.id;
                    return (
                      <li key={tier.id}>
                        <label
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-200 ${
                            selected
                              ? 'border-violet-400 bg-violet-50 shadow-sm shadow-violet-100 ring-2 ring-violet-500/30'
                              : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50/80'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                selected ? 'border-violet-600 bg-violet-600' : 'border-slate-300 bg-white'
                              }`}
                              aria-hidden
                            >
                              {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                            </span>
                            <span className={`font-medium ${selected ? 'text-violet-950' : 'text-slate-800'}`}>
                              {tier.label}
                            </span>
                          </span>
                          <span
                            className={`font-semibold tabular-nums ${selected ? 'text-violet-700' : 'text-slate-600'}`}
                          >
                            {tier.formattedPrice}
                          </span>
                          <input
                            type="radio"
                            name="difficulty"
                            value={tier.id}
                            checked={selected}
                            onChange={() => setSelectedDifficulty(tier.id)}
                            className="sr-only"
                          />
                        </label>
                      </li>
                    );
                  })}
                </ul>

                {hasCredit && paymentRequired ? (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    <div>
                      <p className="font-semibold">Unused attempt credit</p>
                      <p className="mt-0.5 text-emerald-800">You can start the skill test without paying again.</p>
                    </div>
                  </div>
                ) : null}

                {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

                {!paymentRequired ? (
                  <p className="mt-5 text-sm text-slate-600">Payments are optional in this environment.</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => void startCheckout()}
                    disabled={checkoutBusy}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60"
                  >
                    {checkoutBusy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Redirecting to Stripe…
                      </>
                    ) : (
                      <>Pay {selectedTier?.formattedPrice ?? '$30.00'} with Stripe</>
                    )}
                  </button>
                )}

                <div className="mt-6 flex flex-wrap justify-center gap-4 border-t border-slate-100 pt-5 text-sm">
                  <Link href="/skill-test" className="font-semibold text-violet-600 hover:text-violet-700">
                    Start skill test →
                  </Link>
                  <Link href="/dashboard" className="text-slate-500 hover:text-slate-800">
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="relative mt-6 text-center text-xs text-slate-500">
          Bookmark: <span className="font-mono text-violet-600">/billing</span>
        </p>
      </div>
    </AppLayout>
  );
}
