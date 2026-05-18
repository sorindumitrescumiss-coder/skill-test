import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { findAvailableCredit, isMissingPaymentsTable } from '@/lib/stripe/payments';
import { isStripePaymentRequired } from '@/lib/stripe/config';

export async function GET() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  if (!isStripePaymentRequired()) {
    return NextResponse.json({ paymentRequired: false, credit: null });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Config error';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    const credit = await findAvailableCredit(admin, user.id);
    return NextResponse.json({
      paymentRequired: true,
      credit: credit
        ? {
            id: credit.id,
            fieldId: credit.field_id,
            amountCents: credit.amount_cents,
            currency: credit.currency,
            createdAt: credit.created_at,
          }
        : null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load credits';
    if (isMissingPaymentsTable(message)) {
      return NextResponse.json(
        {
          error: 'Payments table not found. Run supabase/stripe_payments.sql in Supabase SQL Editor.',
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
