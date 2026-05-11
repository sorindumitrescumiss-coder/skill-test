'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import CredentialingHero from '@/components/CredentialingHero';
import TrustedBySection from '@/components/TrustedBySection';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Bookmark,
  Brain,
  BriefcaseBusiness,
  Clock,
  Cloud,
  Code2,
  Cpu,
  Database,
  Gamepad2,
  Globe,
  Infinity,
  Link2,
  Lock,
  Shield,
  Smartphone,
  UserCheck,
  Workflow,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ALUMNI_TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    followersLabel: 'LinkedIn followers',
    followers: '98K+',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&q=80',
    quote:
      'TrueAssess certifications gave our engineering team the structured, research-backed curriculum we needed to ship enterprise-grade solutions with confidence.',
  },
  {
    name: 'Marcus Webb',
    followersLabel: 'LinkedIn followers',
    followers: '42K+',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&h=160&fit=crop&q=80',
    quote:
      'The assessments mapped cleanly to how we hire — verified skills instead of buzzwords. Candidates with credentials stood out immediately in our pipeline.',
  },
  {
    name: 'Elena Vasquez',
    followersLabel: 'LinkedIn followers',
    followers: '120K+',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&q=80',
    quote:
      'From prep to credential, the flow felt serious but fair. My NFT-backed credential gets opens from recruiters that ignored my resume alone.',
  },
] as const;

/** Employer logos: favicon loaded by domain (same pattern as typical “logo clouds”). */
const ALUMNI_ORGS: readonly { name: string; domain: string }[] = [
  { name: 'Microsoft', domain: 'microsoft.com' },
  { name: 'IBM', domain: 'ibm.com' },
  { name: 'KPMG', domain: 'kpmg.com' },
  { name: 'GlobalLogic', domain: 'globallogic.com' },
  { name: 'Cognizant', domain: 'cognizant.com' },
  { name: 'Dubai Customs', domain: 'dubai.ae' },
  { name: 'CGI', domain: 'cgi.com' },
  { name: 'Pepsi', domain: 'pepsi.com' },
  { name: 'Capgemini', domain: 'capgemini.com' },
  { name: 'Citizens Financial Group', domain: 'citizensbank.com' },
  { name: 'EY', domain: 'ey.com' },
  { name: 'Accenture', domain: 'accenture.com' },
  { name: 'Cloudchain', domain: 'cloudchain.com' },
  { name: 'TCS', domain: 'tcs.com' },
  { name: 'NetSPI', domain: 'netspi.com' },
  { name: 'SAP', domain: 'sap.com' },
];

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

