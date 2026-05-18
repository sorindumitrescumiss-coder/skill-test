'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import CredentialingHero from '@/components/CredentialingHero';
import TrustedBySection from '@/components/TrustedBySection';
import {
  ALUMNI_ORGS,
  ALUMNI_TESTIMONIALS,
  RESEARCH_HUB_ARTICLES,
  SKILL_TEST_TRACKS,
  type SkillTestTrack,
} from '@/app/dashboard/content';
import { AlumniEmployerTile } from '@/app/dashboard/components/AlumniEmployerTile';
import {
  ArrowRight,
  Bookmark,
  Brain,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Globe,
  Infinity,
  Lock,
  UserCheck,
  Workflow,
  X,
} from 'lucide-react';

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
                      src="/skill-test-side-illustration.png"
                      alt="Illustration for NFT certifications"
                      className="h-auto w-full rounded-2xl bg-parchment-150/90 object-contain p-3 shadow-[0_12px_40px_-12px_rgba(30,41,59,0.35)]"
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
                      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-parchment-300/80 bg-gradient-to-b from-parchment-50 via-parchment-50 to-parchment-100 px-4 py-4 text-left shadow-[0_10px_26px_-18px_rgba(15,23,42,0.5)] ring-1 ring-parchment-200/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-parchment-500/60 hover:ring-parchment-400/40 hover:shadow-[0_18px_34px_-18px_rgba(15,23,42,0.56)] sm:px-5"
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
                  className="relative overflow-hidden rounded-2xl border border-parchment-300/70 bg-gradient-to-b from-parchment-50 to-parchment-100 p-4 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.46)] transition-all duration-200 hover:-translate-y-0.5 hover:border-parchment-500/50 hover:shadow-[0_16px_32px_-20px_rgba(15,23,42,0.55)]"
                >
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#4f46e5]/75 via-[#6366f1]/55 to-transparent"
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
