'use client';

import React from 'react';
import { MapPin, Clock, Users, Award, Shield, Star } from 'lucide-react';
import type { Job } from '@/lib/jobs/types';
import StatusBadge from '@/components/ui/StatusBadge';
import AppImage from '@/components/ui/AppImage';

interface JobCardProps {
  job: Job;
  featured: boolean;
  onClick: () => void;
}

const locationTypeVariant: Record<string, 'remote' | 'hybrid' | 'onsite'> = {
  remote: 'remote',
  hybrid: 'hybrid',
  onsite: 'onsite',
};

const expColors: Record<string, string> = {
  junior: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  mid: 'bg-blue-50 text-blue-700 border border-blue-200',
  senior: 'bg-violet-50 text-violet-700 border border-violet-200',
  lead: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const expLabels: Record<string, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  lead: 'Lead',
};

export default function JobCard({ job, featured, onClick }: JobCardProps) {
  const salaryStr =
    job.salaryMax > 0
      ? `$${(job.salaryMin / 1000).toFixed(0)}K – $${(job.salaryMax / 1000).toFixed(0)}K`
      : 'Salary not listed';

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-xl border transition-all duration-200 cursor-pointer ${
        featured
          ? 'border-amber-200 shadow-md hover:shadow-lg hover:border-amber-300 bg-gradient-to-r from-amber-50/30 to-white'
          : 'border-slate-200 shadow-card hover:shadow-card-hover hover:border-violet-200'
      }`}
    >
      {featured && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-amber-100 border border-amber-200 rounded-full">
          <Star size={11} className="text-amber-600 fill-amber-500" />
          <span className="text-[10px] font-semibold text-amber-700">Featured</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
            <AppImage
              src={job.companyLogo}
              alt={job.companyLogoAlt}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 pr-24">
            {/* Title & Company */}
            <div className="flex items-start gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-violet-700 transition-colors truncate">
                {job.title}
              </h3>
              {job.verified && (
                <Shield size={13} className="text-violet-600 shrink-0 mt-0.5" />
              )}
            </div>
            <p className="text-xs text-slate-500 mb-2.5 font-medium">{job.company}</p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusBadge variant={locationTypeVariant[job.locationType]} label={job.locationType === 'onsite' ? 'On-site' : job.locationType.charAt(0).toUpperCase() + job.locationType.slice(1)} dot />
              <span className={`badge ${expColors[job.experienceLevel]}`}>{expLabels[job.experienceLevel]}</span>
              <span className="badge bg-slate-100 text-slate-600 border border-slate-200">{job.type}</span>

              {job.nftRequired && (
                <span className="flex items-center gap-1 badge bg-amber-50 text-amber-700 border border-amber-200">
                  <Award size={10} />
                  NFT Required
                </span>
              )}
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 5).map((skill) => (
                <span
                  key={`${job.id}-skill-${skill}`}
                  className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full">
                  +{job.skills.length - 5}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {job.postedAt}
            </span>
            {job.applicants > 0 && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {job.applicants} applicants
              </span>
            )}
            {job.source === 'adzuna' && (
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Adzuna</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-900 tabular-nums">{salaryStr}</span>
            {job.applyUrl ? (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn-primary text-xs px-3 py-1.5"
              >
                Apply
              </a>
            ) : (
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="btn-primary text-xs px-3 py-1.5"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}