import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import '../styles/tailwind.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'TrueAssess — Earn NFT Credentials, Land Verified Jobs',
  description:
    'TrueAssess lets candidates earn on-chain NFT skill certificates by passing technical tests, then apply to verified jobs — with Learning World, swap, and bridge.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-parchment-100 text-left font-sans text-parchment-950 antialiased">
        {children}
        <Toaster richColors position="top-center" />

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fskillmint5102back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}