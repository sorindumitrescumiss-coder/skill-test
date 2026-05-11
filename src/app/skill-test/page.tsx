import React from 'react';
import AppLayout from '@/components/AppLayout';
import SkillTestClient from './SkillTestClient';

export default function SkillTestPage() {
  return (
    <AppLayout activePath="/skill-test">
      <div className="mx-auto w-full px-4 pb-10 pt-16 sm:px-6 md:w-[min(60vw,1440px)]">
        <div className="relative flex min-h-[calc(100dvh-11rem)] w-full flex-col">
          {/* Title + intro sit on top of the container (overlap the upper border) */}
          <header className="absolute left-1/2 top-0 z-20 w-[min(calc(100%-1rem),36rem)] -translate-x-1/2 -translate-y-1/2 px-3 text-center md:w-[min(calc(100%-2rem),52rem)]">
            <div className="mx-auto rounded-xl border-2 border-stone-400 bg-parchment-100 px-6 py-4 shadow-md ring-2 ring-parchment-50/95">
              <h1 className="font-serif text-2xl font-semibold italic tracking-tight text-ink md:text-[1.875rem]">AI skill test</h1>
              <p className="mt-3 font-serif text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]">
                You&apos;ll see test format and rules first, then choose difficulty, field, language, and subtopics before the
                generated exam begins.
              </p>
            </div>
          </header>

          {/* Bolder panel — content flows below the overlapping header */}
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border-2 border-stone-400/90 bg-gradient-to-b from-parchment-50 via-[#faf6ee] to-parchment-150/90 px-4 pb-6 pt-[7.25rem] shadow-[0_4px_24px_-4px_rgba(28,25,23,0.12)] ring-1 ring-stone-500/20 sm:px-6 md:pt-[8rem]">
            <SkillTestClient />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
