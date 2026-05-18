'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import AppFooter from '@/components/AppFooter';
import { Bell, ChevronDown, LogOut, Search, User as UserIcon, Wallet, X } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { flushPendingWalletToProfile, syncConnectedWalletToProfile } from '@/lib/wallet/syncProfileWallet';
import type { User } from '@supabase/supabase-js';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Skill Tests', href: '/skill-test' },
  { label: 'Billing', href: '/billing' },
  { label: 'Job Board', href: '/job-board' },
  { label: 'Candidates', href: '/candidates' },
  { label: 'Create NFT', href: '/admin/create-nft' },
  { label: 'Learning World', href: '/learning-world' },
  { label: 'Certificates', href: '/certificates' },
  { label: 'Profile', href: '/profile' },
];

const PENDING_SIGNIN_KEY = 'trueassess_pending_signin';
const PENDING_SIGNIN_EVENT = 'trueassess-pending-signin';
const SIGNOUT_EVENT = 'trueassess-signout';

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = React.useState(false);
  const [walletSearch, setWalletSearch] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isRouteTransitioning, setIsRouteTransitioning] = React.useState(false);
  const [authUser, setAuthUser] = React.useState<User | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setIsRouteTransitioning(true);
    setIsAccountMenuOpen(false);
    const timer = window.setTimeout(() => setIsRouteTransitioning(false), 520);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const [pendingSignIn, setPendingSignIn] = React.useState(false);

  const readPendingSignIn = React.useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(PENDING_SIGNIN_KEY) === '1';
  }, []);

  React.useEffect(() => {
    setPendingSignIn(readPendingSignIn());
    const onStorage = (e: StorageEvent) => {
      if (e.key === PENDING_SIGNIN_KEY) setPendingSignIn(e.newValue === '1');
    };
    const onPendingSignInChanged = () => setPendingSignIn(readPendingSignIn());
    window.addEventListener('storage', onStorage);
    window.addEventListener(PENDING_SIGNIN_EVENT, onPendingSignInChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(PENDING_SIGNIN_EVENT, onPendingSignInChanged);
    };
  }, [readPendingSignIn]);

  React.useEffect(() => {
    const sb = getSupabaseBrowser();
    void sb.auth.getUser().then(({ data }) => setAuthUser(data.user ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    if (authUser && typeof window !== 'undefined') {
      window.localStorage.removeItem(PENDING_SIGNIN_KEY);
      window.dispatchEvent(new Event(PENDING_SIGNIN_EVENT));
      setPendingSignIn(false);
    }
  }, [authUser]);

  React.useEffect(() => {
    if (!authUser) return;
    void flushPendingWalletToProfile().then((didFlush) => {
      if (didFlush && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trueassess-profile-wallet-updated'));
      }
    });
  }, [authUser?.id]);

  React.useEffect(() => {
    if (!isAccountMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAccountMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isAccountMenuOpen]);

  const handleSignOut = React.useCallback(async () => {
    setIsAccountMenuOpen(false);
    setWalletAddress(null);
    setIsWalletModalOpen(false);
    if (typeof window !== 'undefined') {
      const eth = (
        window as Window & {
          ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
        }
      ).ethereum;
      if (eth?.request) {
        void eth
          .request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] })
          .catch(() => {
            /* not supported in all wallets */
          });
      }
      window.dispatchEvent(new Event(SIGNOUT_EVENT));
    }
    const sb = getSupabaseBrowser();
    await sb.auth.signOut();
    router.push('/');
    router.refresh();
  }, [router]);

  const shortAddress = React.useMemo(() => {
    if (!walletAddress) return null;
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window === 'undefined') return;
    const eth = (window as Window & { ethereum?: { request: (args: { method: string }) => Promise<string[]> } })
      .ethereum;

    if (!eth) {
      window.alert('No wallet found. Please install MetaMask.');
      return;
    }

    try {
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      const addr = accounts?.[0];
      if (addr) {
        setWalletAddress(addr);
        setIsWalletModalOpen(false);
        const { mode } = await syncConnectedWalletToProfile(addr);
        if (mode === 'session') {
          toast.success('Wallet connected', { description: 'Address saved to your profile.' });
          window.dispatchEvent(new CustomEvent('trueassess-profile-wallet-updated'));
        } else {
          toast.success('Wallet connected', {
            description: 'After you sign in, we will save this address to your profile.',
          });
        }
      }
    } catch {
      window.alert('Wallet connection was rejected or failed.');
    }
  };

  const walletOptions = React.useMemo(
    () => [
      { name: 'MetaMask', tone: 'from-orange-500 to-amber-400', connect: connectWallet },
      { name: 'Trust Wallet', tone: 'from-blue-600 to-cyan-400' },
      { name: 'Zerion', tone: 'from-indigo-600 to-blue-400' },
      { name: 'Base', tone: 'from-blue-700 to-indigo-500' },
      { name: 'Nova Wallet', tone: 'from-sky-500 to-indigo-500' },
    ],
    [],
  );

  const filteredWallets = React.useMemo(() => {
    const q = walletSearch.trim().toLowerCase();
    if (!q) return walletOptions;
    return walletOptions.filter((wallet) => wallet.name.toLowerCase().includes(q));
  }, [walletOptions, walletSearch]);

  const runSearch = React.useCallback(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    setIsSearchOpen(false);

    const targets: { keywords: string[]; href: string }[] = [
      { keywords: ['dashboard', 'home', 'main'], href: '/dashboard' },
      { keywords: ['create nft', 'admin nft', 'mint nft', 'nft admin'], href: '/admin/create-nft' },
      { keywords: ['nft', 'marketplace', 'mint', 'learning', 'world'], href: '/learning-world' },
      { keywords: ['skill', 'test', 'quiz', 'exam'], href: '/skill-test' },
      { keywords: ['certificate', 'certification'], href: '/certificates' },
      { keywords: ['job', 'career', 'hiring'], href: '/job-board' },
      { keywords: ['candidate', 'talent'], href: '/candidates' },
      { keywords: ['setting', 'config', 'preferences', 'profile', 'account'], href: '/profile' },
      { keywords: ['login', 'sign', 'join', 'register', 'account'], href: '/sign-up-login-screen' },
    ];

    const match = targets.find((t) => t.keywords.some((k) => q.includes(k)));
    router.push(match?.href ?? `/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
  }, [router, searchQuery]);

  React.useEffect(() => {
    if (!isSearchOpen) return;
    const focusTimer = window.setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => window.clearTimeout(focusTimer);
  }, [isSearchOpen]);

  React.useEffect(() => {
    if (!isSearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSearchOpen]);

  React.useEffect(() => {
    if (!isSearchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isSearchOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-parchment-950">
      <div className="sticky top-0 z-50 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
      {/* Top tagline strip */}
      <div className="border-b border-slate-700/50 bg-slate-900 text-white">
        <div className="mx-auto flex h-10 w-full max-w-[1200px] items-center px-5 sm:h-11 sm:px-6 lg:px-8">
          <p className="w-full truncate text-center text-[10px] font-medium uppercase tracking-[0.18em] sm:text-[11px] sm:tracking-[0.2em]">
            TrueAssess — AI skill tests & verifiable credentials
          </p>
        </div>
      </div>

      {/* Single row: full width (no max-w) + compact spacing so everything fits without horizontal scroll on typical viewports */}
      <header className="border-b border-parchment-200/90 bg-parchment-100">
        <div className="relative mx-auto w-full max-w-[1200px]">
          {/* Wordmark sits in the left margin (outside the main column); wide screens only so it does not clip */}
          <Link
            href="/dashboard"
            className="absolute right-full top-1/2 z-10 mr-2 hidden -translate-y-1/2 items-center gap-1.5 sm:mr-3 sm:gap-2 min-[1460px]:flex"
          >
            <AppLogo size={22} />
            <span className="font-serif text-base font-semibold tracking-tight text-parchment-950">
              TrueAssess
            </span>
          </Link>

          <div className="flex h-[50px] w-full flex-nowrap items-center gap-1 px-5 sm:h-[52px] sm:gap-1.5 sm:px-6 lg:gap-2 lg:px-8">
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-1.5 sm:gap-2 min-[1460px]:hidden"
            >
              <AppLogo size={24} />
              <span className="font-serif text-base font-semibold tracking-tight text-parchment-950 sm:text-lg">
                TrueAssess
              </span>
            </Link>

          <div className="flex min-w-0 shrink flex-1 items-stretch">
            <nav className="flex min-w-0 flex-1 items-stretch" aria-label="Primary">
              <div className="flex h-[50px] w-full min-w-0 items-stretch sm:h-[52px]">
                {navItems.map((item) => {
                  const active = (activePath ?? pathname) === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex min-w-0 flex-1 items-center justify-center whitespace-nowrap border-b-2 px-0.5 text-[9px] font-medium uppercase tracking-[0.06em] transition sm:px-1 sm:text-[10px] sm:tracking-[0.08em] lg:text-[11px] xl:text-[12px] ${
                        active
                          ? 'border-b-parchment-800 text-parchment-950'
                          : 'border-b-transparent text-stone-500 hover:border-b-parchment-300/90 hover:text-parchment-950'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 min-[1460px]:absolute min-[1460px]:left-full min-[1460px]:top-1/2 min-[1460px]:z-10 min-[1460px]:ml-3 min-[1460px]:-translate-y-1/2 min-[1460px]:gap-1.5">
            {authUser ? (
              <div className="relative flex shrink-0 items-center gap-0.5 sm:gap-1" ref={accountMenuRef}>
                <Link
                  href="/profile"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-parchment-400/90 bg-white text-parchment-950 shadow-sm transition hover:border-parchment-500 hover:bg-parchment-50 sm:size-9 min-[1460px]:size-8"
                  aria-label="Profile"
                  title="Profile"
                >
                  <UserIcon size={18} className="sm:size-5 min-[1460px]:size-[18px]" strokeWidth={2} aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((o) => !o)}
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Account menu"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-700/35 bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100 sm:size-9 min-[1460px]:size-8"
                >
                  <ChevronDown
                    size={16}
                    className={`shrink-0 opacity-80 transition sm:size-[18px] min-[1460px]:size-4 ${isAccountMenuOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {isAccountMenuOpen ? (
                  <div
                    className="absolute right-0 top-full z-[80] mt-1 min-w-[11rem] rounded-sm border border-emerald-800/20 bg-parchment-50 py-1 shadow-[0_12px_30px_rgba(74,56,41,0.14)]"
                    role="menu"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void handleSignOut()}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-parchment-950 transition hover:bg-red-50/90"
                    >
                      <LogOut size={16} className="shrink-0 text-stone-600" aria-hidden />
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/sign-up-login-screen"
                className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-sm border px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition sm:px-3 sm:py-2 sm:text-[11px] lg:text-[12px] min-[1460px]:px-2 min-[1460px]:py-1 min-[1460px]:text-[9px] ${
                  pendingSignIn
                    ? 'border-sky-600/50 bg-sky-50/90 text-sky-900 hover:bg-sky-100'
                    : 'border-parchment-500/60 bg-transparent text-parchment-900 hover:bg-parchment-150/90'
                }`}
              >
                {pendingSignIn ? 'Sign In' : 'Join Now'}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsWalletModalOpen(true)}
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-sm border border-parchment-800 bg-parchment-800 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-parchment-50 shadow-sm transition hover:bg-parchment-900 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-[11px] lg:text-[12px] min-[1460px]:gap-1 min-[1460px]:px-2 min-[1460px]:py-1 min-[1460px]:text-[9px]"
            >
              <Wallet size={15} className="sm:size-[17px] min-[1460px]:size-[14px]" />
              <span
                className="max-w-[5.5rem] truncate sm:max-w-[7rem] lg:max-w-[9rem] min-[1460px]:max-w-[6.5rem]"
                title={shortAddress ?? undefined}
              >
                {shortAddress ?? 'Connect Wallet'}
              </span>
            </button>
          </div>
          </div>
        </div>
        <div className="h-[2px] w-full overflow-hidden bg-transparent">
          {isRouteTransitioning && (
            <div className="animate-route-status-sweep h-full w-full origin-left bg-parchment-600" />
          )}
        </div>
      </header>
      </div>

      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-start justify-center bg-parchment-950/35 p-4 pt-[min(20vh,8rem)] backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-search-title"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-sm border border-parchment-400/60 bg-parchment-50 p-5 text-parchment-950 shadow-[0_20px_50px_rgba(74,56,41,0.18)] sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-4">
              <h3 id="site-search-title" className="font-serif text-lg font-semibold tracking-tight sm:text-xl">
                Search
              </h3>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="rounded-sm p-1.5 text-stone-500 transition hover:bg-parchment-150 hover:text-parchment-950"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-3 text-sm text-stone-600">NFTs, jobs, pages, or topics — press Enter to go.</p>
            <div className="relative mt-4">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search NFTs, jobs…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSearch();
                }}
                className="input-field pl-11 text-base"
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="rounded-sm border border-parchment-400/80 px-4 py-2 text-sm font-medium text-parchment-900 transition hover:bg-parchment-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={runSearch}
                className="rounded-sm border border-parchment-800 bg-parchment-800 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-parchment-50 transition hover:bg-parchment-900"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {isWalletModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-parchment-950/30 p-4 backdrop-blur-[3px]">
          <div className="w-full max-w-md rounded-sm border border-parchment-400/60 bg-parchment-50 p-6 text-parchment-950 shadow-[0_20px_50px_rgba(74,56,41,0.15)]">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h3 className="font-serif text-xl font-semibold tracking-tight">Connect a wallet</h3>
              <button
                type="button"
                onClick={() => setIsWalletModalOpen(false)}
                className="rounded-sm p-1.5 text-stone-500 transition hover:bg-parchment-150 hover:text-parchment-950"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mt-5">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={walletSearch}
                onChange={(e) => setWalletSearch(e.target.value)}
                placeholder="Search wallet"
                className="input-field pl-10"
              />
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {filteredWallets.map((wallet) => (
                <button
                  key={wallet.name}
                  type="button"
                  onClick={() => {
                    if (wallet.connect) {
                      void wallet.connect();
                      return;
                    }
                    window.alert(`${wallet.name} integration is coming soon.`);
                  }}
                  className="flex flex-col items-center gap-2 rounded-sm border border-transparent p-2 transition hover:border-parchment-300 hover:bg-parchment-100"
                >
                  <div className={`h-12 w-12 rounded-sm bg-gradient-to-br shadow-inner ${wallet.tone}`} />
                  <span className="text-center text-[11px] font-medium leading-tight text-stone-700">{wallet.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <aside
        className="pointer-events-none fixed right-0 top-1/2 z-[60] flex -translate-y-1/2 flex-col gap-3 [&>button]:pointer-events-auto"
        aria-label="Quick actions"
      >
        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-parchment-400/70 bg-parchment-50 text-parchment-900 shadow-md transition hover:border-parchment-500 hover:bg-parchment-100"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} className="text-stone-700" strokeWidth={2} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-parchment-500" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-parchment-400/70 bg-parchment-50 text-parchment-900 shadow-md transition hover:border-parchment-500 hover:bg-parchment-100"
          aria-label="Search"
          title="Search"
        >
          <Search size={20} className="text-stone-700" strokeWidth={2} />
        </button>
      </aside>

      <main
        className={`mx-auto w-full max-w-[1200px] flex-1 bg-parchment-100 py-6 px-5 transition-opacity duration-300 sm:px-6 lg:px-8 ${
          isRouteTransitioning ? 'translate-y-px opacity-90' : 'translate-y-0 opacity-100'
        }`}
      >
        {children}
      </main>

      <AppFooter />
    </div>
  );
}
