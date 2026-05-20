import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/server';
import {
  getSiteUrl,
  getSkillTestAmountCents,
  getStripeCurrency,
  isStripeConfigured,
  isStripePaymentRequired,
} from '@/lib/stripe/config';
import {
  parseSkillDifficulty,
  SKILL_DIFFICULTY_PRICING,
} from '@/lib/stripe/pricing';
import { isMissingPaymentsTable } from '@/lib/stripe/payments';

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isStripePaymentRequired()) {
    return NextResponse.json({ error: 'Stripe payments are not enabled.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    fieldId?: string;
    difficulty?: string;
  };
  const fieldId = typeof body.fieldId === 'string' ? body.fieldId.trim().slice(0, 80) : null;
  const difficulty = parseSkillDifficulty(body.difficulty);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Config error';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const amountCents = getSkillTestAmountCents(difficulty);
  const currency = getStripeCurrency();
  const tierLabel = SKILL_DIFFICULTY_PRICING[difficulty].label;
  const siteUrl = getSiteUrl();

  const { data: paymentRow, error: insertErr } = await admin
    .from('skill_test_payments')
    .insert({
      user_id: user.id,
      field_id: fieldId,
      amount_cents: amountCents,
      currency,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertErr) {
    if (isMissingPaymentsTable(insertErr.message)) {
      return NextResponse.json(
        { error: 'Payments table not found. Run supabase/stripe_payments.sql in Supabase SQL Editor.' },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const stripe = getStripe();
  const successUrl = `${siteUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl}/billing/cancel`;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: {
              name: `TrueAssess Skill Test — ${tierLabel}`,
              description: `One ${tierLabel.toLowerCase()}-level AI-proctored skill assessment attempt with graded results.`,
            },
          },
        },
      ],
      metadata: {
        userId: user.id,
        paymentId: paymentRow.id,
        fieldId: fieldId ?? '',
        difficulty,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Stripe error';
    await admin.from('skill_test_payments').delete().eq('id', paymentRow.id);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (!session.url) {
    return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 502 });
  }

  const { error: linkErr } = await admin
    .from('skill_test_payments')
    .update({
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentRow.id);

  if (linkErr) {
    return NextResponse.json({ error: linkErr.message }, { status: 500 });
  }

  return NextResponse.json({ url: session.url, sessionId: session.id, paymentId: paymentRow.id });
}
