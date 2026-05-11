import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { STUDYING_WEB_RESOURCES_HREF } from '@/config/studyRoutes';

export default function StudyingPage() {
  return (
    <AppLayout activePath="/studying">
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 md:pt-14">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Studying</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink md:text-[2rem]">Web · Full stack</h1>
        <p className="mt-4 font-sans text-[15px] leading-relaxed text-ink-muted">
          Use <strong className="font-semibold text-ink">Open study demos</strong> for the curated list of bundled HTML/CSS/JS projects (
          <code className="rounded bg-parchment-200/80 px-1.5 py-0.5 font-mono text-xs">studying/</code>
          ).
        </p>
        <p className="mt-3 font-sans text-xs leading-relaxed text-ink-soft">
          Local dev uses{' '}
          <code className="rounded bg-parchment-200/70 px-1 py-0.5 font-mono text-[11px]">npm run dev</code> on{' '}
          <strong className="text-ink">port 4028</strong> — open{' '}
          <code className="font-mono text-[11px]">http://localhost:4028/studying</code>.
        </p>
        <section className="mt-6 rounded-2xl border border-parchment-300/80 bg-parchment-50/90 p-5 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-ink">About studying web development</h2>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">
            Focus on the full stack journey: HTML/CSS fundamentals, JavaScript and TypeScript, frontend frameworks, backend
            APIs, databases, testing, and deployment. Build small projects as you learn so each topic turns into practical
            skill.
          </p>
        </section>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={STUDYING_WEB_RESOURCES_HREF}
            className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm no-underline"
          >
            Open study demos
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
