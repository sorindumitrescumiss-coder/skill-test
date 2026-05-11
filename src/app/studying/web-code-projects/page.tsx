import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import AppLayout from '@/components/AppLayout';

type ProjectCard = {
  name: string;
  href: string;
  note: string;
};

const WEB_CODE_PUBLIC_ROOT = '/web-code';

function toTitleCase(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getProjectCards(): ProjectCard[] {
  const studyingWebCodePath = path.join(process.cwd(), 'studying', 'web code');
  if (!fs.existsSync(studyingWebCodePath)) return [];

  const entries = fs.readdirSync(studyingWebCodePath, { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort((a, b) => a.localeCompare(b));

  return folders.map((folder) => {
    const folderPath = path.join(studyingWebCodePath, folder);
    const indexHtml = path.join(folderPath, 'index.html');
    const readmeMd = path.join(folderPath, 'README.md');
    const readmeLowerMd = path.join(folderPath, 'readme.md');

    if (fs.existsSync(indexHtml)) {
      return {
        name: toTitleCase(folder),
        href: `${WEB_CODE_PUBLIC_ROOT}/${encodeURIComponent(folder)}/index.html`,
        note: 'Opens project entry page.',
      };
    }

    if (fs.existsSync(readmeMd) || fs.existsSync(readmeLowerMd)) {
      return {
        name: toTitleCase(folder),
        href: `${WEB_CODE_PUBLIC_ROOT}/${encodeURIComponent(folder)}/${fs.existsSync(readmeMd) ? 'README.md' : 'readme.md'}`,
        note: 'Opens project README.',
      };
    }

    return {
      name: toTitleCase(folder),
      href: `${WEB_CODE_PUBLIC_ROOT}/${encodeURIComponent(folder)}/`,
      note: 'Opens project folder.',
    };
  });
}

export default function StudyingWebCodeProjectsPage() {
  const projects = getProjectCards();

  return (
    <AppLayout activePath="/studying">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 md:pt-14">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Studying</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink md:text-[2.05rem]">Web code projects</h1>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-muted">
          All projects found under <code className="rounded bg-parchment-200/80 px-1.5 py-0.5 font-mono text-xs">studying/web code</code>.
        </p>

        <ul className="mt-7 grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.href}>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col rounded-xl border border-parchment-300/85 bg-parchment-50/95 p-4 shadow-sm transition hover:border-parchment-500/40 hover:shadow-md"
              >
                <span className="font-sans text-sm font-semibold text-ink">{project.name}</span>
                <span className="mt-2 font-sans text-xs leading-relaxed text-ink-soft">{project.note}</span>
                <span className="mt-3 font-mono text-[11px] text-stone-500 break-all">{project.href}</span>
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
