import {
  getSkillTestAmountCentsForDifficulty,
  SKILL_DIFFICULTY_LEVELS,
  SKILL_DIFFICULTY_PRICING,
  type SkillDifficulty,
} from '@/lib/stripe/pricing';

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

export function getSkillTestAmountCents(difficulty: SkillDifficulty = 'intermediate'): number {
  return getSkillTestAmountCentsForDifficulty(difficulty);
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
  const currency = getStripeCurrency();
  const pricingTiers = SKILL_DIFFICULTY_LEVELS.map((id) => {
    const amountCents = getSkillTestAmountCents(id);
    return {
      id,
      label: SKILL_DIFFICULTY_PRICING[id].label,
      amountCents,
      formattedPrice: formatPrice(amountCents, currency),
    };
  });
  const defaultTier = pricingTiers.find((t) => t.id === 'intermediate') ?? pricingTiers[0]!;
  return {
    paymentRequired: isStripePaymentRequired(),
    stripeConfigured: isStripeConfigured(),
    amountCents: defaultTier.amountCents,
    currency,
    formattedPrice: defaultTier.formattedPrice,
    pricingTiers,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  };
}
