import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import AppLayout from '@/components/AppLayout';
import StudyItemsGrid from '../items/StudyItemsGrid';
import marketingStudyBookMetadata from '@/data/marketingStudyBookMetadata.json';

export const dynamic = 'force-dynamic';

type StudyItem = { title: string; description: string; href: string; imageHref?: string | null };
type MarketingBookMeta = { title: string; description: string };
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const marketingMeta = marketingStudyBookMetadata as Record<string, MarketingBookMeta>;

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

function getMarketingBookItems(): StudyItem[] {
  const booksDir = path.join(process.cwd(), 'studying', 'marketing');
  if (!fs.existsSync(booksDir)) return [];

  const marketingImageDirs = [
    path.join(process.cwd(), 'image', 'marketing'),
    path.join(process.cwd(), 'image', 'Marketing'),
  ];
  const marketingImageDir = marketingImageDirs.find((dir) => fs.existsSync(dir));
  const webImageDirCandidates = [path.join(process.cwd(), 'image', 'web'), path.join(process.cwd(), 'image', 'Web')];
  const webImageDir = webImageDirCandidates.find((dir) => fs.existsSync(dir));

  const imageFiles = marketingImageDir
    ? fs
        .readdirSync(marketingImageDir, { withFileTypes: true })
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
      if (matchedImage && marketingImageDir) {
        const idx = remainingImages.indexOf(matchedImage);
        if (idx >= 0) remainingImages.splice(idx, 1);
        imageHref = toStudyImageHref(path.basename(marketingImageDir), matchedImage);
      } else if (remainingImages.length && marketingImageDir) {
        imageHref = toStudyImageHref(path.basename(marketingImageDir), remainingImages.shift()!);
      } else if (remainingWebImages.length && webImageDir) {
        imageHref = toStudyImageHref(path.basename(webImageDir), remainingWebImages.shift()!);
      }

      const meta = marketingMeta[f.name];
      const title = isReadableText(meta?.title) ? meta!.title : prettifyName(f.name);
      const description = isReadableText(meta?.description)
        ? meta!.description
        : 'Marketing study material (PDF).';

      return {
        title,
        description,
        href: `/marketing-books/${encodeURIComponent(f.name)}`,
        imageHref,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export default function StudyingMarketingItemsPage() {
  const items = getMarketingBookItems();

  return (
    <AppLayout activePath="/studying">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pt-14">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Studying</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink md:text-[2.05rem]">
          Marketing study books
        </h1>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-muted">
          PDFs load from <strong className="font-semibold text-ink">studying/marketing</strong>. Cover images can live in{' '}
          <strong className="font-semibold text-ink">image/marketing</strong> (match the PDF basename when possible).
          Titles and summaries are stored in{' '}
          <strong className="font-semibold text-ink">marketingStudyBookMetadata.json</strong> — refresh with{' '}
          <code className="rounded bg-parchment-200/80 px-1.5 py-0.5 font-mono text-[13px] text-ink">
            npm run marketing-books:metadata
          </code>{' '}
          after adding or replacing PDFs.
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
