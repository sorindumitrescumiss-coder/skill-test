'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutGrid,
  Briefcase,
  ShoppingBag,
  ArrowLeftRight,
  GitBranch,
  Award,
  ClipboardList,
  ImagePlus,
  Users,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  group: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutGrid size={18} />, href: '/dashboard', group: 'main' },
  { label: 'Learning World', icon: <ShoppingBag size={18} />, href: '/learning-world', group: 'marketplace' },
  { label: 'Swap', icon: <ArrowLeftRight size={18} />, href: '/learning-world?tab=swap', group: 'marketplace' },
  { label: 'Bridge', icon: <GitBranch size={18} />, href: '/learning-world?tab=bridge', group: 'marketplace' },
  { label: 'Job Board', icon: <Briefcase size={18} />, href: '/job-board', group: 'jobs', badge: 14 },
  { label: 'Skill Tests', icon: <ClipboardList size={18} />, href: '/skill-test', group: 'credentials' },
  { label: 'Certificates', icon: <Award size={18} />, href: '/certificates', group: 'credentials', badge: 3 },
  { label: 'Candidates', icon: <Users size={18} />, href: '/candidates', group: 'admin' },
  { label: 'Create NFT', icon: <ImagePlus size={18} />, href: '/admin/create-nft', group: 'admin' },
  { label: 'Profile', icon: <User size={18} />, href: '/profile', group: 'admin' },
];

const groupLabels: Record<string, string> = {
  main: 'Overview',
  marketplace: 'Discover',
  jobs: 'Jobs & Hiring',
  credentials: 'Credentials',
  admin: 'Account',
};

interface SidebarProps {
  activePath?: string;
}

export default function Sidebar({ activePath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const groups = ['main', 'marketplace', 'jobs', 'credentials', 'admin'];

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-60'
      } shrink-0 h-full z-20`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-slate-100 ${collapsed ? 'justify-center' : 'gap-2'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-bold text-lg text-slate-900 tracking-tight">TrueAssess</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group);
          return (
            <div key={`group-${group}`} className="mb-4">
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {groupLabels[group]}
                </p>
              )}
              {items.map((item) => {
                const isActive = activePath === item.href || activePath?.startsWith(item.href.split('?')[0]);
                return (
                  <Link
                    key={`nav-${item.href}`}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all duration-150 group ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-blue-100 text-blue-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      <div className={`border-t border-slate-100 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">AK</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Arjun Kumar</p>
              <p className="text-xs text-slate-400 truncate">Candidate</p>
            </div>
            <Bell size={16} className="text-slate-400 shrink-0" />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-150 z-30"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-slate-500" />
        ) : (
          <ChevronLeft size={12} className="text-slate-500" />
        )}
      </button>
    </aside>
  );
}