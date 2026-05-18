import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { markPaymentPaid } from '@/lib/stripe/payments';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET is not set.' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Config error';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === 'paid' || session.status === 'complete') {
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null;
        await markPaymentPaid(admin, session.id, paymentIntentId);
      }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await admin
        .from('skill_test_payments')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('stripe_checkout_session_id', session.id)
        .eq('status', 'pending');
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Webhook handler error';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
