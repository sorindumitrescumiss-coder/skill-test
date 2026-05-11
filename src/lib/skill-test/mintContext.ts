import type { SupabaseClient } from '@supabase/supabase-js';

/** Grade + result row for automated NFT eligibility (service role reads). */
export async function fetchSkillMintContext(
  admin: SupabaseClient,
  userId: string,
  attemptId: string,
): Promise<{ resultId: string | null; score: number; passed: boolean }> {
  const { data: sr, error: srErr } = await admin
    .from('skill_test_results')
    .select('id, score, passed')
    .eq('user_id', userId)
    .eq('attempt_id', attemptId)
    .maybeSingle();

  if (!srErr && sr && typeof sr.score === 'number') {
    return {
      resultId: sr.id ?? null,
      score: sr.score,
      passed: Boolean(sr.passed),
    };
  }

  const { data: ta } = await admin
    .from('test_attempts')
    .select('score, passed')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .maybeSingle();

  const taRecord = ta as { score?: unknown; passed?: unknown } | null;

  const scoreRaw = taRecord?.score;
  const score = typeof scoreRaw === 'number' && Number.isFinite(scoreRaw) ? scoreRaw : 0;

  return {
    resultId: null,
    score,
    passed: Boolean(taRecord?.passed),
  };
}
