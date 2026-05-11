import React from 'react';

type BadgeVariant =
  | 'active'
  | 'pending'
  | 'closed'
  | 'minted'
  | 'listed'
  | 'sold'
  | 'verified'
  | 'draft'
  | 'shortlisted'
  | 'rejected'
  | 'new'
  | 'remote'
  | 'hybrid'
  | 'onsite'
  | 'certificate'
  | 'collectible';

const variantMap: Record<BadgeVariant, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  closed: 'bg-slate-100 text-slate-500 border border-slate-200',
  minted: 'bg-violet-50 text-violet-700 border border-violet-200',
  listed: 'bg-blue-50 text-blue-700 border border-blue-200',
  sold: 'bg-slate-100 text-slate-500 border border-slate-200',
  verified: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  draft: 'bg-slate-100 text-slate-500 border border-slate-200',
  shortlisted: 'bg-blue-50 text-blue-700 border border-blue-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  new: 'bg-sky-50 text-sky-800 border border-sky-200',
  remote: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  hybrid: 'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200',
  onsite: 'bg-orange-50 text-orange-800 border border-orange-200',
  certificate: 'bg-violet-50 text-violet-800 border border-violet-200',
  collectible: 'bg-cyan-50 text-cyan-800 border border-cyan-200',
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  dot?: boolean;
}

export default function StatusBadge({ variant, label, dot }: StatusBadgeProps) {
  const classes = variantMap[variant] ?? variantMap.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {label}
    </span>
  );
}
