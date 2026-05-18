'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarClock, Gift, Workflow } from 'lucide-react';
import HeroBackgroundVideo from '@/components/HeroBackgroundVideo';

const DEFAULT_EYEBROW = 'Credentialing & assessment';
const DEFAULT_TITLE = 'Global leader in AI-powered skill certification';
const DEFAULT_DESCRIPTION = (
  <>
    A new standard for professional credibility: rigorous assessments, secure credentials, and verification at scale—for
    individuals and organizations alike.
    <span className="ml-1 font-semibold text-amber-200/95">Trusted. Scalable. Verifiable.</span>
  </>
);

const STATS = [
  { value: '5,400+', label: 'Research Articles' },
  { value: '500+', label: 'Certifications' },
  { value: '1M+', label: 'Global Learners' },
  { value: '145+', label: 'Countries' },
] as const;

export type CollageItem = {
  src: string;
  alt: string;
  transform: string;
  z: number;
};

/** Default four stock figures around the certificate (dashboard). */
export const DEFAULT_COLLAGE_ITEMS: CollageItem[] = [
  {
    src: '/hero-side-team-1.png',
    alt: 'Team discussion in meeting room',
    transform: 'translate(-50%, -50%) translate(-138px, -102px) rotate(-8deg)',
    z: 12,
  },
  {
    src: '/hero-side-team-2.png',
    alt: 'Professional handshake in office',
    transform: 'translate(-50%, -50%) translate(138px, -102px) rotate(8deg)',
    z: 10,
  },
  {
    src: '/hero-side-celebration.png',
    alt: 'Celebration moment after certification',
    transform: 'translate(-50%, -50%) translate(-138px, 102px) rotate(-8deg)',
    z: 8,
  },
  {
    src: '/hero-side-meeting.png',
    alt: 'Business meeting and planning',
    transform: 'translate(-50%, -50%) translate(138px, 102px) rotate(8deg)',
    z: 10,
  },
];

/** Study / Learning World: three education photos (order: top-left, top-right, bottom center in `triangle` layout). */
export const STUDY_PAGE_COLLAGE: CollageItem[] = [
  {
    src: '/study/figure-remote-session.png',
    alt: 'Instructor with headphones teaching online with tablet and grammar lesson board',
    transform: 'translate(-50%, -50%) translate(-138px, -102px) rotate(-8deg)',
    z: 12,
  },
  {
    src: '/study/figure-collaboration.png',
    alt: 'Team collaborating at a whiteboard with charts and sticky notes',
    transform: 'translate(-50%, -50%) translate(138px, -102px) rotate(8deg)',
    z: 10,
  },
  {
    src: '/study/figure-grammar-study.png',
    alt: 'Learner reviewing English grammar and parts of speech on a clipboard',
    transform: 'translate(-50%, -50%) translate(0, 118px) rotate(0deg)',
    z: 9,
  },
];

export type CredentialingHeroProps = {
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  tertiaryCta?: { href: string; label: string } | null;
  /** Photo collage around the certificate; defaults to four marketing images. */
  collageItems?: CollageItem[];
  /**
   * `orbit` — absolute “scattered” cards (dashboard default).
   * `triangle` — 2 photos on top row, 1 centered below (Learning World, 3 images).
   */
  collageLayout?: 'orbit' | 'triangle';
  /** Extra space under the app bar; use on Learning World so the hero does not sit flush with the nav. */
  relaxedTop?: boolean;
  /** Set false to show copy-only hero (no side photos or center certificate). */
  showCollage?: boolean;
  /** Single right-column photo when collage is off (ignored if `showCollage` is true). */
  heroImage?: { src: string; alt: string };
  /** Stat tiles + campaign cards under the hero row (off for Learning World). @default true */
  showMetricsAndCampaigns?: boolean;
};

/**
 * Full-bleed hero (video, optional collage + certificate, optional stats/campaigns) — dashboard top band.
 * Override copy/CTAs when embedding on Learning World or other routes.
 */
