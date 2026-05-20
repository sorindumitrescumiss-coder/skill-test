'use client';

import React from 'react';
import type { Filters } from '@/lib/jobs/types';

const locationTypes = [
  { value: 'remote', label: 'Remote', count: 847 },
  { value: 'hybrid', label: 'Hybrid', count: 289 },
  { value: 'onsite', label: 'On-site', count: 111 },
];

const jobTypes = [
  { value: 'full-time', label: 'Full-time', count: 1024 },
  { value: 'part-time', label: 'Part-time', count: 87 },
  { value: 'contract', label: 'Contract', count: 136 },
];

const experienceLevels = [
  { value: 'junior', label: 'Junior (0–2 yrs)', count: 198 },
  { value: 'mid', label: 'Mid (2–5 yrs)', count: 412 },
  { value: 'senior', label: 'Senior (5+ yrs)', count: 487 },
  { value: 'lead', label: 'Lead / Principal', count: 150 },
];

const popularSkills = [
  'Solidity', 'React', 'TypeScript', 'Python', 'Rust',
  'Kubernetes', 'Go', 'GraphQL', 'Node.js', 'DeFi',
];

interface JobFilterSidebarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export default function JobFilterSidebar({ filters, onChange }: JobFilterSidebarProps) {
  const toggleArray = (key: keyof Filters, val: string) => {
    const arr = filters[key] as string[];
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    onChange({ ...filters, [key]: next });
  };

  return (
    <div className="space-y-6 bg-white rounded-xl border border-slate-200 p-5">
      {/* NFT Credential Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Credential Filter</h4>
        <div className="space-y-2">
          {[
            { value: null, label: 'All jobs' },
            { value: true, label: 'NFT credential required' },
            { value: false, label: 'No NFT required' },
          ].map((opt) => (
            <label
              key={`nft-filter-${String(opt.value)}`}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="nft-filter"
                checked={filters.nftRequired === opt.value}
                onChange={() => onChange({ ...filters, nftRequired: opt.value })}
                className="w-4 h-4 border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                {opt.label}
              </span>
              {opt.value === true && (
                <span className="ml-auto text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                  NFT
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Location Type */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Location Type</h4>
        <div className="space-y-2">
          {locationTypes.map((lt) => (
            <label key={`lt-${lt.value}`} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.locationType.includes(lt.value)}
                onChange={() => toggleArray('locationType', lt.value)}
                className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 flex-1">{lt.label}</span>
              <span className="text-[11px] text-slate-400 font-mono">{lt.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Job Type */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Job Type</h4>
        <div className="space-y-2">
          {jobTypes.map((jt) => (
            <label key={`jt-${jt.value}`} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.jobType.includes(jt.value)}
                onChange={() => toggleArray('jobType', jt.value)}
                className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 flex-1">{jt.label}</span>
              <span className="text-[11px] text-slate-400 font-mono">{jt.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Experience Level */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Experience Level</h4>
        <div className="space-y-2">
          {experienceLevels.map((el) => (
            <label key={`el-${el.value}`} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.experienceLevel.includes(el.value)}
                onChange={() => toggleArray('experienceLevel', el.value)}
                className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 flex-1">{el.label}</span>
              <span className="text-[11px] text-slate-400 font-mono">{el.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Salary Range */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Salary Range (USD)</h4>
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={filters.salaryMin || ''}
              onChange={(e) => onChange({ ...filters, salaryMin: parseInt(e.target.value) || 0 })}
              className="input-field text-sm w-full"
            />
            <span className="text-slate-300 shrink-0">—</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.salaryMax === 400000 ? '' : filters.salaryMax}
              onChange={(e) => onChange({ ...filters, salaryMax: parseInt(e.target.value) || 400000 })}
              className="input-field text-sm w-full"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '<$100K', min: 0, max: 100000 },
              { label: '$100–150K', min: 100000, max: 150000 },
              { label: '$150–200K', min: 150000, max: 200000 },
              { label: '$200K+', min: 200000, max: 400000 },
            ].map((r) => (
              <button
                key={`sal-${r.label}`}
                onClick={() => onChange({ ...filters, salaryMin: r.min, salaryMax: r.max })}
                className={`text-[11px] px-2 py-1 rounded-lg font-medium transition-colors ${
                  filters.salaryMin === r.min && filters.salaryMax === r.max
                    ? 'bg-violet-100 text-violet-700 border border-violet-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Skills */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Skills</h4>
        <div className="flex flex-wrap gap-1.5">
          {popularSkills.map((skill) => (
            <button
              key={`skill-chip-${skill}`}
              onClick={() => toggleArray('skills', skill)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-150 ${
                filters.skills.includes(skill)
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}