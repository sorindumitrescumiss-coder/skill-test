'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, MapPin, Clock, Users, Award, Shield, Briefcase, CheckCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { Job } from './JobBoardClient';
import StatusBadge from '@/components/ui/StatusBadge';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';

interface ApplicationForm {
  coverLetter: string;
  portfolioUrl: string;
  linkedinUrl: string;
  availableFrom: string;
  expectedSalary: string;
  useNFTCredential: boolean;
}

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
}

type Tab = 'overview' | 'apply';

export default function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationForm>({
    defaultValues: { useNFTCredential: true },
  });

  const salaryStr = `$${(job.salaryMin / 1000).toFixed(0)}K – $${(job.salaryMax / 1000).toFixed(0)}K`;

  const onSubmit = async (data: ApplicationForm) => {
    setSubmitting(true);
    // TODO: persist application (user_id, job_id, cover_letter, portfolio_url) via API
    // TODO: if useNFTCredential, attach on-chain certificate token_id to application record
    await new Promise((r) => setTimeout(r, 1800));
    setSubmitting(false);
    setApplied(true);
    toast.success(`Application submitted to ${job.company}!`, {
      description: 'They\'ll review your profile and NFT credentials',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-slate-100 shrink-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
            <AppImage
              src={job.companyLogo}
              alt={job.companyLogoAlt}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900 truncate">{job.title}</h2>
              {job.verified && <Shield size={15} className="text-violet-600 shrink-0" />}
            </div>
            <p className="text-sm text-slate-500 font-medium">{job.company}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <StatusBadge
                variant={job.locationType as 'remote' | 'hybrid' | 'onsite'}
                label={job.locationType === 'onsite' ? 'On-site' : job.locationType.charAt(0).toUpperCase() + job.locationType.slice(1)}
                dot
              />
              <span className="badge bg-slate-100 text-slate-600 border border-slate-200">{job.type}</span>
              {job.nftRequired && (
                <span className="flex items-center gap-1 badge bg-amber-50 text-amber-700 border border-amber-200">
                  <Award size={10} />
                  NFT Credential Required
                </span>
              )}
              <span className="text-sm font-bold text-slate-900 tabular-nums ml-auto">{salaryStr}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 shrink-0">
          {([
            { id: 'overview', label: 'Job Overview' },
            { id: 'apply', label: applied ? '✓ Applied' : 'Apply Now' },
          ] as { id: Tab; label: string }[]).map((tab) => (
            <button
              key={`modal-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all ${
                activeTab === tab.id
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: <MapPin size={14} />, label: 'Location', value: job.location },
                  { icon: <Clock size={14} />, label: 'Posted', value: job.postedAt },
                  { icon: <Users size={14} />, label: 'Applicants', value: `${job.applicants}` },
                  { icon: <Briefcase size={14} />, label: 'Experience', value: job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1) },
                ].map((info) => (
                  <div key={`info-${info.label}`} className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      {info.icon}
                      <span className="text-[10px] uppercase tracking-wide font-semibold">{info.label}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{info.value}</p>
                  </div>
                ))}
              </div>

              {/* NFT Credential Banner */}
              {job.nftRequired && job.requiredCertificate && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <Award size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">NFT Credential Required</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      This role requires a verified{' '}
                      <span className="font-semibold">{job.requiredCertificate}</span>{' '}
                      NFT certificate on-chain. You can earn this by passing the skill test.
                    </p>
                    <button className="mt-2 flex items-center gap-1 text-xs text-amber-700 font-semibold hover:text-amber-900">
                      Take the skill test <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">About the Role</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
              </div>

              {/* Responsibilities */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Key Responsibilities</h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((r) => (
                    <li key={`resp-${r.slice(0, 20)}`} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle size={14} className="text-violet-500 shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills Required */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={`modal-skill-${skill}`}
                      className="px-3 py-1.5 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Benefits & Perks</h3>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((b) => (
                    <span
                      key={`benefit-${b}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium rounded-lg"
                    >
                      <CheckCircle size={11} />
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('apply')}
                className="w-full btn-primary py-3 text-base font-semibold mt-2"
              >
                Apply to {job.company}
              </button>
            </div>
          )}

          {activeTab === 'apply' && (
            <div className="animate-fade-in">
              {applied ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
                  <p className="text-sm text-slate-500 max-w-sm mb-6">
                    Your application to <span className="font-semibold">{job.company}</span> has been received. They&apos;ll review your profile and NFT credentials shortly.
                  </p>
                  <button
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Back to Job Board
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                    <p className="text-sm font-semibold text-violet-800 mb-1">
                      Applying to: {job.title}
                    </p>
                    <p className="text-xs text-violet-600">{job.company} · {salaryStr}</p>
                  </div>

                  {/* NFT Credential Toggle */}
                  {job.nftRequired && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 mt-0.5"
                          {...register('useNFTCredential')}
                        />
                        <div>
                          <p className="text-sm font-semibold text-amber-800">
                            Attach NFT Credential
                          </p>
                          <p className="text-xs text-amber-700 mt-0.5">
                            Include your on-chain <span className="font-semibold">{job.requiredCertificate}</span> certificate with this application. Verified candidates get priority review.
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Cover Letter */}
                  <div>
                    <label htmlFor="cover-letter" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Cover letter
                    </label>
                    <p className="text-xs text-slate-400 mb-1.5">
                      Tell {job.company} why you&apos;re the right fit. Mention your relevant experience and on-chain credentials.
                    </p>
                    <textarea
                      id="cover-letter"
                      rows={5}
                      placeholder={`Hi ${job.company} team,\n\nI'm excited to apply for the ${job.title} role...`}
                      className={`input-field resize-none ${errors.coverLetter ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                      {...register('coverLetter', {
                        required: 'Cover letter is required',
                        minLength: { value: 100, message: 'Cover letter must be at least 100 characters' },
                      })}
                    />
                    {errors.coverLetter && (
                      <p className="text-xs text-red-500 mt-1.5">{errors.coverLetter.message}</p>
                    )}
                  </div>

                  {/* Portfolio URL */}
                  <div>
                    <label htmlFor="portfolio-url" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Portfolio / GitHub URL
                    </label>
                    <div className="relative">
                      <ExternalLink size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="portfolio-url"
                        type="url"
                        placeholder="https://github.com/yourhandle"
                        className={`input-field pl-8 ${errors.portfolioUrl ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                        {...register('portfolioUrl', {
                          pattern: { value: /^https?:\/\//, message: 'Must be a valid URL starting with http:// or https://' },
                        })}
                      />
                    </div>
                    {errors.portfolioUrl && (
                      <p className="text-xs text-red-500 mt-1.5">{errors.portfolioUrl.message}</p>
                    )}
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label htmlFor="linkedin-url" className="block text-sm font-medium text-slate-700 mb-1.5">
                      LinkedIn profile
                    </label>
                    <input
                      id="linkedin-url"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="input-field"
                      {...register('linkedinUrl')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Available From */}
                    <div>
                      <label htmlFor="available-from" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Available from
                      </label>
                      <input
                        id="available-from"
                        type="date"
                        className={`input-field ${errors.availableFrom ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                        {...register('availableFrom', { required: 'Start date is required' })}
                      />
                      {errors.availableFrom && (
                        <p className="text-xs text-red-500 mt-1.5">{errors.availableFrom.message}</p>
                      )}
                    </div>

                    {/* Expected Salary */}
                    <div>
                      <label htmlFor="expected-salary" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Expected salary (USD)
                      </label>
                      <input
                        id="expected-salary"
                        type="text"
                        placeholder="e.g. $180,000"
                        className="input-field"
                        {...register('expectedSalary')}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-secondary flex-1 py-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        `Submit Application`
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}