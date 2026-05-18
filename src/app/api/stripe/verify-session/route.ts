import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/server';
import { markPaymentPaid } from '@/lib/stripe/payments';
import { isStripeConfigured } from '@/lib/stripe/config';

/** Fallback when webhooks are not wired locally — confirms payment after redirect. */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { sessionId?: string };
  if (!body.sessionId?.trim()) {
    return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(body.sessionId.trim());

  if (session.client_reference_id && session.client_reference_id !== user.id) {
    return NextResponse.json({ error: 'Session does not belong to this account.' }, { status: 403 });
  }
  if (session.metadata?.userId && session.metadata.userId !== user.id) {
    return NextResponse.json({ error: 'Session does not belong to this account.' }, { status: 403 });
  }

  if (session.payment_status === 'paid' || session.status === 'complete') {
    let admin;
    try {
      admin = getSupabaseAdmin();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Config error';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null;
    await markPaymentPaid(admin, session.id, paymentIntentId);
  }

  return NextResponse.json({
    paid: session.payment_status === 'paid' || session.status === 'complete',
    paymentId: session.metadata?.paymentId ?? null,
  });
}
