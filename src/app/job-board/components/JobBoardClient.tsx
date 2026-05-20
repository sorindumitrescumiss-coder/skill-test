'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Briefcase, TrendingUp, MapPin, X, AlertCircle } from 'lucide-react';
import JobFilterSidebar from './JobFilterSidebar';
import JobCard from './JobCard';
import JobDetailModal from './JobDetailModal';
import JobBoardStats from './JobBoardStats';
import EmptyState from '@/components/ui/EmptyState';
import { JobCardSkeleton } from '@/components/ui/LoadingSkeleton';
import type { Filters, Job, SortOption } from '@/lib/jobs/types';
import { defaultFilters } from '@/lib/jobs/types';

export type { Job, Filters, SortOption };
export { defaultFilters };

function buildJobsQuery(
  filters: Filters,
  sortBy: SortOption,
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('search', filters.search.trim());
  filters.locationType.forEach((v) => params.append('locationType', v));
  filters.jobType.forEach((v) => params.append('jobType', v));
  filters.experienceLevel.forEach((v) => params.append('experienceLevel', v));
  params.set('salaryMin', String(filters.salaryMin));
  params.set('salaryMax', String(filters.salaryMax));
  if (filters.nftRequired !== null) params.set('nftRequired', String(filters.nftRequired));
  filters.skills.forEach((v) => params.append('skills', v));
  params.set('sortBy', sortBy);
  params.set('page', String(page));
  return params.toString();
}

export default function JobBoardClient() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [adzunaLive, setAdzunaLive] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const qs = buildJobsQuery(filters, sortBy, page);
      const res = await fetch(`/api/jobs?${qs}`);
      const data = (await res.json()) as {
        jobs?: Job[];
        total?: number;
        pages?: number;
        configured?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? 'Could not load jobs');
      }
      setJobs(data.jobs ?? []);
      setTotalCount(data.total ?? data.jobs?.length ?? 0);
      setTotalPages(data.pages ?? 1);
      setAdzunaLive(Boolean(data.configured));
      if (data.error) setFetchError(data.error);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Could not load jobs');
      setJobs([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadJobs();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [loadJobs]);

  useEffect(() => {
    setPage(1);
  }, [filters, sortBy]);

  const sorted = useMemo(() => {
    const copy = [...jobs];
    if (sortBy === 'salary-high') return copy.sort((a, b) => b.salaryMax - a.salaryMax);
    if (sortBy === 'salary-low') {
      return copy.sort((a, b) => (a.salaryMin || a.salaryMax) - (b.salaryMin || b.salaryMax));
    }
    if (sortBy === 'most-applicants') return copy.sort((a, b) => b.applicants - a.applicants);
    if (sortBy === 'featured') return copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return copy;
  }, [jobs, sortBy]);

  const featuredJobs = sorted.filter((j) => j.featured);
  const regularJobs = sorted.filter((j) => !j.featured);

  const activeFilterCount = [
    filters.locationType.length > 0,
    filters.jobType.length > 0,
    filters.experienceLevel.length > 0,
    filters.salaryMin > 0 || filters.salaryMax < 400000,
    filters.nftRequired !== null,
    filters.skills.length > 0,
  ].filter(Boolean).length;

  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    const max = totalPages;
    if (max <= 7) {
      for (let i = 1; i <= max; i += 1) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 3) pages.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(max - 1, page + 1); i += 1) {
      pages.push(i);
    }
    if (page < max - 2) pages.push('ellipsis');
    pages.push(max);
    return pages;
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Job Board</h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? 'Loading…' : (
              <>
                {sorted.length} positions shown
                {adzunaLive ? ' · Live listings via Adzuna' : ' · Curated + sample listings'}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {adzunaLive && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
              <TrendingUp size={13} />
              Adzuna live
            </span>
          )}
          <button type="button" className="btn-primary">
            <Briefcase size={14} />
            Post a Job
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p>
            Live job search is temporarily unavailable ({fetchError}). Showing curated listings when possible.
          </p>
        </div>
      )}

      <JobBoardStats />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary gap-2 ${showFilters ? 'bg-violet-50 border-violet-200 text-violet-700' : ''}`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs, companies, or skills..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="input-field pl-9 text-sm"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-400">Sort:</span>
          <div className="flex gap-1">
            {(
              [
                { value: 'newest', label: 'Newest' },
                { value: 'salary-high', label: 'Salary ↑' },
                { value: 'featured', label: 'Featured' },
              ] as { value: SortOption; label: string }[]
            ).map((s) => (
              <button
                key={`sort-${s.value}`}
                type="button"
                onClick={() => setSortBy(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === s.value
                    ? 'bg-violet-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          <span className="text-xs text-slate-500">Active filters:</span>
          {filters.locationType.map((lt) => (
            <button
              key={`chip-loc-${lt}`}
              type="button"
              onClick={() =>
                setFilters((f) => ({ ...f, locationType: f.locationType.filter((x) => x !== lt) }))
              }
              className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full hover:bg-violet-200 transition-colors"
            >
              <MapPin size={10} />
              {lt}
              <X size={10} />
            </button>
          ))}
          {filters.nftRequired === true && (
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, nftRequired: null }))}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full hover:bg-amber-200 transition-colors"
            >
              NFT Required
              <X size={10} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setFilters(defaultFilters)}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {showFilters && (
          <div className="w-60 shrink-0 animate-fade-in">
            <JobFilterSidebar filters={filters} onChange={setFilters} />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={`skel-job-${i + 1}`} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={28} />}
              title="No jobs match your filters"
              description="Try a broader search term, clear filters, or check your Adzuna API keys in .env."
              action={{ label: 'Clear All Filters', onClick: () => setFilters(defaultFilters) }}
            />
          ) : (
            <>
              {featuredJobs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
                      Featured · TrueAssess verified
                    </span>
                    <div className="flex-1 h-px bg-amber-100" />
                  </div>
                  <div className="space-y-3">
                    {featuredJobs.map((job) => (
                      <JobCard key={job.id} job={job} featured onClick={() => setSelectedJob(job)} />
                    ))}
                  </div>
                </div>
              )}

              {regularJobs.length > 0 && (
                <div>
                  {featuredJobs.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        {adzunaLive ? 'Live listings' : 'All jobs'}
                      </span>
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs text-slate-400 font-mono">{regularJobs.length} on this page</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    {regularJobs.map((job) => (
                      <JobCard key={job.id} job={job} featured={false} onClick={() => setSelectedJob(job)} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Page <span className="font-medium text-slate-900">{page}</span> of{' '}
                  <span className="font-medium text-slate-900">{totalPages}</span>
                  {totalCount > 0 && (
                    <>
                      {' '}
                      · <span className="font-medium text-slate-900">{totalCount.toLocaleString()}</span> total
                    </>
                  )}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {pageNumbers.map((p, idx) =>
                    p === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        type="button"
                        disabled={loading}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          p === page ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-1 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}
