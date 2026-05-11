import React from 'react';
import { Briefcase, Users, Award, TrendingUp, MapPin } from 'lucide-react';

const stats = [
  { id: 'stat-jobs', label: 'Open Positions', value: '1,247', change: '+14 today', icon: <Briefcase size={16} className="text-violet-600" />, bg: 'bg-violet-50' },
  { id: 'stat-companies', label: 'Hiring Companies', value: '312', change: '+8 this week', icon: <Users size={16} className="text-blue-600" />, bg: 'bg-blue-50' },
  { id: 'stat-nft-jobs', label: 'NFT-Gated Roles', value: '489', change: '39% of listings', icon: <Award size={16} className="text-amber-600" />, bg: 'bg-amber-50' },
  { id: 'stat-avg-salary', label: 'Avg. Salary', value: '$162K', change: '+12% vs last yr', icon: <TrendingUp size={16} className="text-emerald-600" />, bg: 'bg-emerald-50' },
  { id: 'stat-remote', label: 'Remote Roles', value: '68%', change: 'of all listings', icon: <MapPin size={16} className="text-teal-600" />, bg: 'bg-teal-50' },
];

export default function JobBoardStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats?.map((s) => (
        <div key={s?.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s?.label}</span>
            <div className={`w-7 h-7 rounded-lg ${s?.bg} flex items-center justify-center`}>
              {s?.icon}
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 tabular-nums">{s?.value}</p>
          <p className="text-xs text-slate-400 mt-1">{s?.change}</p>
        </div>
      ))}
    </div>
  );
}