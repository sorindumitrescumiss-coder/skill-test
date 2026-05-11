'use client';

import React, { useMemo, useState } from 'react';
import supabase from '@/lib/supabase';

type Status = 'idle' | 'loading' | 'success' | 'error';

function getConnectionErrorHint(message: string) {
  const msg = message.toLowerCase();
  if (msg.includes('permission denied') || msg.includes('row-level security')) {
    return 'Your account may not have permission for this action.';
  }
  if (msg.includes('relation') && msg.includes('does not exist')) {
    return 'This feature is not available yet.';
  }
  if (msg.includes('invalid api key') || msg.includes('jwt')) {
    return 'Service configuration error. Try again later or contact support.';
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Connection problem. Check your network and try again.';
  }
  return 'If this keeps happening, contact support with the message below.';
}

export default function SupabaseResultsDemo() {
  const [walletAddress, setWalletAddress] = useState('0x123');
  const [score, setScore] = useState(85);
  const [passed, setPassed] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [lastRow, setLastRow] = useState<Record<string, unknown> | null>(null);

  const envReady = useMemo(() => {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }, []);

  const checkConnection = async () => {
    setStatus('loading');
    setMessage('Checking connection...');
    setLastRow(null);

    const { data, error } = await supabase.from('results').select('*').limit(1);
    if (error) {
      setStatus('error');
      setMessage(`${error.message}\nHint: ${getConnectionErrorHint(error.message)}`);
      return;
    }

    setStatus('success');
    setMessage('Connection successful — read completed.');
    setLastRow((data?.[0] as Record<string, unknown> | undefined) ?? null);
  };

  const saveResult = async () => {
    if (!walletAddress.trim()) {
      setStatus('error');
      setMessage('Wallet address is required.');
      return;
    }

    setStatus('loading');
    setMessage('Saving result...');
    setLastRow(null);

    const { data, error } = await supabase
      .from('results')
      .insert([
        {
          wallet_address: walletAddress.trim(),
          score,
          passed,
        },
      ])
      .select()
      .single();

    if (error) {
      setStatus('error');
      setMessage(`${error.message}\nHint: ${getConnectionErrorHint(error.message)}`);
      return;
    }

    setStatus('success');
    setMessage('Insert successful — your row was saved.');
    setLastRow((data as Record<string, unknown>) ?? null);
  };

  return (
    <section className="space-y-3 rounded-xl border border-parchment-300/65 bg-parchment-150/85 p-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Backend connection check</h2>
        <p className="text-xs text-slate-500 mt-1">
          Developer tool: test reading from the results table and inserting a sample row.
        </p>
        {!envReady && (
          <p className="mt-2 text-xs text-red-600">
            Live backend is not configured for this environment. Contact your administrator.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Wallet address"
          className="input-field text-sm"
        />
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          min={0}
          max={100}
          className="input-field text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={passed}
            onChange={(e) => setPassed(e.target.checked)}
            className="rounded border-slate-300"
          />
          Passed
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={checkConnection} className="btn-secondary text-sm">
          Test Read
        </button>
        <button onClick={saveResult} className="btn-primary text-sm">
          Insert Result
        </button>
      </div>

      {status !== 'idle' && (
        <div
          className={`rounded-lg border p-3 text-xs whitespace-pre-wrap ${
            status === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : status === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {message}
        </div>
      )}

      {lastRow && (
        <pre className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs overflow-auto">
          {JSON.stringify(lastRow, null, 2)}
        </pre>
      )}
    </section>
  );
}
