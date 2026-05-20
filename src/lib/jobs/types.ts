export type JobSource = 'curated' | 'adzuna';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  companyLogoAlt: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: 'USD' | 'ETH';
  type: 'full-time' | 'part-time' | 'contract';
  skills: string[];
  nftRequired: boolean;
  requiredCertificate?: string;
  postedAt: string;
  applicants: number;
  featured: boolean;
  verified: boolean;
  description: string;
  responsibilities: string[];
  benefits: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead';
  status: 'active' | 'closed' | 'paused';
  source: JobSource;
  /** External apply URL (Adzuna redirect). */
  applyUrl?: string;
}

export type SortOption = 'newest' | 'salary-high' | 'salary-low' | 'most-applicants' | 'featured';

export interface Filters {
  search: string;
  locationType: string[];
  jobType: string[];
  experienceLevel: string[];
  salaryMin: number;
  salaryMax: number;
  nftRequired: boolean | null;
  skills: string[];
}

export const defaultFilters: Filters = {
  search: '',
  locationType: [],
  jobType: [],
  experienceLevel: [],
  salaryMin: 0,
  salaryMax: 400000,
  nftRequired: null,
  skills: [],
};
