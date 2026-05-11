'use client';

import React from 'react';

type StudyItem = { title: string; description: string; href: string; imageHref?: string | null };

interface StudyItemsGridProps {
  items: StudyItem[];
}

export default function StudyItemsGrid({ items }: StudyItemsGridProps) {
  const [showAll, setShowAll] = React.useState(false);
  const visibleItems = showAll ? items : items.slice(0, 9);
  const hasMore = items.length > 9;

  return (
    <>
      <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item, index) => (
          <li
            key={item.href}
            className="animate-[fadeInUp_420ms_ease-out] [animation-fill-mode:both]"
            style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
          >
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full min-h-[22rem] flex-col overflow-hidden rounded-xl border border-parchment-800/80 bg-parchment-900 text-parchment-50 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-parchment-500/70 hover:bg-parchment-850 hover:shadow-md"
            >
              {item.imageHref ? (
                <img src={item.imageHref} alt={item.title} className="h-36 w-full object-cover" loading="lazy" />
              ) : (
                <div className="h-36 w-full bg-parchment-800/80" aria-hidden />
              )}
              <div className="flex flex-1 flex-col p-4">
                <span className="line-clamp-2 min-h-[2.75rem] font-sans text-sm font-semibold text-parchment-50">
                  {item.title}
                </span>
                <span className="mt-2 block line-clamp-4 min-h-[4.75rem] font-sans text-xs leading-relaxed text-parchment-200/90">
                  {item.description}
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>

      {hasMore && !showAll && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="group inline-flex items-center gap-2 rounded-lg border border-parchment-400/70 bg-transparent px-5 py-2.5 text-sm font-medium text-parchment-900 transition duration-200 hover:-translate-y-0.5 hover:border-parchment-700 hover:bg-parchment-100/70 hover:shadow-sm active:translate-y-0"
          >
            <span>Show More</span>
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
