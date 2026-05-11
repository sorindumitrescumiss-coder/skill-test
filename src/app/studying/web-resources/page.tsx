import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { BUNDLED_ULTIMATE_WEB_DEV_STATIC_ROOT } from '@/config/studyRoutes';
import { existsSync } from 'fs';
import path from 'path';

const STATIC_BASE = BUNDLED_ULTIMATE_WEB_DEV_STATIC_ROOT;

const CURATED_DEMOS: { title: string; note?: string; path: string }[] = [
  {
    title: '3D card with hover',
    note: 'Local copied project page.',
    path: `${STATIC_BASE}/3d%20Card%20With%20Hover/index.html`,
  },
  {
    title: 'Task management app',
    note: 'Local copied project page.',
    path: `${STATIC_BASE}/task-management-app/index.html`,
  },
  { title: 'Weather app', note: 'Local copied project page.', path: `${STATIC_BASE}/WeatherApp/index.html` },
  { title: 'Expense tracker', note: 'Local copied project page.', path: `${STATIC_BASE}/ExpenseTrackerApp/index.html` },
  { title: 'QR code generator', note: 'Local copied project page.', path: `${STATIC_BASE}/Qr_Code_Generator/index.html` },
  { title: 'Netflix UI clone', note: 'Local copied project page.', path: `${STATIC_BASE}/Netflix%20UI%20Clone/index.html` },
  { title: 'Portfolio website', note: 'Local copied project page.', path: `${STATIC_BASE}/portfolio/index.html` },
  { title: 'Aim training', note: 'Local copied project page.', path: `${STATIC_BASE}/Aim-training/index.html` },
];

function isServedFilePresent(hrefPath: string): boolean {
  const decoded = decodeURIComponent(hrefPath);
  const relative = decoded.startsWith('/') ? decoded.slice(1) : decoded;
  const diskPath = path.join(process.cwd(), 'public', relative);
  return existsSync(diskPath);
}

export default function WebStudyResourcesHubPage() {
  const availableDemos = CURATED_DEMOS.filter((item) => isServedFilePresent(item.path));

  return (
    <AppLayout activePath="/studying">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 md:pt-14">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          Studying · Web full stack
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink md:text-[2.05rem]">
          Web study materials
        </h1>
        <p className="mt-4 font-sans text-[15px] leading-relaxed text-ink-muted">
          Below are web projects copied from the README <strong className="font-semibold text-ink">List Of Projects</strong> in the open-source{' '}
          <strong className="font-semibold text-ink">Ultimate Web Development Resources</strong> collection linked into this
          repo. Clicking opens the local project page in a new tab.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/studying" className="btn-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm no-underline">
            Studying overview
          </Link>
        </div>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold text-ink">Curated demos</h2>
          <p className="mt-2 font-sans text-sm text-ink-muted">
            Each link opens the bundled local <code className="font-mono text-xs">index.html</code>.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {availableDemos.map((item) => (
              <li key={item.path}>
                <a
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col rounded-xl border border-parchment-300/85 bg-parchment-50/95 p-4 shadow-sm transition hover:border-parchment-500/40 hover:shadow-md"
                >
                  <span className="font-sans text-sm font-semibold text-ink">{item.title}</span>
                  {item.note ? (
                    <span className="mt-2 font-sans text-xs leading-relaxed text-ink-soft">{item.note}</span>
                  ) : null}
                  <span className="mt-3 font-mono text-[11px] text-stone-500 break-all">{item.path}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
