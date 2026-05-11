import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import AppLayout from '@/components/AppLayout';
import StudyItemsGrid from '../items/StudyItemsGrid';
import architectureStudyBookMetadata from '@/data/architectureStudyBookMetadata.json';

export const dynamic = 'force-dynamic';

type StudyItem = { title: string; description: string; href: string; imageHref?: string | null };
type ArchitectureBookMeta = { title: string; description: string };
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const archMeta = architectureStudyBookMetadata as Record<string, ArchitectureBookMeta>;

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

function getArchitectureBookItems(): StudyItem[] {
  const booksDir = path.join(process.cwd(), 'studying', 'architecture');
  if (!fs.existsSync(booksDir)) return [];

  const archImageDirs = [
    path.join(process.cwd(), 'image', 'architecture'),
    path.join(process.cwd(), 'image', 'Architecture'),
  ];
  const archImageDir = archImageDirs.find((dir) => fs.existsSync(dir));
  const webImageDirCandidates = [path.join(process.cwd(), 'image', 'web'), path.join(process.cwd(), 'image', 'Web')];
  const webImageDir = webImageDirCandidates.find((dir) => fs.existsSync(dir));

  const imageFiles = archImageDir
    ? fs
        .readdirSync(archImageDir, { withFileTypes: true })
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

  const files = fs.readdirSync(booksDir, { withFileTypes: true });
  return files
    .filter((f) => f.isFile() && /\.pdf$/i.test(f.name))
    .map((f) => {
      const pdfBase = f.name.replace(/\.pdf$/i, '').toLowerCase();
      const matchedImage = imageByBase.get(pdfBase);

      let imageHref: string | null = null;
      if (matchedImage && archImageDir) {
        const idx = remainingImages.indexOf(matchedImage);
        if (idx >= 0) remainingImages.splice(idx, 1);
        imageHref = toStudyImageHref(path.basename(archImageDir), matchedImage);
      } else if (remainingImages.length && archImageDir) {
        imageHref = toStudyImageHref(path.basename(archImageDir), remainingImages.shift()!);
      } else if (remainingWebImages.length && webImageDir) {
        imageHref = toStudyImageHref(path.basename(webImageDir), remainingWebImages.shift()!);
      }

      const meta = archMeta[f.name];
      const title = isReadableText(meta?.title) ? meta!.title : prettifyName(f.name);
      const description = isReadableText(meta?.description)
        ? meta!.description
        : 'Architecture study material (PDF).';

      return {
        title,
        description,
        href: `/architecture-books/${encodeURIComponent(f.name)}`,
        imageHref,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export default function StudyingArchitectureItemsPage() {
  const items = getArchitectureBookItems();

  return (
    <AppLayout activePath="/studying">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pt-14">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Studying</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink md:text-[2.05rem]">
          Architecture study books
        </h1>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-muted">
          These books are loaded from <strong className="font-semibold text-ink">studying/architecture</strong>. Images
          can go in <strong className="font-semibold text-ink">image/architecture</strong>. Titles and summaries come
          from <strong className="font-semibold text-ink">architectureStudyBookMetadata.json</strong> — regenerate with{' '}
          <code className="rounded bg-parchment-200/80 px-1.5 py-0.5 font-mono text-[13px] text-ink">
            npm run architecture-books:metadata
          </code>{' '}
          after adding PDFs.
        </p>

        <StudyItemsGrid items={items} />

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
