'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Heart, Play, Search, Star, X } from 'lucide-react';
import type { CandidateRecord } from '@/app/candidates/candidateData';
import { CANDIDATE_SEED } from '@/app/candidates/candidateData';

const FAVORITES_KEY = 'trueassess_candidate_favorites';

function loadFavoriteIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function StarRow({ value }: { value: number }) {
  const full = Math.floor(value);
  const partial = value - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${value.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={`star-${i}`}
          size={14}
          className={
            i < full
              ? 'fill-amber-400 text-amber-400'
              : i === full && partial
                ? 'fill-amber-400/50 text-amber-400'
                : 'fill-transparent text-stone-300'
          }
        />
      ))}
      <span className="ml-1 font-sans text-xs font-semibold tabular-nums text-stone-700">{value.toFixed(1)}</span>
    </div>
  );
}

function CandidateCard({
  c,
  favorite,
  onToggleFavorite,
  onOpen,
}: {
  c: CandidateRecord;
  favorite: boolean;
  onToggleFavorite: () => void;
  onOpen: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-parchment-300/80 bg-parchment-150/95 shadow-[0_8px_28px_-12px_rgba(63,52,42,0.18)] transition hover:border-[#6b5344]/45 hover:shadow-[0_12px_36px_-14px_rgba(63,52,42,0.22)]">
      <div className="relative aspect-video w-full bg-stone-900">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          poster={c.recordingPosterUrl}
          muted
          playsInline
          preload="metadata"
          src={c.recordingUrl}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" aria-hidden />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`pointer-events-auto absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/35 backdrop-blur-sm transition hover:bg-black/50 ${
            favorite ? 'text-red-500' : 'text-white'
          }`}
          aria-pressed={favorite}
          aria-label={favorite ? 'Remove from saved' : 'Save candidate'}
        >
          <Heart size={18} className={favorite ? 'fill-current' : ''} />
        </button>
        {c.badge === 'Top Rated' && (
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-amber-500/95 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            Top Rated
          </span>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25"
          aria-label={`Open profile for ${c.fullName}`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-[#5c4033] shadow-lg opacity-95 ring-2 ring-white/80 transition group-hover:scale-105">
            <Play size={28} className="ml-1" fill="currentColor" />
          </span>
        </button>
        <p className="pointer-events-none absolute bottom-2 left-2 max-w-[85%] rounded bg-black/55 px-2 py-1 font-sans text-[10px] font-medium uppercase tracking-wide text-white/95 backdrop-blur-sm">
          Session recording · full attempt
        </p>
      </div>

      <button type="button" onClick={onOpen} className="flex flex-1 flex-col p-3 text-left font-serif">
        <div className="flex gap-2">
          <img
            src={c.avatarUrl}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-parchment-300/80"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-sm font-semibold text-ink">{c.fullName}</p>
            <p className="font-sans text-[11px] font-medium text-ink-soft">{c.badge}</p>
          </div>
        </div>
        <p className="mt-2 line-clamp-2 font-sans text-sm font-semibold leading-snug text-ink">{c.headline}</p>
        <p className="mt-1 font-mono text-[10px] font-medium uppercase tracking-wide text-stone-500">{c.displayId}</p>
        <div className="mt-2">
          <StarRow value={c.starRating} />
        </div>
        <p className="mt-2 line-clamp-2 font-sans text-xs leading-relaxed text-ink-muted">{c.selfIntroduction}</p>
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-parchment-300/60 pt-3">
          <span className="font-sans text-[11px] text-ink-soft">{c.experience.split('·')[0]?.trim()}</span>
          <span className="shrink-0 rounded-full bg-[#291c15]/[0.08] px-2.5 py-1 font-sans text-xs font-bold tabular-nums text-[#5c4033]">
            {c.score}/100
          </span>
        </div>
      </button>
    </article>
  );
}

function DetailModal({
  c,
  open,
  onClose,
}: {
  c: CandidateRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  const vidRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!open && vidRef.current) {
      vidRef.current.pause();
    }
  }, [open]);

  if (!open || !c) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-modal-title"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close overlay" onClick={onClose} />
      <div className="relative z-[101] max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-parchment-300 bg-parchment-50 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-parchment-300 bg-parchment-50/95 px-4 py-3 backdrop-blur-sm">
          <h2 id="candidate-modal-title" className="font-serif text-lg font-semibold italic text-ink">
            {c.fullName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 transition hover:bg-parchment-200 hover:text-ink"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 p-4">
          <div className="overflow-hidden rounded-xl border border-parchment-300 bg-black">
            <video
              ref={vidRef}
              className="aspect-video w-full"
              poster={c.recordingPosterUrl}
              controls
              playsInline
              preload="metadata"
              src={c.recordingUrl}
            />
          </div>
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-[#6b5344]">Full session recording</p>
          <dl className="grid gap-3 font-sans text-sm">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Credential / ID</dt>
              <dd className="mt-0.5 font-mono text-sm text-ink">{c.displayId}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Test details</dt>
              <dd className="mt-0.5 leading-relaxed text-ink-muted">{c.testDetails}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Passing format</dt>
              <dd className="mt-0.5 leading-relaxed text-ink-muted">{c.passingFormat}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Score</dt>
              <dd className="mt-0.5">
                <span className="font-semibold tabular-nums text-ink">{c.score}/100</span>
                <span className="mt-1 block">
                  <StarRow value={c.starRating} />
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Self-introduction</dt>
              <dd className="mt-0.5 leading-relaxed text-ink-muted">{c.selfIntroduction}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Experience</dt>
              <dd className="mt-0.5 leading-relaxed text-ink-muted">{c.experience}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Passed</dt>
              <dd className="mt-0.5 text-ink-muted">{c.passedAt}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default function CandidatesClient() {
  const [query, setQuery] = useState('');
  const [field, setField] = useState<string>('All');
  const [minScore, setMinScore] = useState(70);
  const [sort, setSort] = useState<'score' | 'recent'>('score');
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavoriteIds());
  const [modalCandidate, setModalCandidate] = useState<CandidateRecord | null>(null);

  useEffect(() => {
    setFavorites(loadFavoriteIds());
  }, []);

  const fields = useMemo(() => {
    const set = new Set(CANDIDATE_SEED.map((c) => c.field));
    return ['All', ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    let list = [...CANDIDATE_SEED];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.headline.toLowerCase().includes(q) ||
          c.displayId.toLowerCase().includes(q) ||
          c.selfIntroduction.toLowerCase().includes(q),
      );
    }
    if (field !== 'All') {
      list = list.filter((c) => c.field === field);
    }
    list = list.filter((c) => c.score >= minScore);
    if (sort === 'score') {
      list.sort((a, b) => b.score - a.score);
    } else {
      list.sort((a, b) => (a.passedAt < b.passedAt ? 1 : -1));
    }
    return list;
  }, [query, field, minScore, sort]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  }, []);

  const selectClass =
    'inline-flex items-center gap-1 rounded-full border border-parchment-400/80 bg-parchment-100/95 px-3 py-2 font-sans text-xs font-semibold text-ink shadow-sm outline-none ring-offset-2 focus:ring-2 focus:ring-[#8b7355]/40';

  return (
    <div className="space-y-6 font-serif text-ink">
      <header className="space-y-2">
        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-[#6b5344]">Verified talent</p>
        <h1 className="text-2xl font-semibold italic tracking-tight text-ink sm:text-3xl">Candidates who passed</h1>
        <p className="max-w-3xl font-sans text-sm leading-relaxed text-ink-muted">
          Browse professionals who completed the TrueAssess AI skill test. Each profile includes identity, assessment context, pass criteria,
          introduction, experience — and the{' '}
          <strong className="font-semibold text-ink">full session recording</strong> of their attempt (required for listing).
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-xl border border-parchment-300/90 bg-parchment-150/85 p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, credential ID, or keywords…"
            className="input-field w-full rounded-full border-parchment-400/90 bg-parchment-50 pl-10 font-sans text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className={`${selectClass} cursor-pointer`}>
            <span className="text-ink-soft">Field</span>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="cursor-pointer bg-transparent font-semibold text-ink outline-none"
            >
              {fields.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="text-stone-500" aria-hidden />
          </label>
          <label className={`${selectClass} cursor-pointer`}>
            <span className="text-ink-soft">Min score</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="cursor-pointer bg-transparent font-semibold text-ink outline-none"
            >
              {[60, 70, 75, 80, 85, 90].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="text-stone-500" aria-hidden />
          </label>
          <label className={`${selectClass} cursor-pointer`}>
            <span className="text-ink-soft">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'score' | 'recent')}
              className="cursor-pointer bg-transparent font-semibold text-ink outline-none"
            >
              <option value="score">Highest score</option>
              <option value="recent">Recently passed</option>
            </select>
            <ChevronDown size={14} className="text-stone-500" aria-hidden />
          </label>
        </div>
      </div>

      <p className="font-sans text-xs text-ink-soft">
        Showing <strong className="font-semibold text-ink">{filtered.length}</strong> of {CANDIDATE_SEED.length} profiles (demo data — connect your
        database and signed recording URLs when ready).
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-parchment-400 bg-parchment-100/80 px-6 py-16 text-center font-sans text-sm text-ink-muted">
          No candidates match these filters. Try lowering the minimum score or clearing search.
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((c) => (
            <li key={c.id}>
              <CandidateCard
                c={c}
                favorite={favorites.has(c.id)}
                onToggleFavorite={() => toggleFavorite(c.id)}
                onOpen={() => setModalCandidate(c)}
              />
            </li>
          ))}
        </ul>
      )}

      <DetailModal c={modalCandidate} open={modalCandidate !== null} onClose={() => setModalCandidate(null)} />
    </div>
  );
}
