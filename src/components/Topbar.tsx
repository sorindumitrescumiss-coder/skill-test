'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, ChevronDown, Wallet, Zap, X } from 'lucide-react';

export default function Topbar() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 'notif-1', title: 'Certificate NFT minted', desc: 'Your React Advanced cert is live on-chain', time: '2m ago', unread: true },
    { id: 'notif-2', title: 'New job match', desc: 'Senior Frontend at Coinbase matches your skills', time: '1h ago', unread: true },
    { id: 'notif-3', title: 'NFT offer received', desc: '0.8 ETH offer on your Solidity Pro certificate', time: '3h ago', unread: false },
  ];

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shrink-0 z-10">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search NFTs, jobs, skills..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Network badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">Ethereum Mainnet</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Bell size={18} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-900">Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
                {notifications?.map((n) => (
                  <div
                    key={n?.id}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${n?.unread ? 'bg-violet-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {n?.unread && <span className="w-2 h-2 bg-violet-600 rounded-full mt-1.5 shrink-0" />}
                      {!n?.unread && <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" />}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{n?.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n?.desc}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n?.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wallet Connect */}
          {walletConnected ? (
            <button
              onClick={() => setWalletConnected(false)}
              className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-sm font-medium text-violet-700 font-mono">0x3f...a9b2</span>
              <ChevronDown size={14} className="text-violet-500" />
            </button>
          ) : (
            <button
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 active:scale-95 transition-all duration-150 shadow-violet"
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          )}
        </div>
      </header>
      {/* Wallet Connect Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Connect Wallet</h3>
                <p className="text-xs text-slate-500 mt-0.5">Choose your preferred wallet</p>
              </div>
              <button onClick={() => setShowWalletModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {[
                { name: 'MetaMask', icon: '🦊', desc: 'Most popular Ethereum wallet' },
                { name: 'Coinbase Wallet', icon: '🔵', desc: 'Simple & secure' },
                { name: 'WalletConnect', icon: '🔗', desc: 'Connect via QR code' },
                { name: 'Google Account', icon: '🟢', desc: 'In-app wallet via thirdweb' },
              ]?.map((w) => (
                <button
                  key={`wallet-${w?.name}`}
                  onClick={() => { setWalletConnected(true); setShowWalletModal(false); }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all duration-150 group"
                >
                  <span className="text-2xl">{w?.icon}</span>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-900 group-hover:text-violet-700">{w?.name}</p>
                    <p className="text-xs text-slate-500">{w?.desc}</p>
                  </div>
                  <Zap size={14} className="ml-auto text-slate-300 group-hover:text-violet-500" />
                </button>
              ))}
            </div>
            <div className="px-6 pb-5 pt-2">
              <p className="text-[11px] text-slate-400 text-center">
                By connecting, you agree to our{' '}
                <Link href="#" className="text-violet-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-violet-600 hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}