'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SkillFieldIcon } from '@/app/skill-test/SkillFieldIcon';
import { LEARNING_TRACKS } from '@/app/learning-world/learningTracks';

export default function LearningWorldClient() {
  const filtered = LEARNING_TRACKS;

  return (
    <div id="learning-tracks" className="mx-auto max-w-7xl scroll-mt-24 space-y-8 font-serif text-ink">
      <header className="relative space-y-3 border-b border-parchment-300/60 pb-8">
        <div className="absolute -left-1 top-0 hidden h-12 w-1 rounded-full bg-gradient-to-b from-violet-500/70 to-parchment-600 sm:block" aria-hidden />
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#4f46e5]">Learning World</p>
        <h1 className="max-w-3xl font-serif text-3xl font-semibold italic leading-[1.15] tracking-tight text-ink sm:text-[2.15rem]">
          Learn by track
        </h1>
        <p className="max-w-2xl font-sans text-[15px] leading-relaxed text-ink-muted">
          Each track is a <strong className="font-semibold text-ink">skill test domain</strong> — the same list you see when you choose your field in the AI skill test. Search below, open a card, then continue setup in the test flow.
        </p>
      </header>

      <div className="flex items-center justify-end rounded-2xl border border-parchment-300/85 bg-gradient-to-b from-parchment-50/90 to-parchment-150/80 p-4 shadow-sm">
        <p className="font-sans text-xs tabular-nums text-ink-soft">
          <span className="font-semibold text-ink">{filtered.length}</span>
          <span className="text-ink-muted"> / {LEARNING_TRACKS.length} tracks</span>
        </p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((track, i) => (
          <li
            key={track.id}
            className="animate-[fadeInUpSoft_0.45s_ease-out_both]"
            style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
          >
            <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-parchment-300/80 bg-gradient-to-b from-parchment-50/98 via-parchment-150/90 to-parchment-150/95 shadow-card transition duration-300 ease-out hover:-translate-y-1 hover:border-parchment-400 hover:shadow-card-hover">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/35 to-transparent opacity-0 transition duration-300 group-hover:opacity-100"
                aria-hidden
              />
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="mb-4 flex items-start gap-3.5">
                  <SkillFieldIcon fieldId={track.id} variant="learning" />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h2 className="font-serif text-lg font-semibold leading-snug tracking-tight text-ink sm:text-xl">
                      <Link
                        href={track.href}
                        className="transition hover:text-parchment-900 hover:underline decoration-parchment-400/60 underline-offset-4"
                      >
                        {track.title}
                      </Link>
                    </h2>
                    <p className="mt-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{track.subtitle}</p>
                  </div>
                </div>
                <p className="mb-4 line-clamp-3 flex-1 font-sans text-sm leading-relaxed text-ink-muted">{track.description}</p>
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {track.tags.map((tag) => (
                    <span
                      key={`${track.id}-${tag}`}
                      className="inline-flex max-w-full truncate rounded-md bg-parchment-200/50 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-ink-soft ring-1 ring-inset ring-parchment-300/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={track.href}
                  className="btn-primary mt-auto inline-flex w-full items-center justify-center gap-2 rounded-sm py-2.5 text-xs font-semibold uppercase tracking-[0.1em] no-underline transition hover:gap-2.5"
                >
                  {track.ctaLabel ?? 'Open in skill tests'}
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
