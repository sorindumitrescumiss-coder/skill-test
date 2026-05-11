import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { fetchSkillMintContext } from '@/lib/skill-test/mintContext';
import { tryServerMintSkillCredential } from '@/lib/nft/serverMintSkillCredential';

function isMissingRelationError(message?: string) {
  return (message ?? '').toLowerCase().includes('does not exist');
}

function scheduleClaimMint(
  admin: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  attemptId: string,
  credentialId?: string | null,
) {
  void (async () => {
    try {
      const ctx = await fetchSkillMintContext(admin, userId, attemptId);
      await tryServerMintSkillCredential({
        admin,
        userId,
        attemptId,
        resultId: ctx.resultId,
        score: ctx.score,
        passed: ctx.passed,
        credentialId: credentialId ?? null,
        trigger: 'claim',
      });
    } catch (e) {
      console.warn('[claim mint schedule]', e instanceof Error ? e.message : e);
    }
  })();
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { attemptId?: string };
  if (!body.attemptId) {
    return NextResponse.json({ error: 'Body must include { attemptId }' }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const { data: passedResult, error: resultErr } = await supabase
    .from('skill_test_results')
    .select('id, user_id, attempt_id, passed, eligible_nft')
    .eq('user_id', user.id)
    .eq('attempt_id', body.attemptId)
    .eq('passed', true)
    .eq('eligible_nft', true)
    .maybeSingle();

  let resultId: string | null = null;
  if (resultErr && !isMissingRelationError(resultErr.message)) {
    return NextResponse.json({ error: resultErr.message }, { status: 500 });
  }
  if (passedResult) {
    resultId = passedResult.id;
  } else {
    const { data: normalizedAttempt, error: attemptErr } = await supabase
      .from('test_attempts')
      .select('id, user_id, passed, score, test_id')
      .eq('id', body.attemptId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (attemptErr || !normalizedAttempt) {
      return NextResponse.json({ error: attemptErr?.message || 'Attempt not found' }, { status: 404 });
    }
    if (!normalizedAttempt.passed) {
      return NextResponse.json({ error: 'This attempt is not eligible for claim.' }, { status: 400 });
    }
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Config error';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: existing, error: existingErr } = await admin
    .from('skill_credential_claims')
    .select('id, credential_id, created_at')
    .eq('user_id', user.id)
    .eq('attempt_id', body.attemptId)
    .maybeSingle();

  if (existingErr && existingErr.code !== 'PGRST116' && !isMissingRelationError(existingErr.message)) {
    return NextResponse.json(
      { error: 'Certificate claim is temporarily unavailable. Please try again later.' },
      { status: 500 },
    );
  }
  if (existing) {
    scheduleClaimMint(admin, user.id, body.attemptId, existing.credential_id);
    return NextResponse.json({
      alreadyClaimed: true,
      credentialId: existing.credential_id,
      claimedAt: existing.created_at,
    });
  }

  const credentialId = `CERT-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const { data: created, error: insertErr } = await admin
    .from('skill_credential_claims')
    .insert({
      user_id: user.id,
      attempt_id: body.attemptId,
      result_id: resultId,
      credential_id: credentialId,
    })
    .select('credential_id, created_at')
    .single();

  if (insertErr && !isMissingRelationError(insertErr.message)) {
    return NextResponse.json(
      { error: 'Certificate claim is temporarily unavailable. Please try again later.' },
      { status: 500 },
    );
  }

  if (insertErr && isMissingRelationError(insertErr.message)) {
    const { data: attemptForCert, error: attemptForCertErr } = await supabase
      .from('test_attempts')
      .select('id, user_id, test_id, score, passed')
      .eq('id', body.attemptId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (attemptForCertErr || !attemptForCert) {
      return NextResponse.json({ error: attemptForCertErr?.message || 'Attempt not found' }, { status: 404 });
    }
    if (!attemptForCert.passed) {
      return NextResponse.json({ error: 'This attempt is not eligible for claim.' }, { status: 400 });
    }

    const { data: existingCert, error: existingCertErr } = await admin
      .from('certificates')
      .select('id, verification_code, issued_at')
      .eq('user_id', user.id)
      .eq('attempt_id', body.attemptId)
      .maybeSingle();
    if (existingCertErr && existingCertErr.code !== 'PGRST116') {
      return NextResponse.json({ error: existingCertErr.message }, { status: 500 });
    }
    if (existingCert) {
      scheduleClaimMint(admin, user.id, body.attemptId, existingCert.verification_code ?? existingCert.id);
      return NextResponse.json({
        alreadyClaimed: true,
        credentialId: existingCert.verification_code ?? existingCert.id,
        claimedAt: existingCert.issued_at,
      });
    }

    const { data: createdCert, error: createdCertErr } = await admin
      .from('certificates')
      .insert({
        user_id: user.id,
        test_id: attemptForCert.test_id,
        attempt_id: body.attemptId,
        score: attemptForCert.score ?? 0,
        level: 'passed',
        certificate_url: '',
        nft_token_id: null,
        wallet_address: null,
        verification_code: credentialId,
      })
      .select('verification_code, issued_at')
      .single();
    if (createdCertErr) {
      return NextResponse.json({ error: createdCertErr.message }, { status: 500 });
    }
    scheduleClaimMint(admin, user.id, body.attemptId, createdCert.verification_code ?? credentialId);
    return NextResponse.json({
      alreadyClaimed: false,
      credentialId: createdCert.verification_code,
      claimedAt: createdCert.issued_at,
    });
  }

  scheduleClaimMint(admin, user.id, body.attemptId, created?.credential_id ?? credentialId);
  return NextResponse.json({
    alreadyClaimed: false,
    credentialId: created?.credential_id ?? credentialId,
    claimedAt: created?.created_at ?? new Date().toISOString(),
  });
}

