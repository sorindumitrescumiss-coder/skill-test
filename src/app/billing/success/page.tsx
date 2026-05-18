'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

function BillingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = React.useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = React.useState('Confirming your payment…');

  React.useEffect(() => {
    if (!sessionId) {
      setStatus('ok');
      setMessage('Payment received. You can start your skill test.');
      return;
    }
    void (async () => {
      try {
        const res = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const j = (await res.json().catch(() => ({}))) as { error?: string; paid?: boolean };
        if (!res.ok || !j.paid) {
          setStatus('error');
          setMessage(j.error ?? 'Payment could not be confirmed yet. If you were charged, refresh in a moment.');
          return;
        }
        setStatus('ok');
        setMessage('Payment confirmed. Your exam attempt credit is ready.');
      } catch {
        setStatus('error');
        setMessage('Could not verify payment. Try again from the skill test page.');
      }
    })();
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-emerald-200 bg-emerald-50 p-6">
      <h1 className="text-xl font-semibold text-emerald-900">
        {status === 'loading' ? 'Processing payment' : status === 'ok' ? 'Payment successful' : 'Payment pending'}
      </h1>
      <p className="mt-2 text-sm text-emerald-800">{message}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/billing"
            className="inline-flex rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            Back to billing
          </Link>
          <Link
            href="/skill-test"
            className="inline-flex rounded-md border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            Start skill test
          </Link>
        </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <AppLayout activePath="/skill-test">
      <Suspense fallback={<p className="text-sm text-slate-600">Loading…</p>}>
        <BillingSuccessContent />
      </Suspense>
    </AppLayout>
  );
}
