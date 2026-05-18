'use client';

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';

export default function BillingPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [formattedPrice, setFormattedPrice] = React.useState('$19.00');
  const [paymentRequired, setPaymentRequired] = React.useState(true);
  const [stripeConfigured, setStripeConfigured] = React.useState(false);
  const [hasCredit, setHasCredit] = React.useState(false);
  const [statusLoading, setStatusLoading] = React.useState(true);
  const [checkoutBusy, setCheckoutBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
        formattedPrice?: string;
        paymentRequired?: boolean;
        stripeConfigured?: boolean;
      };
      setFormattedPrice(config.formattedPrice ?? '$19.00');
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
        body: JSON.stringify({}),
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

  return (
    <AppLayout activePath="/billing">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Billing</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Pay for a skill test attempt</h1>
          <p className="mt-2 text-sm text-slate-600">
            One payment unlocks one full exam session. No setup wizard required — pay here, then start your test anytime.
          </p>
        </div>

        {authLoading || statusLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : !stripeConfigured ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Stripe is not configured yet. Add <code className="text-xs">STRIPE_SECRET_KEY</code> and{' '}
            <code className="text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your environment (see{' '}
            <code className="text-xs">.env.example</code>).
          </div>
        ) : !user ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-700">Sign in to pay securely with Stripe.</p>
            <Link
              href="/sign-up-login-screen?next=/billing"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-parchment-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-parchment-900"
            >
              Sign in to continue
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exam fee</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{formattedPrice}</p>
                <p className="mt-1 text-sm text-slate-600">Per attempt · secure checkout via Stripe</p>
              </div>
              <CreditCard className="h-10 w-10 text-slate-300" aria-hidden />
            </div>

            {hasCredit && paymentRequired ? (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <p className="font-semibold">You have an unused attempt credit</p>
                  <p className="mt-0.5 text-emerald-800">Go straight to the skill test — no need to pay again.</p>
                </div>
              </div>
            ) : null}

            {!paymentRequired ? (
              <p className="mt-5 text-sm text-slate-600">Payments are optional in this environment. Skill tests are free to start.</p>
            ) : (
              <button
                type="button"
                onClick={() => void startCheckout()}
                disabled={checkoutBusy}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
              >
                {checkoutBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Redirecting to Stripe…
                  </>
                ) : (
                  <>Pay {formattedPrice} with Stripe</>
                )}
              </button>
            )}

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
              <Link href="/skill-test" className="text-sm font-semibold text-violet-700 hover:underline">
                Start skill test →
              </Link>
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-500">
          Bookmark this page:{' '}
          <span className="font-mono text-violet-700">/billing</span>
        </p>
              </div>
    </AppLayout>
  );
}
