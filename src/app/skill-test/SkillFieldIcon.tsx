'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Brain,
  Camera,
  Clapperboard,
  Cloud,
  Code2,
  Coins,
  Cpu,
  Database,
  Gamepad2,
  Landmark,
  LayoutTemplate,
  LineChart,
  Megaphone,
  Monitor,
  Music2,
  Palette,
  Shield,
  Smartphone,
  Sparkles,
} from 'lucide-react';

export const SKILL_FIELD_ICONS: Record<string, LucideIcon> = {
  'web-development': Code2,
  ai: Brain,
  'game-development': Gamepad2,
  blockchain: Coins,
  architecture: Landmark,
  art: Palette,
  marketing: Megaphone,
  multimedia: Clapperboard,
  'mobile-development': Smartphone,
  'desktop-applications': Monitor,
  'embedded-iot': Cpu,
  'devops-cloud': Cloud,
  cybersecurity: Shield,
  'data-engineering': Database,
  'product-design': LayoutTemplate,
  'business-finance': LineChart,
  photography: Camera,
  'music-production': Music2,
};

type Variant = 'learning' | 'picker';

const wrapper: Record<Variant, string> = {
  learning:
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-parchment-50 to-parchment-200/90 text-parchment-800 shadow-inner ring-1 ring-parchment-300/60 transition duration-300 group-hover:from-violet-50/90 group-hover:to-parchment-150 group-hover:ring-violet-300/40',
  picker:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-parchment-50 to-parchment-200/85 text-parchment-800 shadow-inner ring-1 ring-parchment-300/55',
};

const sizes: Record<Variant, number> = {
  learning: 20,
  picker: 17,
};

export function SkillFieldIcon({ fieldId, variant = 'picker' }: { fieldId: string; variant?: Variant }) {
  const Icon = SKILL_FIELD_ICONS[fieldId] ?? Sparkles;
  return (
    <span className={wrapper[variant]} aria-hidden>
      <Icon size={sizes[variant]} strokeWidth={1.75} />
    </span>
  );
}
