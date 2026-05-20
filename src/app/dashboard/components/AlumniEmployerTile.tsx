'use client';

import React from 'react';

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

export function AlumniEmployerTile({ name, domain }: { name: string; domain: string }) {
  const [iconFailed, setIconFailed] = React.useState(false);
  const initials = React.useMemo(() => {
    const parts = name.replace(/[^a-zA-Z ]/g, '').split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  return (
    <div className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-parchment-300/55 bg-parchment-150/85 px-2 py-3 text-center shadow-[0_2px_8px_-4px_rgba(30,41,59,0.1)]">
      {!iconFailed ? (
        <img
          src={faviconUrl(domain)}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          loading="lazy"
          decoding="async"
          onError={() => setIconFailed(true)}
        />
      ) : (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-parchment-150/90 font-sans text-[11px] font-bold tabular-nums text-stone-600"
          aria-hidden
        >
          {initials}
        </div>
      )}
      <span className="max-w-full text-[10px] font-semibold leading-snug text-stone-700 sm:text-[11px]">{name}</span>
    </div>
  );
}
