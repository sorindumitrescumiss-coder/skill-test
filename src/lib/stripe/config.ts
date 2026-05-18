function parseBool(raw: string | undefined, defaultValue: boolean): boolean {
  if (raw === undefined || raw === '') return defaultValue;
  const s = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'off'].includes(s)) return false;
  return defaultValue;
}

function parseIntEnv(raw: string | undefined, fallback: number): number {
  const n = Number.parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:4028';
  return url;
}

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? '';
  return Boolean(key && !key.toLowerCase().includes('your-') && key.startsWith('sk_'));
}

/** When false, skill tests start without payment (local dev). */
export function isStripePaymentRequired(): boolean {
  if (!isStripeConfigured()) return false;
  return parseBool(process.env.STRIPE_PAYMENT_REQUIRED, true);
}

export function getSkillTestAmountCents(): number {
  return parseIntEnv(process.env.STRIPE_SKILL_TEST_AMOUNT_CENTS, 1900);
}

export function getStripeCurrency(): string {
  return (process.env.STRIPE_CURRENCY ?? 'usd').trim().toLowerCase() || 'usd';
}

export function formatPrice(amountCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `$${(amountCents / 100).toFixed(2)}`;
  }
}

export function getStripePublicConfig() {
  const amountCents = getSkillTestAmountCents();
  const currency = getStripeCurrency();
  return {
    paymentRequired: isStripePaymentRequired(),
    stripeConfigured: isStripeConfigured(),
    amountCents,
    currency,
    formattedPrice: formatPrice(amountCents, currency),
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  };
}
