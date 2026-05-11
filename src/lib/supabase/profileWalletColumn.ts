/**
 * PostgREST may say "does not exist" OR "schema cache" / "could not find"
 * when `profiles.wallet_address` was never migrated.
 */
export function isProfilesWalletColumnError(message?: string): boolean {
  const m = (message ?? '').toLowerCase();
  if (!m.includes('wallet_address')) return false;
  return (
    m.includes('does not exist') ||
    m.includes('schema cache') ||
    m.includes('could not find')
  );
}

export function includeWalletInProfileDb(): boolean {
  return process.env.PROFILE_SYNC_INCLUDE_WALLET === 'true';
}
