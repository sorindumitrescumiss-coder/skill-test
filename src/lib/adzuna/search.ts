import { getAdzunaCountry, getAdzunaResultsPerPage, isAdzunaConfigured } from '@/lib/adzuna/config';
import type { AdzunaSearchResponse } from '@/lib/adzuna/types';
import { mapAdzunaJobToJob } from '@/lib/adzuna/mapToJob';
import type { Job } from '@/lib/jobs/types';

export type AdzunaSearchParams = {
  what?: string;
  where?: string;
  page?: number;
  sortBy?: 'newest' | 'salary-high' | 'relevance';
};

export type AdzunaSearchResult = {
  jobs: Job[];
  total: number;
  page: number;
  pages: number;
};

export async function searchAdzunaJobs(params: AdzunaSearchParams): Promise<AdzunaSearchResult> {
  if (!isAdzunaConfigured()) {
    return { jobs: [], total: 0, page: 1, pages: 0 };
  }

  const country = getAdzunaCountry();
  const page = Math.max(1, params.page ?? 1);
  const perPage = getAdzunaResultsPerPage();

  const query = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    results_per_page: String(perPage),
    'content-type': 'application/json',
  });

  const what = params.what?.trim();
  const where = params.where?.trim() || process.env.ADZUNA_DEFAULT_WHERE?.trim();
  if (what) query.set('what', what);
  if (where) query.set('where', where);

  if (params.sortBy === 'newest') {
    query.set('sort_by', 'date');
  } else if (params.sortBy === 'salary-high') {
    query.set('sort_by', 'salary');
    query.set('sort_direction', 'down');
  } else if (params.sortBy === 'relevance' || !params.sortBy) {
    query.set('sort_by', 'relevance');
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${query.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Adzuna API error (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = JSON.parse(text) as AdzunaSearchResponse;
  const total = data.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / perPage));

  return {
    jobs: (data.results ?? []).map((r) => mapAdzunaJobToJob(r, country)),
    total,
    page,
    pages,
  };
}
