'use client';

import React from 'react';
import Link from 'next/link';

const footerLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Skill tests', href: '/skill-test' },
  { label: 'Job board', href: '/job-board' },
  { label: 'Certificates', href: '/certificates' },
] as const;

const legalLinks = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
] as const;

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t border-parchment-300/80 bg-parchment-150/90 text-parchment-950"
      role="contentinfo"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-6 sm:py-9 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-serif text-lg font-semibold tracking-tight text-parchment-950">TrueAssess</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              AI skill tests and verifiable credentials for teams and individuals.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 sm:justify-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Explore</p>
              <ul className="mt-3 space-y-2">
                {footerLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-stone-700 transition hover:text-parchment-900"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Legal</p>
              <ul className="mt-3 space-y-2">
                {legalLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-stone-700 transition hover:text-parchment-900"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-parchment-300/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone-500">© {year} TrueAssess. All rights reserved.</p>
          <p className="text-xs text-stone-500">Credentialing &amp; assessment</p>
        </div>
      </div>
    </footer>
  );
}
