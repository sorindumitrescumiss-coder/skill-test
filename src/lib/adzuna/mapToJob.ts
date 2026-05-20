import type { Job } from '@/lib/jobs/types';
import type { AdzunaJobResult } from '@/lib/adzuna/types';
import { formatPostedAt } from '@/lib/adzuna/formatPosted';

function companyAvatarUrl(company: string): string {
  const name = encodeURIComponent(company.slice(0, 2) || 'JO');
  return `https://ui-avatars.com/api/?name=${name}&background=4f46e5&color=fff&size=96&bold=true`;
}

function inferLocationType(text: string): Job['locationType'] {
  const lower = text.toLowerCase();
  if (/\bremote\b|\bwork from home\b|\bwfh\b/.test(lower)) return 'remote';
  if (/\bhybrid\b/.test(lower)) return 'hybrid';
  return 'onsite';
}

function mapContractType(contract?: string): Job['type'] {
  const c = (contract ?? '').toLowerCase();
  if (c.includes('part')) return 'part-time';
  if (c.includes('contract') || c.includes('temporary')) return 'contract';
  return 'full-time';
}

function excerptDescription(html: string, maxLen = 280): string {
  const plain = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).trim()}…`;
}

function splitDescriptionBullets(html: string, maxItems = 4): string[] {
  const plain = html.replace(/<[^>]+>/g, '\n').replace(/\s+/g, ' ').trim();
  const sentences = plain.split(/(?<=[.!?])\s+/).filter((s) => s.length > 24);
  return sentences.slice(0, maxItems);
}

export function mapAdzunaJobToJob(raw: AdzunaJobResult, country: string): Job {
  const company = raw.company?.display_name?.trim() || 'Employer';
  const location =
    raw.location?.display_name?.trim() ||
    raw.location?.area?.filter(Boolean).join(', ') ||
    country.toUpperCase();
  const descriptionText = excerptDescription(raw.description);
  const locationType = inferLocationType(`${raw.title} ${raw.description} ${location}`);
  const categoryLabel = raw.category?.label?.trim();
  const skills = categoryLabel ? [categoryLabel] : [];

  const salaryMin = typeof raw.salary_min === 'number' ? raw.salary_min : 0;
  const salaryMax =
    typeof raw.salary_max === 'number' && raw.salary_max > 0
      ? raw.salary_max
      : salaryMin > 0
        ? salaryMin
        : 0;

  return {
    id: `adzuna-${raw.id}`,
    title: raw.title?.trim() || 'Job opening',
    company,
    companyLogo: companyAvatarUrl(company),
    companyLogoAlt: `${company} logo`,
    location,
    locationType,
    salaryMin,
    salaryMax,
    salaryCurrency: 'USD',
    type: mapContractType(raw.contract_type),
    skills,
    nftRequired: false,
    postedAt: formatPostedAt(raw.created),
    applicants: 0,
    featured: false,
    verified: false,
    description: descriptionText,
    responsibilities: splitDescriptionBullets(raw.description),
    benefits: [],
    experienceLevel: 'mid',
    status: 'active',
    source: 'adzuna',
    applyUrl: raw.redirect_url,
  };
}
