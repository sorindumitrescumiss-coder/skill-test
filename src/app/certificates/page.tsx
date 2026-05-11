import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { getSupabaseServer } from '@/lib/supabase/server';

type CertificateRow = {
  id: string;
  credential_id: string;
  attempt_id: string;
  created_at: string;
};

type ProfileRow = {
  full_name: string | null;
  role: string | null;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  website_url: string | null;
};

function isMissingRelationError(message?: string) {
  const m = (message ?? '').toLowerCase();
  return m.includes('does not exist') || m.includes('could not find the table') || m.includes('schema cache');
}

export default async function CertificatesPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let certificates: CertificateRow[] = [];
  let profile: ProfileRow | null = null;
  let loadError = '';

  if (user) {
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select(
        'full_name,role,company_name,first_name,last_name,phone,location,summary,linkedin_url,github_url,portfolio_url,website_url',
      )
      .eq('id', user.id)
      .maybeSingle();
    if (!profileErr && profileData) {
      profile = profileData as ProfileRow;
    }

    const { data, error } = await supabase
      .from('skill_credential_claims')
      .select('id, credential_id, attempt_id, created_at')
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116' && !isMissingRelationError(error.message)) {
      loadError = error.message;
    } else if (error && isMissingRelationError(error.message)) {
      const { data: certData, error: certErr } = await supabase
        .from('certificates')
        .select('id, verification_code, attempt_id, issued_at')
        .order('issued_at', { ascending: false });
      if (certErr && certErr.code !== 'PGRST116') {
        loadError = certErr.message;
      } else {
        certificates = ((certData ?? []) as Array<{ id: string; verification_code: string; attempt_id: string; issued_at: string }>).map(
          (row) => ({
            id: row.id,
            credential_id: row.verification_code,
            attempt_id: row.attempt_id,
            created_at: row.issued_at,
          }),
        );
      }
    } else {
      certificates = (data ?? []) as CertificateRow[];
    }
  }
  const hasNftCredential = certificates.length > 0;

  return (
    <AppLayout activePath="/certificates">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">My Information</h1>
        <p className="text-sm text-slate-600">Your profile and certificate details are listed here.</p>
        {!user ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-700">Sign in to view your information.</p>
            <Link href="/sign-up-login-screen" className="mt-3 inline-block text-sm font-medium text-violet-700 hover:underline">
              Go to sign in
            </Link>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">Could not load certificates: {loadError}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-900">User Profile</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p><span className="font-medium text-slate-900">Email:</span> {user.email ?? '-'}</p>
              <p><span className="font-medium text-slate-900">Role:</span> {profile?.role || '-'}</p>
              <p><span className="font-medium text-slate-900">Full name:</span> {profile?.full_name || '-'}</p>
              <p><span className="font-medium text-slate-900">First name:</span> {profile?.first_name || '-'}</p>
              <p><span className="font-medium text-slate-900">Last name:</span> {profile?.last_name || '-'}</p>
              <p><span className="font-medium text-slate-900">Company:</span> {profile?.company_name || '-'}</p>
              <p><span className="font-medium text-slate-900">Phone:</span> {profile?.phone || '-'}</p>
              <p><span className="font-medium text-slate-900">Location:</span> {profile?.location || '-'}</p>
            </div>
            <p className="mt-3 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Summary:</span> {profile?.summary || '-'}
            </p>
            <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p><span className="font-medium text-slate-900">LinkedIn:</span> {profile?.linkedin_url || '-'}</p>
              <p><span className="font-medium text-slate-900">GitHub:</span> {profile?.github_url || '-'}</p>
              <p><span className="font-medium text-slate-900">Portfolio:</span> {profile?.portfolio_url || '-'}</p>
              <p><span className="font-medium text-slate-900">Website:</span> {profile?.website_url || '-'}</p>
            </div>
          </div>
        )}

        {user && !loadError ? (
          <section
            className={`rounded-xl border p-5 ${
              hasNftCredential ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">NFT Credential</p>
            {hasNftCredential ? (
              <>
                <h2 className="mt-2 text-lg font-semibold text-emerald-900">NFT Received - Skill Verified</h2>
                <p className="mt-2 text-sm text-emerald-800">
                  Congratulations! You passed the exam and received your NFT credential. Use this verified proof to
                  strengthen your profile and unlock more job opportunities.
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-2 text-lg font-semibold text-amber-900">You have not received an NFT yet</h2>
                <p className="mt-2 text-sm text-amber-800">
                  Verify your skills to receive an NFT and gain more job opportunities.
                </p>
                <Link
                  href="/skill-test"
                  className="mt-3 inline-flex rounded-md border border-amber-700 bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-800"
                >
                  Verify skills now
                </Link>
              </>
            )}
          </section>
        ) : null}

        {user && !loadError && certificates.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {certificates.map((cert) => (
              <article key={cert.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Credential ID</p>
                <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{cert.credential_id}</p>
                <p className="mt-2 text-xs text-slate-600">Attempt: {cert.attempt_id}</p>
                <p className="text-xs text-slate-600">Claimed: {new Date(cert.created_at).toLocaleString()}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
