import { getSupabaseBrowser } from '@/lib/supabase/client';

/** Staged when user connects wallet before signing in (sign-up flow). */
export const PENDING_WALLET_SESSION_KEY = 'trueassess_pending_wallet';

/**
 * Saves connected EVM address to auth metadata and profile API when logged in;
 * otherwise stores in sessionStorage for sign-up / next login.
 */
export async function syncConnectedWalletToProfile(address: string): Promise<{ mode: 'session' | 'pending' }> {
  const normalized = address.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalized)) {
    return { mode: 'pending' };
  }

  const supabase = getSupabaseBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(PENDING_WALLET_SESSION_KEY, normalized);
      } catch {
        /* ignore quota */
      }
    }
    return { mode: 'pending' };
  }

  await supabase.auth.updateUser({ data: { wallet_address: normalized } });
  await fetch('/api/auth/profile-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: normalized, applyUserMetadata: true }),
  });

  return { mode: 'session' };
}

/** Call after sign-in to move a pre-connect wallet into the account + profile. */
export async function flushPendingWalletToProfile(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const raw = sessionStorage.getItem(PENDING_WALLET_SESSION_KEY)?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return false;

  const supabase = getSupabaseBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return false;

  sessionStorage.removeItem(PENDING_WALLET_SESSION_KEY);
  await supabase.auth.updateUser({ data: { wallet_address: raw } });
  await fetch('/api/auth/profile-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: raw, applyUserMetadata: true }),
  });
  return true;
}
