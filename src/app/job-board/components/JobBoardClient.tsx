'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, Briefcase, TrendingUp, MapPin, X } from 'lucide-react';
import JobFilterSidebar from './JobFilterSidebar';
import JobCard from './JobCard';
import JobDetailModal from './JobDetailModal';
import JobBoardStats from './JobBoardStats';
import EmptyState from '@/components/ui/EmptyState';
import { JobCardSkeleton } from '@/components/ui/LoadingSkeleton';

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
}

export const jobsData: Job[] = [
{
  id: 'job-001',
  title: 'Senior Solidity Engineer',
  company: 'Polygon Labs',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1a4a998d9-1776934856390.png",
  companyLogoAlt: 'Purple hexagonal polygon logo on white background',
  location: 'Remote — Worldwide',
  locationType: 'remote',
  salaryMin: 180000,
  salaryMax: 240000,
  salaryCurrency: 'USD',
  type: 'full-time',
  skills: ['Solidity', 'EVM', 'Hardhat', 'TypeScript', 'DeFi'],
  nftRequired: true,
  requiredCertificate: 'Solidity Smart Contract Pro',
  postedAt: '2 days ago',
  applicants: 47,
  featured: true,
  verified: true,
  description: 'Join the core protocol team building the next generation of Polygon\'s zkEVM. You\'ll design and audit smart contracts powering billions in TVL.',
  responsibilities: [
  'Design and implement EVM-compatible smart contracts',
  'Conduct internal security audits and peer reviews',
  'Collaborate with research team on zkEVM optimizations',
  'Write comprehensive test suites using Hardhat and Foundry'],

  benefits: ['Equity + tokens', 'Remote-first', '$5K learning budget', 'Health coverage'],
  experienceLevel: 'senior',
  status: 'active'
},
{
  id: 'job-002',
  title: 'React Frontend Engineer',
  company: 'Coinbase',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_14dccda97-1764857540304.png",
  companyLogoAlt: 'Blue circular Coinbase logo on white background',
  location: 'San Francisco, CA',
  locationType: 'hybrid',
  salaryMin: 160000,
  salaryMax: 210000,
  salaryCurrency: 'USD',
  type: 'full-time',
  skills: ['React', 'TypeScript', 'Web3.js', 'Tailwind CSS', 'Next.js'],
  nftRequired: true,
  requiredCertificate: 'React Advanced Mastery',
  postedAt: '1 day ago',
  applicants: 124,
  featured: true,
  verified: true,
  description: 'Build consumer-facing crypto products used by 100M+ users globally. You\'ll own the frontend of key trading and wallet features.',
  responsibilities: [
  'Build responsive, accessible UI components in React/Next.js',
  'Integrate Web3 wallet connections and on-chain data',
  'Collaborate with design system team on component library',
  'Optimize performance for Core Web Vitals'],

  benefits: ['COIN equity', 'Hybrid flex', '$10K crypto bonus', 'Unlimited PTO'],
  experienceLevel: 'senior',
  status: 'active'
},
{
  id: 'job-003',
  title: 'DevOps & Infrastructure Lead',
  company: 'Alchemy',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1510e0a12-1776934853324.png",
  companyLogoAlt: 'Dark blue Alchemy flask logo on white background',
  location: 'New York, NY',
  locationType: 'hybrid',
  salaryMin: 150000,
  salaryMax: 190000,
  salaryCurrency: 'USD',
  type: 'full-time',
  skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD'],
  nftRequired: true,
  requiredCertificate: 'DevOps & Cloud Architect',
  postedAt: '3 days ago',
  applicants: 38,
  featured: false,
  verified: true,
  description: 'Lead infrastructure for the most used blockchain developer platform. Manage multi-region Kubernetes clusters serving 10B+ API requests/month.',
  responsibilities: [
  'Own cloud infrastructure across AWS, GCP regions',
  'Design and maintain Kubernetes orchestration layer',
  'Implement GitOps workflows and observability stack',
  'Lead on-call rotation for production incidents'],

  benefits: ['Series D equity', 'Remote flex', '$4K hardware budget', 'Conference budget'],
  experienceLevel: 'lead',
  status: 'active'
},
{
  id: 'job-004',
  title: 'Machine Learning Engineer',
  company: 'Hugging Face',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_10ef82d8e-1776934854729.png",
  companyLogoAlt: 'Yellow smiling face emoji style Hugging Face logo',
  location: 'Remote — US/EU',
  locationType: 'remote',
  salaryMin: 170000,
  salaryMax: 230000,
  salaryCurrency: 'USD',
  type: 'full-time',
  skills: ['Python', 'PyTorch', 'Transformers', 'CUDA', 'MLOps'],
  nftRequired: true,
  requiredCertificate: 'Machine Learning Foundations',
  postedAt: '5 hours ago',
  applicants: 91,
  featured: true,
  verified: true,
  description: 'Work on open-source AI models and infrastructure powering the democratization of machine learning. You\'ll train, fine-tune, and deploy frontier models.',
  responsibilities: [
  'Train and fine-tune large language models',
  'Build efficient inference pipelines for production',
  'Contribute to open-source Transformers library',
  'Research and implement PEFT techniques'],

  benefits: ['Equity', 'Remote-first', 'GPU cloud credits', '$6K learning'],
  experienceLevel: 'senior',
  status: 'active'
},
{
  id: 'job-005',
  title: 'Web3 Security Researcher',
  company: 'Trail of Bits',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_14c96fcf8-1776934855430.png",
  companyLogoAlt: 'Dark shield with magnifying glass representing security research firm',
  location: 'Remote — Worldwide',
  locationType: 'remote',
  salaryMin: 190000,
  salaryMax: 280000,
  salaryCurrency: 'USD',
  type: 'full-time',
  skills: ['Smart Contract Auditing', 'Fuzzing', 'Formal Verification', 'Solidity', 'Rust'],
  nftRequired: true,
  requiredCertificate: 'Web3 Security Auditor',
  postedAt: '1 week ago',
  applicants: 22,
  featured: false,
  verified: true,
  description: 'Audit smart contracts for the largest DeFi protocols. Find critical vulnerabilities before attackers do — your work protects billions in user funds.',
  responsibilities: [
  'Perform smart contract security audits',
  'Develop custom fuzzing and formal verification tools',
  'Write detailed audit reports for protocol teams',
  'Present findings at security conferences'],

  benefits: ['Top market comp', 'Remote', 'Bug bounty bonuses', 'Conference speaking'],
  experienceLevel: 'senior',
  status: 'active'
},
{
  id: 'job-006',
  title: 'TypeScript Full-Stack Developer',
  company: 'Vercel',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1cc175c33-1764807041079.png",
  companyLogoAlt: 'Black triangle Vercel logo on white background representing deployment platform',
  location: 'Remote — US',
  locationType: 'remote',
  salaryMin: 145000,
  salaryMax: 185000,
  salaryCurrency: 'USD',
  type: 'full-time',
  skills: ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Redis'],
  nftRequired: true,
  requiredCertificate: 'TypeScript Expert Badge',
  postedAt: '4 days ago',
  applicants: 203,
  featured: false,
  verified: true,
  description: 'Build the platform that powers the modern web. Work on Next.js infrastructure, edge functions, and developer experience tools used by millions.',
  responsibilities: [
  'Build and maintain Next.js framework features',
  'Design APIs for Vercel\'s edge network',
  'Improve developer tooling and CLI',
  'Collaborate on OSS contributions'],

  benefits: ['Equity', 'Remote', 'Top-tier healthcare', 'Unlimited PTO'],
  experienceLevel: 'mid',
  status: 'active'
},
{
  id: 'job-007',
  title: 'DeFi Protocol Engineer',
  company: 'Uniswap Labs',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1bfbd0fe4-1776012626162.png",
  companyLogoAlt: 'Pink unicorn Uniswap logo representing DeFi exchange protocol',
  location: 'New York, NY',
  locationType: 'hybrid',
  salaryMin: 200000,
  salaryMax: 300000,
  salaryCurrency: 'USD',
  type: 'full-time',
  skills: ['Solidity', 'DeFi', 'AMM Design', 'TypeScript', 'Graph Protocol'],
  nftRequired: true,
  requiredCertificate: 'DeFi Protocol Architect',
  postedAt: '6 hours ago',
  applicants: 67,
  featured: true,
  verified: true,
  description: 'Shape the future of decentralized finance. Work on Uniswap v4 hooks, liquidity pool mechanics, and cross-chain swap infrastructure.',
  responsibilities: [
  'Design AMM pool mechanics and fee structures',
  'Implement and audit v4 hook contracts',
  'Optimize gas costs for swap execution',
  'Contribute to Uniswap governance proposals'],

  benefits: ['UNI tokens', 'Hybrid flex', '$15K signing bonus', 'Top-tier benefits'],
  experienceLevel: 'senior',
  status: 'active'
},
{
  id: 'job-008',
  title: 'GraphQL API Engineer',
  company: 'The Graph',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_125211de6-1776934853299.png",
  companyLogoAlt: 'Purple star shaped The Graph protocol logo on white background',
  location: 'Remote — Worldwide',
  locationType: 'remote',
  salaryMin: 120000,
  salaryMax: 160000,
  salaryCurrency: 'USD',
  type: 'full-time',
  skills: ['GraphQL', 'TypeScript', 'Rust', 'IPFS', 'Subgraph'],
  nftRequired: true,
  requiredCertificate: 'GraphQL API Design',
  postedAt: '2 weeks ago',
  applicants: 44,
  featured: false,
  verified: true,
  description: 'Build the indexing protocol for Web3 data. Design and maintain subgraph infrastructure that powers hundreds of dApps querying on-chain data.',
  responsibilities: [
  'Develop and maintain Graph Node indexing engine',
  'Design subgraph schema standards',
  'Optimize query performance at scale',
  'Support developer community with subgraph issues'],

  benefits: ['GRT tokens', 'Remote', '$3K equipment', 'Flexible hours'],
  experienceLevel: 'mid',
  status: 'active'
},
{
  id: 'job-009',
  title: 'Kubernetes Platform Engineer',
  company: 'Cloudflare',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1852bf832-1770051940777.png",
  companyLogoAlt: 'Orange cloud Cloudflare logo on white background',
  location: 'Austin, TX',
  locationType: 'onsite',
  salaryMin: 155000,
  salaryMax: 200000,
  salaryCurrency: 'USD',
  type: 'full-time',
  skills: ['Kubernetes', 'Go', 'Rust', 'eBPF', 'Networking'],
  nftRequired: true,
  requiredCertificate: 'Kubernetes & Container Ops',
  postedAt: '3 days ago',
  applicants: 56,
  featured: false,
  verified: true,
  description: 'Build the platform infrastructure powering Cloudflare Workers — the world\'s largest serverless network. Work on container orchestration at global scale.',
  responsibilities: [
  'Design Kubernetes cluster automation tooling',
  'Implement eBPF-based network observability',
  'Build self-healing infrastructure systems',
  'Collaborate with security team on runtime isolation'],

  benefits: ['RSUs', 'Onsite perks', '$5K tech budget', 'Parental leave'],
  experienceLevel: 'senior',
  status: 'active'
},
{
  id: 'job-010',
  title: 'Junior Frontend Developer',
  company: 'Mirror.xyz',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1f5dd6ae8-1776934855785.png",
  companyLogoAlt: 'Minimalist black M letter logo for Mirror publishing platform',
  location: 'Remote — US/EU',
  locationType: 'remote',
  salaryMin: 85000,
  salaryMax: 110000,
  salaryCurrency: 'USD',
  type: 'full-time',
  skills: ['React', 'TypeScript', 'Tailwind CSS', 'Ethers.js'],
  nftRequired: false,
  postedAt: '1 day ago',
  applicants: 312,
  featured: false,
  verified: true,
  description: 'Join the team building the future of Web3 publishing. Help creators monetize their writing through NFTs and on-chain subscriptions.',
  responsibilities: [
  'Build and maintain React components for the editor',
  'Implement wallet-gated content features',
  'Collaborate with design on new publishing flows',
  'Write unit and integration tests'],

  benefits: ['Token options', 'Remote', 'Learning stipend', 'Flexible hours'],
  experienceLevel: 'junior',
  status: 'active'
},
{
  id: 'job-011',
  title: 'Smart Contract Auditor',
  company: 'OpenZeppelin',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1680e3499-1776934853583.png",
  companyLogoAlt: 'Dark hexagonal OpenZeppelin security logo on dark background',
  location: 'Remote — Worldwide',
  locationType: 'remote',
  salaryMin: 160000,
  salaryMax: 220000,
  salaryCurrency: 'USD',
  type: 'contract',
  skills: ['Solidity', 'Security Auditing', 'Foundry', 'Slither', 'Echidna'],
  nftRequired: true,
  requiredCertificate: 'Web3 Security Auditor',
  postedAt: '5 days ago',
  applicants: 19,
  featured: false,
  verified: true,
  description: 'Audit critical DeFi protocols as part of the world\'s most trusted smart contract security team. Contract role with potential to convert full-time.',
  responsibilities: [
  'Audit ERC-20, ERC-721, and complex DeFi contracts',
  'Use automated tools: Slither, Echidna, Mythril',
  'Write detailed audit reports with PoC exploits',
  'Review remediation commits from protocol teams'],

  benefits: ['High contract rate', 'Flexible hours', 'Remote', 'High-profile clients'],
  experienceLevel: 'senior',
  status: 'active'
},
{
  id: 'job-012',
  title: 'Product Designer — Web3',
  company: 'Rainbow Wallet',
  companyLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_18e35d8c2-1776934854661.png",
  companyLogoAlt: 'Colorful rainbow arc logo for Rainbow cryptocurrency wallet app',
  location: 'Remote — US',
  locationType: 'remote',
  salaryMin: 130000,
  salaryMax: 170000,
  salaryCurrency: 'USD',
  type: 'full-time',
  skills: ['Figma', 'Design Systems', 'UX Research', 'Prototyping', 'Web3 UX'],
  nftRequired: false,
  postedAt: '1 week ago',
  applicants: 178,
  featured: false,
  verified: true,
  description: 'Design the most delightful crypto wallet experience in the world. Own end-to-end design for new features across iOS, Android, and web.',
  responsibilities: [
  'Design intuitive flows for complex DeFi interactions',
  'Maintain and evolve Rainbow\'s design system',
  'Conduct user research with crypto-native users',
  'Collaborate with engineers on motion and micro-interactions'],

  benefits: ['Tokens', 'Remote', 'Top healthcare', '$4K design tools'],
  experienceLevel: 'mid',
  status: 'active'
}];


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