function AlumniEmployerTile({ name, domain }: { name: string; domain: string }) {
  const [iconFailed, setIconFailed] = React.useState(false);
  const initials = React.useMemo(() => {
    const parts = name.replace(/[^a-zA-Z ]/g, '').split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  return (
    <div className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-parchment-300/55 bg-parchment-150/85 px-2 py-3 text-center shadow-[0_2px_8px_-4px_rgba(63,52,42,0.1)]">
      {!iconFailed ? (
        <img
          src={faviconUrl(domain)}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          loading="lazy"
          decoding="async"
          onError={() => setIconFailed(true)}
        />
      ) : (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-parchment-150/90 font-sans text-[11px] font-bold tabular-nums text-stone-600"
          aria-hidden
        >
          {initials}
        </div>
      )}
      <span className="max-w-full text-[10px] font-semibold leading-snug text-stone-700 sm:text-[11px]">{name}</span>
    </div>
  );
}

const RESEARCH_HUB_ARTICLES: {
  image: string;
  imageAlt: string;
  category: string;
  readTime: string;
  title: string;
  date: string;
  href: string;
}[] = [
  {
    image:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Abstract blockchain visualization',
    category: 'Blockchain',
    readTime: '12 min read',
    title: 'Understanding Zero-Knowledge Proofs: A Comprehensive Guide',
    date: 'Feb 28, 2026',
    href: '#',
  },
  {
    image:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Artificial intelligence concept',
    category: 'Artificial Intelligence',
    readTime: '9 min read',
    title: 'Responsible AI in Production: Patterns Teams Actually Ship',
    date: 'Feb 22, 2026',
    href: '#',
  },
  {
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Technology and connected world',
    category: 'Web3',
    readTime: '15 min read',
    title: 'Credentials and Identity: What Changes When Talent Is Verifiable',
    date: 'Feb 18, 2026',
    href: '#',
  },
];

const SKILL_TEST_TRACKS: {
  fieldId: string;
  title: string;
  tagline: string;
  purpose: string;
  highlights: string[];
  marks: string[];
  price: string;
  duration: string;
  access: string;
  iconClass: string;
  iconTint: string;
  Icon: LucideIcon;
  cardImageSrc?: string;
  cardImageAlt?: string;
}[] = [
  {
    fieldId: 'web-development',
    title: 'Web Development',
    tagline: 'Frontend + backend + database',
    purpose: 'Assess practical web development skills across frontend implementation, backend API development, and database design.',
    highlights: ['Frontend: React.js, CSS, JavaScript', 'Backend: Node.js, Django, FastAPI', 'Database: PostgreSQL'],
    marks: ['React.js', 'CSS', 'JavaScript', 'Node.js', 'Django', 'FastAPI', 'PostgreSQL'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-sky-700',
    iconTint: 'bg-sky-500/[0.11]',
    Icon: Code2,
    cardImageSrc: '/web-development-card.png',
    cardImageAlt: 'Web development learning illustration',
  },
  {
    fieldId: 'ai',
    title: 'AI & machine learning',
    tagline: 'ML, NLP, GenAI & responsible use',
    purpose: 'Evaluate your ability to build, reason about, and apply AI/ML systems responsibly in real product scenarios.',
    highlights: ['Model selection', 'Prompting and GenAI', 'Responsible AI'],
    marks: ['Python', 'TensorFlow', 'NLP'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-violet-700',
    iconTint: 'bg-violet-500/[0.11]',
    Icon: Brain,
    cardImageSrc: '/ai-machine-learning-card.png',
    cardImageAlt: 'AI and machine learning abstract visual',
  },
  {
    fieldId: 'devops-cloud',
    title: 'Cloud & DevOps',
    tagline: 'Containers, CI/CD & infrastructure',
    purpose: 'Measure readiness for cloud operations, delivery pipelines, automation, and infrastructure reliability decisions.',
    highlights: ['CI/CD workflows', 'Cloud infra basics', 'Reliability mindset'],
    marks: ['Docker', 'Kubernetes', 'CI/CD'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-cyan-700',
    iconTint: 'bg-cyan-500/[0.11]',
    Icon: Cloud,
    cardImageSrc: '/cloud-devops-card.png',
    cardImageAlt: 'Cloud and DevOps networking concept',
  },
  {
    fieldId: 'cybersecurity',
    title: 'Cybersecurity',
    tagline: 'Threat modeling, secure design & ops',
    purpose: 'Validate defensive security judgment in threat modeling, secure implementation, and operational risk response.',
    highlights: ['Threat modeling', 'Secure coding', 'Risk response'],
    marks: ['OWASP', 'SOC', 'Secure Code'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-emerald-700',
    iconTint: 'bg-emerald-500/[0.11]',
    Icon: Shield,
    cardImageSrc: '/cybersecurity-card.png',
    cardImageAlt: 'Cybersecurity lock and network concept',
  },
  {
    fieldId: 'data-engineering',
    title: 'Data engineering',
    tagline: 'Pipelines, warehousing & quality',
    purpose: 'Test your ability to design robust data pipelines, maintain quality, and support analytics-ready platforms.',
    highlights: ['Data pipelines', 'Warehouse modeling', 'Data quality'],
    marks: ['SQL', 'ETL', 'Spark'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-amber-700',
    iconTint: 'bg-amber-500/[0.11]',
    Icon: Database,
    cardImageSrc: '/data-engineering-card.png',
    cardImageAlt: 'Data engineering network and analytics concept',
  },
  {
    fieldId: 'mobile-development',
    title: 'Mobile development',
    tagline: 'iOS, Android & cross-platform',
    purpose: 'Assess mobile app delivery skills including architecture choices, platform constraints, and performance trade-offs.',
    highlights: ['App architecture', 'Platform constraints', 'Performance tuning'],
    marks: ['React Native', 'Flutter', 'Android'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-rose-700',
    iconTint: 'bg-rose-500/[0.11]',
    Icon: Smartphone,
    cardImageSrc: '/mobile-development-card.png',
    cardImageAlt: 'Mobile development learning concept',
  },
  {
    fieldId: 'blockchain',
    title: 'Blockchain & Web3',
    tagline: 'Contracts, wallets & security',
    purpose: 'Check your understanding of smart contracts, wallet workflows, and security practices in Web3 ecosystems.',
    highlights: ['Smart contracts', 'Wallet flows', 'Web3 security'],
    marks: ['Solidity', 'EVM', 'Web3'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-yellow-700',
    iconTint: 'bg-yellow-500/[0.14]',
    Icon: Link2,
    cardImageSrc: '/blockchain-card.png',
    cardImageAlt: 'Blockchain and Web3 network concept',
  },
  {
    fieldId: 'game-development',
    title: 'Game development',
    tagline: 'Engines, gameplay & performance',
    purpose: 'Evaluate game dev capability in gameplay systems, engine usage, optimization, and production problem solving.',
    highlights: ['Gameplay systems', 'Engine workflows', 'Optimization'],
    marks: ['Unity', 'Unreal', 'C#'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-fuchsia-700',
    iconTint: 'bg-fuchsia-500/[0.11]',
    Icon: Gamepad2,
    cardImageSrc: '/game-development-card.png',
    cardImageAlt: 'Game strategy concept image',
  },
];

export default function DashboardPage() {
  const [explainTrack, setExplainTrack] = React.useState<(typeof SKILL_TEST_TRACKS)[number] | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [alumniSlideIdx, setAlumniSlideIdx] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const goToExamRoom = React.useCallback((track: (typeof SKILL_TEST_TRACKS)[number]) => {
    const marksParam = encodeURIComponent(track.marks.join(','));
    window.location.href = `/skill-test?field=${encodeURIComponent(track.fieldId)}&examroom=1&langs=${marksParam}`;
  }, []);

  return (
    <AppLayout activePath="/dashboard">
      <div className="space-y-0">
        <CredentialingHero />

        <TrustedBySection />

        <section className="bg-parchment-100 pb-10 pt-12">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-7 lg:px-8">
              <h3 className="max-w-2xl font-serif text-xl font-semibold tracking-tight text-parchment-950 md:text-2xl">
                What Can You Expect From NFT Certifications?
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
                Verifiable credentials that fit how teams hire today—without clutter.
              </p>

              <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_minmax(260px,340px)_1fr] lg:gap-8">
                <ul className="divide-y divide-parchment-300/40">
                  {[
                    { icon: BriefcaseBusiness, text: 'Get hired faster with verifiable skills.' },
                    { icon: Cpu, text: 'Receive knowledge in various fields.' },
                    { icon: UserCheck, text: 'Get featured as a certified professional.' },
                    { icon: Lock, text: 'Have your skills verified.' },
                  ].map((item, idx) => (
                    <li key={`left-benefit-${idx}`} className="flex gap-3 py-3.5 first:pt-0">
                      <item.icon size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-parchment-700/90" aria-hidden />
                      <span className="text-sm leading-relaxed text-stone-700">{item.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mx-auto flex w-full max-w-[320px] flex-col items-center lg:sticky lg:top-28">
                  <figure className="m-0 w-full">
                    <img
                      src="/skill-test-hero-illustration.png"
                      alt="Illustration for NFT certifications"
                      className="h-auto w-full rounded-2xl bg-parchment-150/90 object-contain p-3 shadow-[0_12px_40px_-12px_rgba(63,52,42,0.35)]"
                    />
                    <figcaption className="mt-4 text-center text-xs leading-relaxed text-stone-600">
                      AI-assisted assessments and on-chain credentials—built for real hiring workflows.
                    </figcaption>
                  </figure>
                  <Link
                    href="/skill-test"
                    className="mt-4 inline-flex items-center justify-center rounded-sm border border-parchment-700 bg-parchment-800 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-parchment-50 shadow-sm transition hover:bg-parchment-900"
                  >
                    Start a skill test
                  </Link>
                </div>

                <ul className="divide-y divide-parchment-300/40">
                  {[
                    { icon: Infinity, text: 'Lifetime course access and certification validity.' },
                    { icon: UserCheck, text: 'Build authority with a globally recognized profile.' },
                    { icon: Globe, text: 'Join an international network of certified professionals.' },
                    { icon: Workflow, text: '24/7 support for test and credential questions.' },
                  ].map((item, idx) => (
                    <li key={`right-benefit-${idx}`} className="flex gap-3 py-3.5 first:pt-0">
                      <item.icon size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-parchment-700/90" aria-hidden />
                      <span className="text-sm leading-relaxed text-stone-700">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
          </div>
        </section>

        <section className="border-t border-parchment-300/35 bg-parchment-100 py-14">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-7 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Tracks</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-parchment-950 md:text-[1.7rem]">
              Popular skill tests
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
              Pick a track, then set difficulty, subtopic, and language in the wizard.
            </p>

            <div className="mt-9">
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {SKILL_TEST_TRACKS.map((track) => (
                  <div key={track.fieldId} className="flex h-full flex-col">
                    <button
                      type="button"
                      onClick={() => setExplainTrack(track)}
                      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-parchment-300/80 bg-gradient-to-b from-parchment-50 via-parchment-50 to-parchment-100 px-4 py-4 text-left shadow-[0_10px_26px_-18px_rgba(40,30,24,0.5)] ring-1 ring-parchment-200/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-parchment-500/60 hover:ring-parchment-400/40 hover:shadow-[0_18px_34px_-18px_rgba(40,30,24,0.56)] sm:px-5"
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top_right,rgba(159,122,78,0.14),transparent_44%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute right-0 top-0 h-14 w-14 rounded-bl-2xl border-b border-l border-parchment-300/70 bg-parchment-100/55"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-parchment-500/45 to-transparent"
                      />
                      <div className="flex min-h-[245px] flex-1 flex-col">
                        {track.cardImageSrc ? (
                          <div className="relative -mx-4 -mt-4 mb-3 overflow-hidden border-b border-parchment-300/80 sm:-mx-5">
                            <span
                              aria-hidden
                              className="pointer-events-none absolute left-0 top-0 z-[1] h-[2px] w-full bg-gradient-to-r from-transparent via-parchment-500/45 to-transparent"
                            />
                            <img
                              src={track.cardImageSrc}
                              alt={track.cardImageAlt ?? `${track.title} cover`}
                              className="h-[132px] w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ) : null}
                        <div className="flex items-start gap-3">
                          {!track.cardImageSrc ? (
                            <div
                              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-parchment-300/65 ${track.iconTint}`}
                            >
                              <track.Icon className={`h-[18px] w-[18px] ${track.iconClass}`} strokeWidth={1.8} aria-hidden />
                            </div>
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[1.85rem] font-bold leading-[1.05] tracking-tight text-parchment-950">
                              {track.title}
                            </h3>
                            <p className="mt-1.5 min-h-[40px] text-[13px] leading-relaxed text-stone-600">{track.tagline}</p>
                          {!track.cardImageSrc ? (
                            <>
                              <div className="mt-2 flex min-h-[50px] flex-wrap content-start gap-1.5">
                                {track.marks.map((mark) => (
                                  <span
                                    key={`${track.fieldId}-${mark}`}
                                    className="rounded-full border border-parchment-300/75 bg-parchment-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-stone-600"
                                  >
                                    {mark}
                                  </span>
                                ))}
                              </div>
                              <p className="mt-2 min-h-[38px] text-[11px] leading-relaxed text-stone-600">
                                <span className="font-semibold text-stone-700">Covers:</span> {track.highlights.join(' · ')}
                              </p>
                            </>
                          ) : null}
                          </div>
                        </div>
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-parchment-300/55 pt-3">
                          <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-parchment-100 px-2 py-1">
                              <Clock size={14} className="text-stone-500" aria-hidden />
                              {track.duration}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-parchment-100 px-2 py-1">
                              <Bookmark size={14} className="text-stone-500" aria-hidden />
                              {track.access}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-parchment-400/70 bg-parchment-150 px-2 py-1 font-semibold text-parchment-900">
                              Fee {track.price}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-parchment-800 transition group-hover:text-parchment-950">
                            Enter exam room
                            <ArrowRight
                              size={14}
                              className="transition group-hover:translate-x-0.5"
                              aria-hidden
                            />
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {mounted &&
              explainTrack &&
              createPortal(
                <div
                  className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-[3px]"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="track-explain-title"
                  onClick={() => setExplainTrack(null)}
                >
                  <div
                    className="relative max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-parchment-300/85 bg-parchment-50 p-5 shadow-[0_28px_60px_-24px_rgba(28,23,20,0.55)] sm:p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setExplainTrack(null)}
                      className="absolute right-3 top-3 rounded-md p-1.5 text-stone-500 transition hover:bg-parchment-100 hover:text-stone-800"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>

                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                      Track overview
                    </p>
                    <h3 id="track-explain-title" className="mt-2 font-serif text-2xl font-semibold text-parchment-950">
                      {explainTrack.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{explainTrack.tagline}</p>

                    <div className="mt-4 rounded-xl border border-parchment-300/70 bg-parchment-100/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">What this test is about</p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-800">{explainTrack.purpose}</p>
                      <p className="mt-3 text-xs leading-relaxed text-stone-600">
                        <span className="font-semibold text-stone-700">Skills covered:</span>{' '}
                        {explainTrack.highlights.join(' · ')}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {explainTrack.marks.map((mark) => (
                        <span
                          key={`dlg-${explainTrack.fieldId}-${mark}`}
                          className="rounded-full border border-parchment-300/75 bg-parchment-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-stone-600"
                        >
                          {mark}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-parchment-300/55 pt-4 text-sm text-stone-700">
                      <span className="rounded-md bg-parchment-100 px-2.5 py-1 text-xs">
                        Duration {explainTrack.duration}
                      </span>
                      <span className="rounded-md bg-parchment-100 px-2.5 py-1 text-xs">{explainTrack.access}</span>
                      <span className="rounded-md border border-parchment-500/40 bg-parchment-150 px-2.5 py-1 text-xs font-semibold text-parchment-950">
                        Fee {explainTrack.price}
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setExplainTrack(null)}
                        className="rounded-lg border border-parchment-400/90 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-parchment-50"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const t = explainTrack;
                          setExplainTrack(null);
                          goToExamRoom(t);
                        }}
                        className="rounded-lg border border-parchment-800 bg-parchment-800 px-4 py-2.5 text-sm font-semibold text-parchment-50 transition hover:bg-parchment-900"
                      >
                        Continue to exam room
                      </button>
                    </div>
                  </div>
                </div>,
                document.body,
              )}
          </div>
        </section>

        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-y border-parchment-300/50 bg-parchment-150 py-14">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-7 lg:px-8">
            <span className="inline-flex rounded-full border border-parchment-400/60 bg-parchment-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-600">
              More about certification
            </span>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-parchment-950 md:text-[2.1rem]">
              Why must you join?
            </h2>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: Cpu,
                  title: 'Learn & qualify',
                  text: 'Build verified skill depth with practical assessments and role-relevant evaluation.',
                },
                {
                  icon: Code2,
                  title: 'Develop & build',
                  text: 'Strengthen your delivery ability in AI, Web3, backend, and product-focused workflows.',
                },
                {
                  icon: ArrowRight,
                  title: 'Lead & grow',
                  text: 'Show measurable progress and turn proven performance into stronger career opportunities.',
                },
                {
                  icon: BriefcaseBusiness,
                  title: 'Boost & acquire',
                  text: 'Earn hiring-ready credentials that employers can verify quickly and trust globally.',
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="relative overflow-hidden rounded-2xl border border-parchment-300/70 bg-gradient-to-b from-parchment-50 to-parchment-100 p-4 shadow-[0_10px_24px_-18px_rgba(40,30,24,0.46)] transition-all duration-200 hover:-translate-y-0.5 hover:border-parchment-500/50 hover:shadow-[0_16px_32px_-20px_rgba(40,30,24,0.55)]"
                >
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6b5344]/75 via-[#8b7355]/55 to-transparent"
                    aria-hidden
                  />
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-parchment-400/65 bg-parchment-150 text-parchment-900">
                    <item.icon size={17} strokeWidth={1.8} aria-hidden />
                  </div>
                  <h3 className="mt-4 font-serif text-[1.85rem] font-bold leading-[1.05] tracking-tight text-parchment-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-stone-700">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-parchment-300/70 bg-parchment-100 py-14">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-7 lg:px-8">
              <span className="inline-flex rounded-full bg-parchment-150/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                Hear it from
              </span>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-parchment-950 md:text-[2.1rem]">
                Our Global Alumni
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
                Credentials that travel — learners and teams worldwide use TrueAssess to prove skill depth to employers you already know.
              </p>

              <div className="mt-10">
              <article
                className="mx-auto flex max-w-3xl flex-col rounded-2xl bg-parchment-150/45 p-6 sm:p-8"
                aria-live="polite"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={ALUMNI_TESTIMONIALS[alumniSlideIdx].avatar}
                    alt={ALUMNI_TESTIMONIALS[alumniSlideIdx].name}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] shrink-0 rounded-full object-cover ring-2 ring-parchment-300/80"
                  />
                  <div className="min-w-0 pt-0.5">
                    <p className="font-serif text-xl font-semibold text-slate-900">{ALUMNI_TESTIMONIALS[alumniSlideIdx].name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-medium text-slate-800">{ALUMNI_TESTIMONIALS[alumniSlideIdx].followersLabel}:</span>{' '}
                      {ALUMNI_TESTIMONIALS[alumniSlideIdx].followers}
                    </p>
                  </div>
                </div>
                <blockquote className="mt-6 flex-1 border-l-2 border-blue-600/35 pl-4 font-serif text-[1.05rem] leading-relaxed italic text-slate-700">
                  “{ALUMNI_TESTIMONIALS[alumniSlideIdx].quote}”
                </blockquote>
                <div className="mt-8 flex justify-end gap-2">
                  <button
                    type="button"
                    aria-label="Previous testimonial"
                    onClick={() =>
                      setAlumniSlideIdx((i) => (i - 1 + ALUMNI_TESTIMONIALS.length) % ALUMNI_TESTIMONIALS.length)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <ChevronLeft size={20} strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Next testimonial"
                    onClick={() => setAlumniSlideIdx((i) => (i + 1) % ALUMNI_TESTIMONIALS.length)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <ChevronRight size={20} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </article>
              </div>
          </div>

              <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen mt-14 border-t border-parchment-300/60 bg-parchment-100 py-10 md:py-12">
                <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-7 lg:px-8">
                  <p className="text-center font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                    Where alumni work &amp; certify teams
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5 lg:grid-cols-8 lg:gap-4">
                    {ALUMNI_ORGS.map((org) => (
                      <AlumniEmployerTile key={org.name} name={org.name} domain={org.domain} />
                    ))}
                  </div>
                </div>
              </div>
        </section>

        <section
          id="research-knowledge-hub"
          className="border-t border-parchment-300/70 bg-parchment-100 py-14 md:py-16"
        >
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-7 lg:px-8">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-800">
                Research &amp; knowledge hub
              </p>
              <h2 className="mt-3 font-serif text-[1.65rem] font-semibold leading-tight tracking-tight text-parchment-950 sm:text-3xl md:text-[2rem]">
                5,400+ Research Articles &amp; Guides
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 md:text-[15px]">
                Deep dives written by practitioners and researchers—structured so you can apply ideas in assessments and on the job.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {RESEARCH_HUB_ARTICLES.map((article) => (
                <Link
                  key={article.title}
                  href={article.href}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-parchment-300/55 bg-parchment-150/80 shadow-[0_8px_28px_-18px_rgba(28,23,20,0.18)] transition hover:border-parchment-500/45 hover:shadow-[0_14px_36px_-22px_rgba(28,23,20,0.22)]"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-parchment-200/90">
                    <img
                      src={article.image}
                      alt={article.imageAlt}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <p className="text-[13px]">
                      <span className="font-semibold text-blue-800">{article.category}</span>
                      <span className="text-stone-400"> · </span>
                      <span className="text-stone-500">{article.readTime}</span>
                    </p>
                    <h3 className="mt-2 font-sans text-base font-semibold leading-snug text-parchment-950 md:text-[17px]">
                      {article.title}
                    </h3>
                    <p className="mt-auto pt-5 text-xs text-stone-500">{article.date}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 flex justify-center md:mt-12">
              <Link
                href="/skill-test"
                className="group inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-blue-800 transition hover:text-blue-950"
              >
                Browse all articles
                <ChevronRight size={18} strokeWidth={2} className="transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
