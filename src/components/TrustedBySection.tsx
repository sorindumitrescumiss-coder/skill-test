import React from 'react';
import { BadgeCheck, Building2, Handshake } from 'lucide-react';

export const TRUSTED_BRANDS = [
  { name: 'IBM', mark: 'verified' as const },
  { name: 'KPMG', mark: 'partner' as const },
  { name: 'GlobalLogic', mark: 'enterprise' as const },
  { name: 'Cognizant', mark: 'verified' as const },
  { name: 'Deloitte', mark: 'partner' as const },
  { name: 'Cisco', mark: 'enterprise' as const },
] as const;

function TrustMark({ type }: { type: 'verified' | 'partner' | 'enterprise' }) {
  switch (type) {
    case 'verified':
      return <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-700/90" aria-hidden />;
    case 'partner':
      return <Handshake className="h-4 w-4 shrink-0 text-parchment-800/85" aria-hidden />;
    default:
      return <Building2 className="h-4 w-4 shrink-0 text-stone-600/90" aria-hidden />;
  }
}

type TrustedBySectionProps = {
  /** Set false to sit inside a parent with horizontal padding (default: full-bleed band + side borders). */
  fullBleed?: boolean;
  className?: string;
};

/**
 * “Trusted by teams and learners” social proof row with scrolling brand cards.
 */
export default function TrustedBySection({ fullBleed = true, className = '' }: TrustedBySectionProps) {
  const inner = (
    <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-7 lg:px-8">
      <p className="text-center font-serif text-lg font-medium text-parchment-950">Trusted by teams and learners</p>
      <p className="mx-auto mt-2 max-w-lg text-center text-sm text-stone-600">
        Organizations worldwide use TrueAssess to validate expertise.
      </p>
      <div className="mt-6 overflow-hidden">
        <div className="animate-logo-marquee flex w-max gap-3">
          {[...TRUSTED_BRANDS, ...TRUSTED_BRANDS].map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              title={
                item.mark === 'verified'
                  ? 'Verified partner'
                  : item.mark === 'partner'
                    ? 'Program partner'
                    : 'Enterprise adoption'
              }
              className="flex min-w-[190px] items-center justify-center gap-2 rounded-sm border border-parchment-300/85 bg-parchment-100/95 px-4 py-3.5 font-serif text-base font-semibold text-stone-700 shadow-[0_2px_8px_-4px_rgba(30,41,59,0.12)] transition-all duration-200 hover:border-parchment-500/45 hover:bg-parchment-50 hover:shadow-sm"
            >
              <TrustMark type={item.mark} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!fullBleed) {
    return <section className={`border-y border-parchment-300/50 bg-parchment-150 py-10 ${className}`.trim()}>{inner}</section>;
  }

  return (
    <section
      className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen border-y border-parchment-300/50 bg-parchment-150 py-10 ${className}`.trim()}
    >
      {inner}
    </section>
  );
}
