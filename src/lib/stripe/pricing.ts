export const SKILL_DIFFICULTY_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
  'master',
] as const;

export type SkillDifficulty = (typeof SKILL_DIFFICULTY_LEVELS)[number];

export const SKILL_DIFFICULTY_PRICING: Record<
  SkillDifficulty,
  { label: string; amountCents: number }
> = {
  beginner: { label: 'Beginner', amountCents: 2000 },
  intermediate: { label: 'Intermediate', amountCents: 3000 },
  advanced: { label: 'Advanced', amountCents: 3500 },
  expert: { label: 'Expert', amountCents: 4500 },
  master: { label: 'Master', amountCents: 6000 },
};

export function isSkillDifficulty(value: string): value is SkillDifficulty {
  return value in SKILL_DIFFICULTY_PRICING;
}

export function parseSkillDifficulty(
  raw: unknown,
  fallback: SkillDifficulty = 'intermediate',
): SkillDifficulty {
  if (typeof raw === 'string' && isSkillDifficulty(raw)) return raw;
  return fallback;
}

export function getSkillTestAmountCentsForDifficulty(difficulty: SkillDifficulty): number {
  return SKILL_DIFFICULTY_PRICING[difficulty].amountCents;
}

export function formatSkillPrice(amountCents: number, currency = 'usd'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `$${(amountCents / 100).toFixed(2)}`;
  }
}
