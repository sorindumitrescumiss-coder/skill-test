import { NextRequest, NextResponse } from 'next/server';
import { searchAdzunaJobs } from '@/lib/adzuna/search';
import { isAdzunaConfigured } from '@/lib/adzuna/config';
import { curatedJobs } from '@/lib/jobs/curatedJobs';
import type { Job, SortOption } from '@/lib/jobs/types';

function applyClientFilters(jobs: Job[], searchParams: URLSearchParams): Job[] {
  const search = (searchParams.get('search') ?? '').trim().toLowerCase();
  const locationTypes = searchParams.getAll('locationType');
  const jobTypes = searchParams.getAll('jobType');
  const experienceLevels = searchParams.getAll('experienceLevel');
  const salaryMin = Number.parseInt(searchParams.get('salaryMin') ?? '0', 10) || 0;
  const salaryMax = Number.parseInt(searchParams.get('salaryMax') ?? '400000', 10) || 400000;
  const nftRequired = searchParams.get('nftRequired');
  const skills = searchParams.getAll('skills');

  return jobs.filter((job) => {
    if (
      search &&
      !job.title.toLowerCase().includes(search) &&
      !job.company.toLowerCase().includes(search) &&
      !job.skills.some((s) => s.toLowerCase().includes(search))
    ) {
      return false;
    }
    if (locationTypes.length > 0 && !locationTypes.includes(job.locationType)) return false;
    if (jobTypes.length > 0 && !jobTypes.includes(job.type)) return false;
    if (experienceLevels.length > 0 && !experienceLevels.includes(job.experienceLevel)) return false;
    if (job.salaryMax > 0 && (job.salaryMin < salaryMin || job.salaryMax > salaryMax)) return false;
    if (nftRequired === 'true' && !job.nftRequired) return false;
    if (nftRequired === 'false' && job.nftRequired) return false;
    if (skills.length > 0 && !skills.some((s) => job.skills.includes(s))) return false;
    return true;
  });
}

function sortJobs(jobs: Job[], sortBy: SortOption): Job[] {
  const copy = [...jobs];
  if (sortBy === 'salary-high') {
    return copy.sort((a, b) => b.salaryMax - a.salaryMax);
  }
  if (sortBy === 'salary-low') {
    return copy.sort((a, b) => {
      const aMin = a.salaryMin || a.salaryMax;
      const bMin = b.salaryMin || b.salaryMax;
      return aMin - bMin;
    });
  }
  if (sortBy === 'most-applicants') {
    return copy.sort((a, b) => b.applicants - a.applicants);
  }
  if (sortBy === 'featured') {
    return copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
  return copy;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const sortBy = (searchParams.get('sortBy') ?? 'newest') as SortOption;
  const what = searchParams.get('what') ?? searchParams.get('search') ?? '';
  const where = searchParams.get('where') ?? '';
  const includeCurated = searchParams.get('includeCurated') !== 'false';

  if (!isAdzunaConfigured()) {
    const filtered = sortJobs(applyClientFilters(curatedJobs, searchParams), sortBy);
    return NextResponse.json({
      configured: false,
      jobs: filtered,
      total: filtered.length,
      page: 1,
      pages: 1,
      source: 'curated',
    });
  }

  try {
    const adzuna = await searchAdzunaJobs({
      what: what || undefined,
      where: where || undefined,
      page,
      sortBy: sortBy === 'salary-high' ? 'salary-high' : sortBy === 'newest' ? 'newest' : 'relevance',
    });

    let jobs = applyClientFilters(adzuna.jobs, searchParams);

    if (includeCurated && page === 1 && !where) {
      const curatedFiltered = applyClientFilters(
        curatedJobs.map((j) => ({ ...j, source: 'curated' as const })),
        searchParams,
      );
      const adzunaIds = new Set(jobs.map((j) => j.id));
      const merged = [
        ...sortJobs(curatedFiltered, sortBy).filter((j) => !adzunaIds.has(j.id)),
        ...jobs,
      ];
      jobs = sortBy === 'featured' ? sortJobs(merged, sortBy) : merged;
    }

    return NextResponse.json({
      configured: true,
      jobs,
      total: adzuna.total + (includeCurated && page === 1 ? 0 : 0),
      page: adzuna.page,
      pages: adzuna.pages,
      source: 'adzuna',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Adzuna search failed';
    const filtered = sortJobs(applyClientFilters(curatedJobs, searchParams), sortBy);
    return NextResponse.json({
      configured: true,
      jobs: filtered,
      total: filtered.length,
      page: 1,
      pages: 1,
      source: 'curated',
      error: message,
    });
  }
}
