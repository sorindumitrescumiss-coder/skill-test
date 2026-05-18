'use client';

import React from 'react';
import { ExternalLink, Wallet, X } from 'lucide-react';
import { toast } from 'sonner';
import { syncConnectedWalletToProfile } from '@/lib/wallet/syncProfileWallet';

type WalletKind = 'metamask' | 'okx' | 'base' | 'coinbase' | 'trust' | 'walletconnect';

type EthereumProvider = {
  isMetaMask?: boolean;
  isOkxWallet?: boolean;
  isOKXWallet?: boolean;
  isBaseWallet?: boolean;
  isCoinbaseWallet?: boolean;
  isTrust?: boolean;
  isTrustWallet?: boolean;
  isWalletConnect?: boolean;
  request: (args: { method: string }) => Promise<string[]>;
};

type EthereumWindow = Window & {
  ethereum?: EthereumProvider & {
    providers?: EthereumProvider[];
  };
};

interface WalletConnectButtonProps {
  className?: string;
}

function WalletMark({ kind }: { kind: WalletKind }) {
  if (kind === 'metamask') {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-orange-300 bg-orange-100" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">
          <path d="M3 5 L9 3 L12 7 L6 9 Z" fill="#f97316" />
          <path d="M21 5 L15 3 L12 7 L18 9 Z" fill="#ea580c" />
          <path d="M6 9 L12 7 L9 13 L5 12 Z" fill="#fb923c" />
          <path d="M18 9 L12 7 L15 13 L19 12 Z" fill="#c2410c" />
          <path d="M9 13 L12 11 L15 13 L12 18 Z" fill="#f59e0b" />
        </svg>
      </span>
    );
  }
  if (kind === 'okx') {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-stone-700 bg-stone-900" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">
          <rect x="3" y="3" width="7" height="7" fill="#fff" />
          <rect x="14" y="3" width="7" height="7" fill="#fff" />
          <rect x="3" y="14" width="7" height="7" fill="#fff" />
          <rect x="14" y="14" width="7" height="7" fill="#fff" />
        </svg>
      </span>
    );
  }
  if (kind === 'base') {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-blue-200 bg-blue-100" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">
          <circle cx="12" cy="12" r="9" fill="#2563eb" />
          <circle cx="9.5" cy="12" r="3.2" fill="#fff" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-indigo-200 bg-indigo-100" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">
        <circle cx="12" cy="12" r="9" fill="#3b82f6" />
        <path d="M7 12c1.2-1.5 2.4-2.2 3.6-2.2 1.3 0 2.1.7 2.9 1.6.8-.9 1.6-1.6 2.9-1.6 1.2 0 2.4.7 3.6 2.2" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function getInjectedProviders(): EthereumProvider[] {
  if (typeof window === 'undefined') return [];
  const eth = (window as EthereumWindow).ethereum;
  if (!eth) return [];
  if (Array.isArray(eth.providers) && eth.providers.length > 0) return eth.providers;
  return [eth];
}

function providerFor(kind: WalletKind, providers: EthereumProvider[]): EthereumProvider | null {
  switch (kind) {
    case 'metamask':
      return providers.find((p) => Boolean(p.isMetaMask)) ?? null;
    case 'coinbase':
      return providers.find((p) => Boolean(p.isCoinbaseWallet)) ?? null;
    case 'okx':
      return providers.find((p) => Boolean(p.isOkxWallet || p.isOKXWallet)) ?? null;
    case 'base':
      return providers.find((p) => Boolean(p.isBaseWallet)) ?? null;
    case 'trust':
      return providers.find((p) => Boolean(p.isTrust || p.isTrustWallet)) ?? null;
    case 'walletconnect':
      return providers.find((p) => Boolean(p.isWalletConnect)) ?? null;
    default:
      return null;
  }
}

const SIGNOUT_EVENT = 'trueassess-signout';

export default function WalletConnectButton({ className }: WalletConnectButtonProps) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [loadingKind, setLoadingKind] = React.useState<WalletKind | null>(null);
  const [walletLabel, setWalletLabel] = React.useState<string | null>(null);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);

  React.useEffect(() => {
    const clearWallet = () => {
      setWalletAddress(null);
      setWalletLabel(null);
      setPickerOpen(false);
      setLoadingKind(null);
    };
    window.addEventListener(SIGNOUT_EVENT, clearWallet);
    return () => window.removeEventListener(SIGNOUT_EVENT, clearWallet);
  }, []);

  const primaryWallets = [
    { id: 'metamask' as const, label: 'MetaMask' },
    { id: 'okx' as const, label: 'OKX Wallet' },
    { id: 'base' as const, label: 'Base Account' },
    { id: 'walletconnect' as const, label: 'WalletConnect' },
    { id: 'coinbase' as const, label: 'Coinbase Wallet' },
    { id: 'trust' as const, label: 'Trust Wallet' },
  ];

  const moreWallets = [
    { label: 'Zerion', href: 'https://zerion.io/wallet' },
    { label: 'Phantom', href: 'https://phantom.app/' },
    { label: 'Core', href: 'https://core.app/' },
    { label: 'Rabby Wallet', href: 'https://rabby.io/' },
    { label: 'Solflare', href: 'https://solflare.com/' },
    { label: 'Abstract', href: 'https://www.abs.xyz/' },
    { label: 'Glyph', href: 'https://www.glyph.exchange/' },
    { label: 'VeeFriends Wallet', href: 'https://veefriends.com/' },
  ];

  const openExternal = (href: string) => {
    if (typeof window === 'undefined') return;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const connect = async (kind: WalletKind, label: string) => {
    const providers = getInjectedProviders();
    const provider = providerFor(kind, providers);

    if (!provider) {
      if (kind === 'walletconnect') {
        toast.info('WalletConnect not detected', {
          description: 'WalletConnect extension is not available in this browser session yet.',
        });
      } else {
        toast.error(`${label} not found`, {
          description: `Install or enable ${label}, then try again.`,
        });
      }
      return;
    }

    setLoadingKind(kind);
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const account = accounts?.[0] ?? null;
      if (!account) {
        toast.error('No account returned', { description: 'Please unlock your wallet and retry.' });
        return;
      }
      setWalletAddress(account);
      setWalletLabel(label);
      setPickerOpen(false);
      const { mode } = await syncConnectedWalletToProfile(account);
      if (mode === 'session') {
        toast.success(`${label} connected`, {
          description: 'Wallet address saved to your profile.',
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('trueassess-profile-wallet-updated'));
        }
      } else {
        toast.success(`${label} connected`, {
          description: 'After you sign in or create an account, we will save this address to your profile.',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Wallet connection failed.';
      toast.error(`${label} connection failed`, { description: message });
    } finally {
      setLoadingKind(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border border-parchment-400/70 bg-parchment-100 py-2.5 text-sm font-semibold text-parchment-900 transition hover:bg-parchment-150 ${className ?? ''}`}
      >
        <Wallet size={16} />
        {walletAddress && walletLabel
          ? `${walletLabel}: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          : 'Connect wallet'}
      </button>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Choose wallet"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-parchment-300/80 bg-parchment-50 p-4 shadow-[0_24px_48px_-20px_rgba(15,23,42,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-parchment-300/60 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">Wallet</p>
                <h4 className="font-serif text-xl font-semibold text-parchment-950">Choose a wallet</h4>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="rounded-md p-1.5 text-stone-500 transition hover:bg-parchment-100 hover:text-stone-800"
                aria-label="Close wallet picker"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 grid gap-2">
              {primaryWallets.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    void connect(item.id, item.label);
                  }}
                  disabled={loadingKind !== null}
                  className="flex items-center justify-between rounded-lg border border-parchment-300/80 bg-parchment-100 px-3 py-2.5 text-left text-sm font-semibold text-parchment-900 transition hover:bg-parchment-150 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center gap-2">
                    <WalletMark kind={item.id} />
                    <span>{item.label}</span>
                  </span>
                  <span className="text-xs font-medium text-stone-600">
                    {loadingKind === item.id ? 'Connecting...' : 'Connect'}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-parchment-300/60 pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">More wallet options</p>
              <div className="grid gap-2">
                {moreWallets.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => openExternal(item.href)}
                    className="flex items-center justify-between rounded-lg border border-parchment-300/80 bg-parchment-100 px-3 py-2.5 text-left text-sm font-semibold text-parchment-900 transition hover:bg-parchment-150"
                  >
                    <span>{item.label}</span>
                    <ExternalLink size={14} className="text-stone-500" aria-hidden />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