const defaultFilters: Filters = {
  search: '',
  locationType: [],
  jobType: [],
  experienceLevel: [],
  salaryMin: 0,
  salaryMax: 400000,
  nftRequired: null,
  skills: []
};

export default function JobBoardClient() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading] = useState(false);

  const filtered = jobsData.filter((job) => {
    if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
    !job.company.toLowerCase().includes(filters.search.toLowerCase()) &&
    !job.skills.some((s) => s.toLowerCase().includes(filters.search.toLowerCase()))) {
      return false;
    }
    if (filters.locationType.length > 0 && !filters.locationType.includes(job.locationType)) return false;
    if (filters.jobType.length > 0 && !filters.jobType.includes(job.type)) return false;
    if (filters.experienceLevel.length > 0 && !filters.experienceLevel.includes(job.experienceLevel)) return false;
    if (job.salaryMin < filters.salaryMin || job.salaryMax > filters.salaryMax) return false;
    if (filters.nftRequired === true && !job.nftRequired) return false;
    if (filters.nftRequired === false && job.nftRequired) return false;
    if (filters.skills.length > 0 && !filters.skills.some((s) => job.skills.includes(s))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'salary-high') return b.salaryMax - a.salaryMax;
    if (sortBy === 'salary-low') return a.salaryMin - b.salaryMin;
    if (sortBy === 'most-applicants') return b.applicants - a.applicants;
    if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    return 0;
  });

  const featuredJobs = sorted.filter((j) => j.featured);
  const regularJobs = sorted.filter((j) => !j.featured);

  const activeFilterCount = [
  filters.locationType.length > 0,
  filters.jobType.length > 0,
  filters.experienceLevel.length > 0,
  filters.salaryMin > 0 || filters.salaryMax < 400000,
  filters.nftRequired !== null,
  filters.skills.length > 0].
  filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Job Board</h1>
          <p className="text-sm text-slate-500 mt-1">
            {sorted.length} verified positions · NFT credentials unlock top-tier roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-lg text-xs font-medium text-violet-700">
            <TrendingUp size={13} />
            14 new today
          </span>
          <button className="btn-primary">
            <Briefcase size={14} />
            Post a Job
          </button>
        </div>
      </div>

      {/* Stats */}
      <JobBoardStats />

      {/* Search & Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary gap-2 ${showFilters ? 'bg-violet-50 border-violet-200 text-violet-700' : ''}`}>

          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 &&
          <span className="w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          }
        </button>

        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs, companies, or skills..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="input-field pl-9 text-sm" />

          {filters.search &&
          <button
            onClick={() => setFilters((f) => ({ ...f, search: '' }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">

              <X size={14} />
            </button>
          }
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-400">Sort:</span>
          <div className="flex gap-1">
            {([
            { value: 'newest', label: 'Newest' },
            { value: 'salary-high', label: 'Salary ↑' },
            { value: 'featured', label: 'Featured' }] as
            {value: SortOption;label: string;}[]).map((s) =>
            <button
              key={`sort-${s.value}`}
              onClick={() => setSortBy(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sortBy === s.value ?
              'bg-violet-600 text-white' :
              'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`
              }>

                {s.label}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Chips */}
      {activeFilterCount > 0 &&
      <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          <span className="text-xs text-slate-500">Active filters:</span>
          {filters.locationType.map((lt) =>
        <button
          key={`chip-loc-${lt}`}
          onClick={() => setFilters((f) => ({ ...f, locationType: f.locationType.filter((x) => x !== lt) }))}
          className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full hover:bg-violet-200 transition-colors">

              <MapPin size={10} />
              {lt}
              <X size={10} />
            </button>
        )}
          {filters.nftRequired === true &&
        <button
          onClick={() => setFilters((f) => ({ ...f, nftRequired: null }))}
          className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full hover:bg-amber-200 transition-colors">

              NFT Required
              <X size={10} />
            </button>
        }
          <button
          onClick={() => setFilters(defaultFilters)}
          className="text-xs text-slate-400 hover:text-slate-600 underline">

            Clear all
          </button>
        </div>
      }

      {/* Content */}
      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {showFilters &&
        <div className="w-60 shrink-0 animate-fade-in">
            <JobFilterSidebar filters={filters} onChange={setFilters} />
          </div>
        }

        {/* Job List */}
        <div className="flex-1 min-w-0 space-y-6">
          {loading ?
          <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) =>
            <JobCardSkeleton key={`skel-job-${i + 1}`} />
            )}
            </div> :
          sorted.length === 0 ?
          <EmptyState
            icon={<Briefcase size={28} />}
            title="No jobs match your filters"
            description="Try adjusting your location, salary range, or skill requirements to find available positions."
            action={{ label: 'Clear All Filters', onClick: () => setFilters(defaultFilters) }} /> :


          <>
              {/* Featured Jobs */}
              {featuredJobs.length > 0 &&
            <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Featured</span>
                    <div className="flex-1 h-px bg-amber-100" />
                  </div>
                  <div className="space-y-3">
                    {featuredJobs.map((job) =>
                <JobCard key={job.id} job={job} featured onClick={() => setSelectedJob(job)} />
                )}
                  </div>
                </div>
            }

              {/* Regular Jobs */}
              {regularJobs.length > 0 &&
            <div>
                  {featuredJobs.length > 0 &&
              <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">All Jobs</span>
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs text-slate-400 font-mono">{regularJobs.length} listings</span>
                    </div>
              }
                  <div className="space-y-3">
                    {regularJobs.map((job) =>
                <JobCard key={job.id} job={job} featured={false} onClick={() => setSelectedJob(job)} />
                )}
                  </div>
                </div>
            }

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-medium text-slate-900">{sorted.length}</span> of{' '}
                  <span className="font-medium text-slate-900">{jobsData.length}</span> jobs
                </p>
                <div className="flex items-center gap-1">
                  {['1', '2', '3', '...', '8'].map((p) =>
                <button
                  key={`page-${p}`}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === '1' ? 'bg-violet-600 text-white' :
                  p === '...' ? 'text-slate-400 cursor-default' : 'text-slate-600 hover:bg-slate-100'}`
                  }>

                      {p}
                    </button>
                )}
                </div>
              </div>
            </>
          }
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob &&
      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      }
    </div>);

}