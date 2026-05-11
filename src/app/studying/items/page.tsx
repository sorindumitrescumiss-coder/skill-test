import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import AppLayout from '@/components/AppLayout';
import studyBookCatalog from '@/data/studyBookCatalog.json';
import studyBookMetadata from '@/data/studyBookMetadata.json';
import StudyItemsGrid from './StudyItemsGrid';
import styles from './page.module.css';

/** Re-read `studying/web/books/web books` on each request so new PDFs show without rebuild. */
export const dynamic = 'force-dynamic';

type StudyItem = { title: string; description: string; href: string; imageHref?: string | null };
type BookEntry = { title: string; description: string; image?: string };

const BASE_ITEMS: StudyItem[] = [
  {
    title: 'Web Dev For Beginners',
    description: 'Open the new project root page you added.',
    href: '/web/Web-Dev-For-Beginners-main/index.html',
    imageHref: null,
  },
];

function prettifyBookName(fileName: string): string {
  const noExt = fileName.replace(/\.pdf$/i, '');
  return noExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const catalog = studyBookCatalog as Record<string, BookEntry>;
const generatedMeta = studyBookMetadata as Record<string, BookEntry>;
const BOOK_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ROOT_IMAGE_DIR = path.join(process.cwd(), 'image');
const WEB_IMAGE_DIR_CANDIDATES = [path.join(process.cwd(), 'image', 'web'), path.join(process.cwd(), 'image', 'Web')];

function toWebBooksHref(...segments: string[]): string {
  return `/web-books/${segments.map((s) => encodeURIComponent(s)).join('/')}`;
}

function toStudyImageHref(...segments: string[]): string {
  return `/study-images/${segments.map((s) => encodeURIComponent(s)).join('/')}`;
}

function getRootImageItems(): Array<{ href: string }> {
  const webImageDir = WEB_IMAGE_DIR_CANDIDATES.find((dir) => fs.existsSync(dir));
  if (webImageDir) {
    return fs
      .readdirSync(webImageDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && BOOK_IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()))
      .map((entry) => ({ href: toStudyImageHref(path.basename(webImageDir), entry.name) }))
      .sort((a, b) => a.href.localeCompare(b.href));
  }

  if (!fs.existsSync(ROOT_IMAGE_DIR)) return [];
  return fs
    .readdirSync(ROOT_IMAGE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && BOOK_IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()))
    .map((entry) => ({ href: toStudyImageHref(entry.name) }))
    .sort((a, b) => a.href.localeCompare(b.href));
}

function getBookImageHref(fileName: string, booksDir: string, fromCatalog?: BookEntry): string | null {
  if (fromCatalog?.image) {
    if (fromCatalog.image.startsWith('/')) return fromCatalog.image;
    return toWebBooksHref(fromCatalog.image);
  }

  const baseName = fileName.replace(/\.pdf$/i, '');
  for (const ext of BOOK_IMAGE_EXTENSIONS) {
    const inRoot = `${baseName}${ext}`;
    if (fs.existsSync(path.join(booksDir, inRoot))) return toWebBooksHref(inRoot);
    const inCovers = path.join('covers', `${baseName}${ext}`);
    if (fs.existsSync(path.join(booksDir, inCovers))) return toWebBooksHref('covers', `${baseName}${ext}`);
  }

  return null;
}

function getBookItems(): StudyItem[] {
  const booksDir = path.join(process.cwd(), 'studying', 'web', 'books', 'web books');
  if (!fs.existsSync(booksDir)) return [];

  const files = fs.readdirSync(booksDir, { withFileTypes: true });
  return files
    .filter((f) => f.isFile() && /\.pdf$/i.test(f.name))
    .map((f) => {
      const fromCatalog = catalog[f.name];
      const fromGenerated = generatedMeta[f.name];
      const title = fromCatalog?.title ?? fromGenerated?.title ?? prettifyBookName(f.name);
      const description =
        fromCatalog?.description ?? fromGenerated?.description ?? 'Open study book (PDF).';
      const imageHref = getBookImageHref(f.name, booksDir, fromCatalog);
      return {
        title,
        description,
        href: toWebBooksHref(f.name),
        imageHref,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export default function StudyingItemsPage() {
  const rootImages = getRootImageItems();
  const withFallbackImage = (items: StudyItem[]): StudyItem[] =>
    items.map((item, idx) => {
      if (item.imageHref) return item;
      if (!rootImages.length) return item;
      const fallbackImage = rootImages[idx % rootImages.length];
      return { ...item, imageHref: fallbackImage.href };
    });

  const items = withFallbackImage([...BASE_ITEMS, ...getBookItems()]);

  return (
    <AppLayout activePath="/studying">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pt-14">
        <section className="relative overflow-hidden rounded-2xl border border-parchment-500/35 bg-[radial-gradient(circle_at_20%_20%,rgba(247,223,143,0.16),transparent_35%),radial-gradient(circle_at_80%_35%,rgba(208,169,255,0.15),transparent_40%),linear-gradient(120deg,#2d2634_0%,#3a2c3f_45%,#4a3640_100%)] px-6 py-10 shadow-[0_14px_34px_rgba(31,22,40,0.32)] sm:px-8 sm:py-12">
          <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
            <div className={`${styles.starsMask} h-full w-full`} />
          </div>
          <p className="relative mx-auto max-w-3xl text-center font-serif text-3xl font-semibold leading-tight tracking-tight text-parchment-50 sm:text-4xl md:text-5xl">
            <span className={`${styles.heroLine} block`}>Let&apos;s immerse ourselves</span>
            <span className={`${styles.heroLine} block [animation-delay:180ms]`}>in the vast and deep</span>
            <span className={`${styles.heroLine} block [animation-delay:360ms]`}>
              world of learning, as vast as the universe.
            </span>
          </p>
        </section>

        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Studying</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink md:text-[2.05rem]">Choose study items</h1>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-muted">
          This page appears first when you click <strong className="font-semibold text-ink">Open web study</strong>.
          Continue below.
        </p>

        <StudyItemsGrid items={items} />

        <div className="mt-7">
          <Link href="/learning-world#learning-tracks" className="btn-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm no-underline">
            Back to Learning World
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
