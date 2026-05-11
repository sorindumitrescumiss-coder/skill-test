import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { Shield, Award, Briefcase, Zap } from 'lucide-react';

const features = [
  { icon: <Award size={18} className="text-amber-400" />, title: 'Earn NFT Certificates', desc: 'Pass skill tests and receive on-chain verified credentials' },
  { icon: <Briefcase size={18} className="text-parchment-200" />, title: 'Land Verified Jobs', desc: 'Apply to roles that recognize your on-chain proof of skill' },
  { icon: <Zap size={18} className="text-emerald-400" />, title: 'Learning World', desc: 'Swap and cross-chain bridge when you trade tokenized credentials' },
  { icon: <Shield size={18} className="text-blue-300" />, title: 'Role-Based Security', desc: 'Permissions are enforced so your data stays private and secure' },
];

export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-2/5 flex-col shrink-0 bg-gradient-to-br from-[#3f3228] via-[#4f3d2f] to-[#2e241d] p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-parchment-300/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-100/10 rounded-full blur-2xl" />
      </div>
      {/* Logo */}
      <div className="relative mb-14 flex items-center gap-3">
        <AppLogo size={36} />
        <span className="text-lg font-bold tracking-tight text-white">TrueAssess</span>
      </div>
      {/* Hero */}
      <div className="relative flex-1">
        <h1 className="mb-4 text-5xl font-bold leading-tight text-white">
          Skills that live
          <br />
          <span className="text-parchment-200">on-chain.</span>
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-slate-300">
          The first platform where your technical skills are verified, tokenized, and recognized by top employers worldwide.
        </p>

        {/* Features */}
        <div className="space-y-4">
          {features?.map((f) => (
            <div key={`feat-${f?.title}`} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                {f?.icon}
              </div>
              <div>
                <p className="text-base font-semibold text-white">{f?.title}</p>
                <p className="mt-0.5 text-sm text-slate-300">{f?.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Stats */}
      <div className="relative grid grid-cols-3 gap-4 pt-8 border-t border-white/10 mt-8">
        {[
          { value: '24.8K', label: 'Certificates Minted' },
          { value: '1,200+', label: 'Companies Hiring' },
          { value: '$4.2M', label: 'NFT Volume' },
        ]?.map((s) => (
          <div key={`stat-${s?.label}`}>
            <p className="text-xl font-bold text-white tabular-nums">{s?.value}</p>
            <p className="text-xs text-slate-300 mt-0.5">{s?.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}