export default function CredentialingHero({
  eyebrow = DEFAULT_EYEBROW,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  primaryCta = { href: '/skill-test', label: 'Explore certifications' },
  secondaryCta = { href: '/job-board', label: 'For organizations' },
  tertiaryCta = { href: '/candidates', label: 'Browse verified candidates' },
  collageItems = DEFAULT_COLLAGE_ITEMS,
  collageLayout = 'orbit',
  relaxedTop = false,
  showCollage = true,
  heroImage,
  showMetricsAndCampaigns = true,
}: CredentialingHeroProps) {
  const hasRightVisual = showCollage || Boolean(heroImage);

  const contentShell = relaxedTop
    ? 'relative z-10 mx-auto max-w-[1200px] px-5 pt-6 pb-5 sm:px-6 md:px-7 md:pt-11 md:pb-9 lg:px-8'
    : 'relative z-10 mx-auto -mt-4 max-w-[1200px] px-5 pt-0 pb-5 sm:px-6 md:-mt-6 md:px-7 md:pt-1 md:pb-9 lg:px-8';

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden text-white">
      <HeroBackgroundVideo src="/hero-side-video.mp4" playbackRate={0.5} />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(125deg,rgba(2,6,23,0.92)_0%,rgba(30,27,75,0.86)_42%,rgba(15,23,42,0.9)_100%)]" />
      <div className="hero-stars pointer-events-none absolute inset-0 z-[1] opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute -left-24 top-1/4 z-[1] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl animate-hero-float"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-1/4 z-[1] h-80 w-80 rounded-full bg-violet-500/15 blur-3xl animate-hero-float [animation-delay:1.2s]"
        aria-hidden
      />
      <div className={`${contentShell} relative z-10`}>
        <div
          className={`grid items-center gap-6 lg:gap-8 ${hasRightVisual ? 'lg:grid-cols-[1.05fr_0.95fr]' : ''} ${relaxedTop ? 'mt-2 md:mt-3' : 'mt-5'}`}
        >
          <div
            className={`max-w-xl ${hasRightVisual ? (heroImage ? 'lg:max-w-none' : 'lg:max-w-2xl') : 'lg:max-w-3xl'}`}
          >
            <p className="mb-3 animate-hero-eyebrow font-display text-[11px] font-bold uppercase tracking-[0.32em] text-cyan-200/90 opacity-0 drop-shadow-[0_0_20px_rgba(34,211,238,0.35)]">
              {eyebrow}
            </p>
            <h1
              className={`relative animate-hero-title font-display text-[2.15rem] font-extrabold leading-[1.08] tracking-[-0.03em] opacity-0 sm:text-4xl md:text-[2.85rem] md:leading-[1.06] lg:text-[3.05rem] ${
                heroImage
                  ? 'max-w-[min(100%,44rem)] text-balance md:leading-[1.12]'
                  : 'max-w-2xl'
              }`}
            >
              <span className="hero-title-gradient relative z-10 animate-hero-title-shimmer drop-shadow-[0_4px_32px_rgba(129,140,248,0.35)]">
                {title}
              </span>
            </h1>
            <p className="mt-6 max-w-xl animate-hero-body font-sans text-base font-normal leading-relaxed text-slate-300/95 opacity-0 md:mt-8 md:text-lg md:leading-[1.65] [&_span]:font-semibold [&_span]:text-amber-200/95 [&_span]:drop-shadow-[0_0_14px_rgba(251,191,36,0.25)]">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 opacity-0 animate-hero-cta">
              <Link
                href={primaryCta.href}
                className="group relative overflow-hidden rounded-md border border-white/90 bg-white px-6 py-2.5 text-[13px] font-display font-bold uppercase tracking-[0.12em] text-indigo-950 shadow-[0_4px_24px_rgba(255,255,255,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:shadow-[0_8px_32px_rgba(255,255,255,0.35)] active:translate-y-0"
              >
                <span className="relative z-10">{primaryCta.label}</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 group-hover:translate-x-full" aria-hidden />
              </Link>
              <Link
                href={secondaryCta.href}
                className="rounded-md border border-white/50 bg-white/5 px-6 py-2.5 text-[13px] font-display font-semibold uppercase tracking-[0.1em] text-white shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/60 hover:bg-white/15 hover:shadow-[0_0_24px_rgba(34,211,238,0.2)] active:translate-y-0"
              >
                {secondaryCta.label}
              </Link>
              {tertiaryCta ? (
                <Link
                  href={tertiaryCta.href}
                  className="animate-hero-link-pulse text-[13px] font-display font-semibold uppercase tracking-[0.08em] text-amber-200/90 underline decoration-amber-400/60 underline-offset-[5px] transition hover:text-amber-100 hover:decoration-amber-300"
                >
                  {tertiaryCta.label}
                </Link>
              ) : null}
            </div>
          </div>
          {showCollage ? (
            <div
              className={
                collageLayout === 'triangle' && collageItems.length === 3
                  ? 'relative flex min-h-[min(400px,52vh)] w-full items-center justify-center py-2'
                  : 'relative h-[400px] sm:h-[440px] md:h-[500px]'
              }
            >
              {collageLayout === 'triangle' && collageItems.length === 3 ? (
                <div className="mx-auto w-full max-w-[460px] space-y-3 sm:max-w-[500px] md:max-w-[520px]">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <figure className="group -rotate-[7deg] overflow-hidden rounded-lg border border-parchment-200/45 bg-parchment-950/15 shadow-[0_12px_36px_rgba(30,41,59,0.2)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(30,41,59,0.28)]">
                      <img
                        src={collageItems[0].src}
                        alt={collageItems[0].alt}
                        className="aspect-[4/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </figure>
                    <figure className="group rotate-[7deg] overflow-hidden rounded-lg border border-parchment-200/45 bg-parchment-950/15 shadow-[0_12px_36px_rgba(30,41,59,0.2)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(30,41,59,0.28)]">
                      <img
                        src={collageItems[1].src}
                        alt={collageItems[1].alt}
                        className="aspect-[4/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </figure>
                  </div>
                  <div className="flex justify-center px-2 pt-1">
                    <figure className="group w-full max-w-[280px] overflow-hidden rounded-lg border border-parchment-200/45 bg-parchment-950/15 shadow-[0_12px_36px_rgba(30,41,59,0.2)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(30,41,59,0.28)] sm:max-w-[300px]">
                      <img
                        src={collageItems[2].src}
                        alt={collageItems[2].alt}
                        className="aspect-[4/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </figure>
                  </div>
                </div>
              ) : (
                collageItems.map((image, idx) => (
                  <div
                    key={`${image.src}-${idx}`}
                    className="group absolute left-1/2 top-[48%] w-[188px] transition-transform duration-500 hover:z-40 hover:-translate-y-3 hover:scale-105 md:w-[218px]"
                    style={{ transform: image.transform, zIndex: image.z }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-[124px] w-full rounded-sm border border-parchment-200/40 bg-parchment-950/10 object-cover shadow-[0_12px_36px_rgba(30,41,59,0.14)] transition-all duration-500 [image-rendering:auto] group-hover:scale-[1.03] group-hover:shadow-[0_18px_42px_rgba(30,41,59,0.18)] sm:h-[134px] md:h-[152px]"
                    />
                  </div>
                ))
              )}

              <img
                src="/hero-certificate-center.png"
                alt="Certificate of achievement"
                className="pointer-events-none absolute left-1/2 top-[48%] z-30 h-[168px] w-[168px] -translate-x-1/2 -translate-y-1/2 animate-hero-cert-glow object-contain sm:h-[184px] sm:w-[184px] md:h-[206px] md:w-[206px]"
              />
            </div>
          ) : heroImage ? (
            <div className="relative flex w-full justify-center py-2 sm:py-3 lg:justify-end">
              <figure className="group relative w-full max-w-[min(100%,440px)] isolate [mask-image:radial-gradient(ellipse_120%_120%_at_50%_48%,#000_0%,#000_14%,rgba(0,0,0,0.94)_26%,rgba(0,0,0,0.72)_40%,rgba(0,0,0,0.48)_54%,rgba(0,0,0,0.28)_68%,rgba(0,0,0,0.12)_82%,rgba(0,0,0,0.04)_92%,transparent_100%)] [mask-mode:alpha] [-webkit-mask-image:radial-gradient(ellipse_120%_120%_at_50%_48%,#000_0%,#000_14%,rgba(0,0,0,0.94)_26%,rgba(0,0,0,0.72)_40%,rgba(0,0,0,0.48)_54%,rgba(0,0,0,0.28)_68%,rgba(0,0,0,0.12)_82%,rgba(0,0,0,0.04)_92%,transparent_100%)] [mask-repeat:no-repeat] [mask-size:100%_100%]">
                {/* Large corner radius + clip = soft, un-angular silhouette before the outer fade */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] sm:rounded-[2.75rem] md:rounded-[3.25rem]">
                  {/* Full-frame blur — visible wherever the sharp layer fades out */}
                  <img
                    src={heroImage.src}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-[1.18] object-cover blur-[22px] transition duration-500 group-hover:scale-[1.2]"
                    loading="eager"
                    decoding="async"
                  />
                  {/* Duotone “split” — warm / cool offsets, strongest in outer ring (where alpha falls off) */}
                  <img
                    src={heroImage.src}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[1] h-full w-full -translate-x-1.5 -translate-y-0.5 scale-[1.12] object-cover opacity-60 mix-blend-screen blur-[0.5px] transition duration-500 [filter:saturate(1.45)_hue-rotate(32deg)_brightness(1.08)] [mask-image:radial-gradient(ellipse_96%_94%_at_50%_48%,transparent_0%,transparent_36%,rgba(0,0,0,0.2)_48%,rgba(0,0,0,0.75)_68%,#000_100%)] [mask-mode:alpha] [-webkit-mask-image:radial-gradient(ellipse_96%_94%_at_50%_48%,transparent_0%,transparent_36%,rgba(0,0,0,0.2)_48%,rgba(0,0,0,0.75)_68%,#000_100%)] group-hover:-translate-x-2 group-hover:opacity-70"
                    loading="eager"
                    decoding="async"
                  />
                  <img
                    src={heroImage.src}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[1] h-full w-full translate-x-1.5 translate-y-0.5 scale-[1.12] object-cover opacity-60 mix-blend-screen blur-[0.5px] transition duration-500 [filter:saturate(1.15)_hue-rotate(215deg)_brightness(1.05)] [mask-image:radial-gradient(ellipse_96%_94%_at_50%_48%,transparent_0%,transparent_36%,rgba(0,0,0,0.2)_48%,rgba(0,0,0,0.75)_68%,#000_100%)] [mask-mode:alpha] [-webkit-mask-image:radial-gradient(ellipse_96%_94%_at_50%_48%,transparent_0%,transparent_36%,rgba(0,0,0,0.2)_48%,rgba(0,0,0,0.75)_68%,#000_100%)] group-hover:translate-x-2 group-hover:opacity-70"
                    loading="eager"
                    decoding="async"
                  />
                  {/* Sharp center — radial mask blends into blurred layer beneath */}
                  <img
                    src={heroImage.src}
                    alt={heroImage.alt}
                    className="relative z-[2] h-full w-full object-cover transition duration-500 [mask-image:radial-gradient(ellipse_58%_56%_at_50%_48%,#000_0%,#000_28%,rgba(0,0,0,0.5)_52%,rgba(0,0,0,0.18)_74%,transparent_100%)] [mask-mode:alpha] [-webkit-mask-image:radial-gradient(ellipse_58%_56%_at_50%_48%,#000_0%,#000_28%,rgba(0,0,0,0.5)_52%,rgba(0,0,0,0.18)_74%,transparent_100%)] group-hover:scale-[1.02]"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </figure>
            </div>
          ) : null}
        </div>

        {showMetricsAndCampaigns ? (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="animate-hero-stats rounded-lg border border-white/20 bg-white/10 p-4 opacity-0 backdrop-blur-md transition duration-300 hover:border-cyan-300/30 hover:bg-white/15"
                  style={{ animationDelay: `${0.55 + i * 0.1}s` }}
                >
                  <p className="font-display text-xl font-bold tabular-nums text-white">{s.value}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-cyan-100/80">{s.label}</p>
                </div>
              ))}
            </div>

            <aside className="mt-6 p-0">
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="group rounded-lg border border-white/20 bg-white/95 p-4 shadow-[0_8px_18px_rgba(15,23,42,0.12)] transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_12px_24px_rgba(79,70,229,0.15)]">
                  <div className="flex items-center gap-2">
                    <CalendarClock size={15} className="text-indigo-600" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Campaign window</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="font-serif text-base font-semibold text-parchment-950">Now live</p>
                    <span className="rounded-sm border border-emerald-700/25 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-600">Registrations and submissions are open.</p>
                </div>
                <div className="group rounded-lg border border-white/20 bg-white/95 p-4 shadow-[0_8px_18px_rgba(15,23,42,0.12)] transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_12px_24px_rgba(79,70,229,0.15)]">
                  <div className="flex items-center gap-2">
                    <Gift size={15} className="text-indigo-600" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Reward type</p>
                  </div>
                  <p className="mt-2 font-serif text-lg font-semibold text-parchment-950">NFT skill credentials</p>
                  <p className="mt-1 text-xs text-stone-600">Mint eligible credentials after verified pass.</p>
                </div>
                <div className="group rounded-lg border border-white/20 bg-white/95 p-4 shadow-[0_8px_18px_rgba(15,23,42,0.12)] transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_12px_24px_rgba(79,70,229,0.15)]">
                  <div className="flex items-center gap-2">
                    <Workflow size={15} className="text-indigo-600" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Flow</p>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-snug text-parchment-950">
                    Register → Test → AI grade → NFT eligibility
                  </p>
                  <p className="mt-1 text-xs text-stone-600">One pipeline from learning to credential.</p>
                </div>
              </div>
            </aside>
          </>
        ) : null}
      </div>
    </section>
  );
}
