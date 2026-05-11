import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import AppLayout from '@/components/AppLayout';
import StudyItemsGrid from '../items/StudyItemsGrid';
import aiStudyBookMetadata from '@/data/aiStudyBookMetadata.json';

export const dynamic = 'force-dynamic';

type StudyItem = { title: string; description: string; href: string; imageHref?: string | null };
type AiBookMeta = { title: string; description: string };
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const aiMeta = aiStudyBookMetadata as Record<string, AiBookMeta>;

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

function getAiBookItems(): StudyItem[] {
  const booksDir = path.join(process.cwd(), 'studying', 'AI', 'AI');
  if (!fs.existsSync(booksDir)) return [];

  const aiImageDirCandidates = [path.join(process.cwd(), 'image', 'AI'), path.join(process.cwd(), 'image', 'ai')];
  const aiImageDir = aiImageDirCandidates.find((dir) => fs.existsSync(dir));
  const webImageDirCandidates = [path.join(process.cwd(), 'image', 'web'), path.join(process.cwd(), 'image', 'Web')];
  const webImageDir = webImageDirCandidates.find((dir) => fs.existsSync(dir));
  const imageFiles = aiImageDir
    ? fs
        .readdirSync(aiImageDir, { withFileTypes: true })
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
    const base = imageName.replace(/\.[^.]+$/, '').toLowerCase();
    imageByBase.set(base, imageName);
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
      if (matchedImage && aiImageDir) {
        const idx = remainingImages.indexOf(matchedImage);
        if (idx >= 0) remainingImages.splice(idx, 1);
        imageHref = toStudyImageHref(path.basename(aiImageDir), matchedImage);
      } else if (remainingImages.length && aiImageDir) {
        const fallback = remainingImages.shift()!;
        imageHref = toStudyImageHref(path.basename(aiImageDir), fallback);
      } else if (remainingWebImages.length && webImageDir) {
        const fallbackWeb = remainingWebImages.shift()!;
        imageHref = toStudyImageHref(path.basename(webImageDir), fallbackWeb);
      }

      return {
        title: aiMeta[f.name]?.title ?? prettifyName(f.name),
        description: aiMeta[f.name]?.description ?? 'Open AI study book (PDF).',
        href: `/ai-books/${encodeURIComponent(f.name)}`,
        imageHref,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export default function StudyingAiItemsPage() {
  const items = getAiBookItems();

  return (
    <AppLayout activePath="/studying">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pt-14">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Studying</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink md:text-[2.05rem]">AI study books</h1>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-muted">
          These books are loaded from <strong className="font-semibold text-ink">studying/AI/AI</strong>.
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
