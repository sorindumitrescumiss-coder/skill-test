import type { SupabaseClient } from '@supabase/supabase-js';

export type SkillTestPaymentRow = {
  id: string;
  user_id: string;
  field_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  consumed_at: string | null;
  attempt_id: string | null;
  created_at: string;
};

export function isMissingPaymentsTable(message?: string) {
  const m = (message ?? '').toLowerCase();
  return m.includes('skill_test_payments') && (m.includes('does not exist') || m.includes('schema cache'));
}

export async function findAvailableCredit(
  admin: SupabaseClient,
  userId: string,
): Promise<SkillTestPaymentRow | null> {
  const { data, error } = await admin
    .from('skill_test_payments')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .is('consumed_at', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingPaymentsTable(error.message)) return null;
    throw new Error(error.message);
  }
  return (data as SkillTestPaymentRow | null) ?? null;
}

export async function consumePayment(
  admin: SupabaseClient,
  paymentId: string,
  userId: string,
  attemptId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: row, error: fetchErr } = await admin
    .from('skill_test_payments')
    .select('id, user_id, status, consumed_at')
    .eq('id', paymentId)
    .maybeSingle();

  if (fetchErr) {
    return { ok: false, error: fetchErr.message };
  }
  if (!row || row.user_id !== userId) {
    return { ok: false, error: 'Payment not found.' };
  }
  if (row.status !== 'paid') {
    return { ok: false, error: 'Payment is not completed.' };
  }
  if (row.consumed_at) {
    return { ok: false, error: 'This payment was already used for an attempt.' };
  }

  const { error: updateErr } = await admin
    .from('skill_test_payments')
    .update({
      consumed_at: new Date().toISOString(),
      attempt_id: attemptId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
    .eq('user_id', userId)
    .is('consumed_at', null);

  if (updateErr) {
    return { ok: false, error: updateErr.message };
  }
  return { ok: true };
}

export async function markPaymentPaid(
  admin: SupabaseClient,
  sessionId: string,
  paymentIntentId: string | null,
): Promise<void> {
  const { error } = await admin
    .from('skill_test_payments')
    .update({
      status: 'paid',
      stripe_payment_intent_id: paymentIntentId,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_checkout_session_id', sessionId)
    .eq('status', 'pending');

  if (error && !isMissingPaymentsTable(error.message)) {
    throw new Error(error.message);
  }
}
