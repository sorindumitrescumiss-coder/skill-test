import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import AppLayout from '@/components/AppLayout';
import StudyItemsGrid from '../items/StudyItemsGrid';
import desktopApplicationsStudyBookMetadata from '@/data/desktopApplicationsStudyBookMetadata.json';
import { resolveDesktopApplicationsStudyBookDirs } from '@/lib/desktopApplicationsStudyDirs';

export const dynamic = 'force-dynamic';

type StudyItem = { title: string; description: string; href: string; imageHref?: string | null };
type DesktopBookMeta = { title: string; description: string };
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const desktopMeta = desktopApplicationsStudyBookMetadata as Record<string, DesktopBookMeta>;

function toStudyImageHref(...segments: string[]): string {
  return `/study-images/${segments.map((s) => encodeURIComponent(s)).join('/')}`;
}

function prettifyName(fileName: string): string {
  return fileName
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isReadableText(value: string | undefined): boolean {
  if (!value) return false;
  const text = value.trim();
  if (text.length < 3) return false;
  const letters = (text.match(/[A-Za-z]/g) ?? []).length;
  const weird = (text.match(/[^A-Za-z0-9\s.,:;!?'"()\-&/]/g) ?? []).length;
  return letters >= 3 && weird / Math.max(text.length, 1) < 0.18;
}

function getDesktopApplicationsBookItems(): StudyItem[] {
  const bookDirs = resolveDesktopApplicationsStudyBookDirs();
  if (!bookDirs.length) return [];

  const desktopImageDirs = [
    path.join(process.cwd(), 'image', 'desktop-applications'),
    path.join(process.cwd(), 'image', 'desktop application'),
    path.join(process.cwd(), 'image', 'DesktopApplications'),
    path.join(process.cwd(), 'image', 'desktop'),
    path.join(process.cwd(), 'image', 'Desktop'),
  ];
  const desktopImageDir = desktopImageDirs.find((dir) => fs.existsSync(dir));
  const webImageDirCandidates = [path.join(process.cwd(), 'image', 'web'), path.join(process.cwd(), 'image', 'Web')];
  const webImageDir = webImageDirCandidates.find((dir) => fs.existsSync(dir));

  const imageFiles = desktopImageDir
    ? fs
        .readdirSync(desktopImageDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()))
        .map((entry) => entry.name)
    : [];
  const webImageFiles = webImageDir
    ? fs
        .readdirSync(webImageDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()))
        .map((entry) => entry.name)
    : [];

  const imageByBase = new Map<string, string>();
  for (const imageName of imageFiles) {
    imageByBase.set(imageName.replace(/\.[^.]+$/, '').toLowerCase(), imageName);
  }
  const remainingImages = [...imageFiles].sort((a, b) => a.localeCompare(b));
  const remainingWebImages = [...webImageFiles].sort((a, b) => a.localeCompare(b));

  type PdfEntry = { name: string };
  const pdfEntries: PdfEntry[] = [];
  const seenLower = new Set<string>();
  for (const booksDir of bookDirs) {
    const entries = fs.readdirSync(booksDir, { withFileTypes: true });
    for (const f of entries) {
      if (!f.isFile() || !/\.pdf$/i.test(f.name)) continue;
      const key = f.name.toLowerCase();
      if (seenLower.has(key)) continue;
      seenLower.add(key);
      pdfEntries.push({ name: f.name });
    }
  }

  return pdfEntries
    .map((f) => {
      const pdfBase = f.name.replace(/\.pdf$/i, '').toLowerCase();
      const matchedImage = imageByBase.get(pdfBase);

      let imageHref: string | null = null;
      if (matchedImage && desktopImageDir) {
        const idx = remainingImages.indexOf(matchedImage);
        if (idx >= 0) remainingImages.splice(idx, 1);
        imageHref = toStudyImageHref(path.basename(desktopImageDir), matchedImage);
      } else if (remainingImages.length && desktopImageDir) {
        imageHref = toStudyImageHref(path.basename(desktopImageDir), remainingImages.shift()!);
      } else if (remainingWebImages.length && webImageDir) {
        imageHref = toStudyImageHref(path.basename(webImageDir), remainingWebImages.shift()!);
      }

      const meta = desktopMeta[f.name];
      const title = isReadableText(meta?.title) ? meta!.title : prettifyName(f.name);
      const description = isReadableText(meta?.description)
        ? meta!.description
        : 'Desktop applications study material (PDF).';

      return {
        title,
        description,
        href: `/desktop-applications-books/${encodeURIComponent(f.name)}`,
        imageHref,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export default function StudyingDesktopApplicationsItemsPage() {
  const items = getDesktopApplicationsBookItems();

  return (
    <AppLayout activePath="/studying">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pt-14">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Studying</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink md:text-[2.05rem]">
          Desktop applications study books
        </h1>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-muted">
          PDFs load from <strong className="font-semibold text-ink">studying/desktop-applications</strong>,{' '}
          <strong className="font-semibold text-ink">studying/desktop application</strong>, or{' '}
          <strong className="font-semibold text-ink">studying/desktop</strong>. Images:{' '}
          <strong className="font-semibold text-ink">image/desktop-applications</strong> or{' '}
          <strong className="font-semibold text-ink">image/desktop</strong>. Metadata:{' '}
          <strong className="font-semibold text-ink">desktopApplicationsStudyBookMetadata.json</strong> — run{' '}
          <code className="rounded bg-parchment-200/80 px-1.5 py-0.5 font-mono text-[13px] text-ink">
            npm run desktop-applications-books:metadata
          </code>
          .
        </p>

        {items.length === 0 ? (
          <p className="mt-8 rounded-xl border border-parchment-300/80 bg-parchment-50/90 px-4 py-6 font-sans text-sm leading-relaxed text-ink-muted">
            No PDFs found. Add <code className="font-mono text-ink">.pdf</code> files under{' '}
            <code className="font-mono text-ink">studying/desktop-applications</code> or{' '}
            <code className="font-mono text-ink">studying/desktop application</code>, then run{' '}
            <code className="font-mono text-ink">npm run desktop-applications-books:metadata</code>.
          </p>
        ) : (
          <StudyItemsGrid items={items} />
        )}

        <div className="mt-7">
          <Link
            href="/learning-world#learning-tracks"
            className="btn-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm no-underline"
          >
            Back to Learning World
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
