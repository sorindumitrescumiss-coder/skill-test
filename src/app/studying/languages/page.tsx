import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

const LANGUAGE_ITEMS: { name: string; description: string; href: string }[] = [
  {
    name: 'HTML',
    description: 'Structure web pages with semantic tags and accessible markup.',
    href: '/web-dev-for-beginners-main/1-getting-started-lessons/1-intro-to-programming-languages/README.md',
  },
  {
    name: 'CSS',
    description: 'Style layouts, typography, spacing, and responsive behavior.',
    href: '/web-dev-for-beginners-main/3-terrarium/README.md',
  },
  {
    name: 'JavaScript',
    description: 'Add interactivity, logic, and data handling in the browser.',
    href: '/30-seconds-of-code-master/README.md',
  },
  {
    name: 'TypeScript',
    description: 'Use typed JavaScript for safer and scalable web code.',
    href: '/web-dev-for-beginners-main/README.md',
  },
];

export default function StudyingLanguagesPage() {
  return (
    <AppLayout activePath="/studying">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 md:pt-14">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Studying</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink md:text-[2.05rem]">Web programming language list</h1>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-muted">
          Choose a language area to start learning from your connected web study project.
        </p>

        <ul className="mt-7 grid gap-3 sm:grid-cols-2">
          {LANGUAGE_ITEMS.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col rounded-xl border border-parchment-300/85 bg-parchment-50/95 p-4 shadow-sm transition hover:border-parchment-500/40 hover:shadow-md"
              >
                <span className="font-sans text-sm font-semibold text-ink">{item.name}</span>
                <span className="mt-2 font-sans text-xs leading-relaxed text-ink-soft">{item.description}</span>
                <span className="mt-3 font-mono text-[11px] text-stone-500 break-all">{item.href}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/studying/items" className="btn-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm no-underline">
            Back to study items
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
