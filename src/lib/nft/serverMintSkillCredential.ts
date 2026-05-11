import type { SupabaseClient } from '@supabase/supabase-js';
import { getAddress } from 'thirdweb';
import { createThirdwebClient, getContract, sendTransaction, waitForReceipt } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { mintTo } from 'thirdweb/extensions/erc721';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { isProfilesWalletColumnError, includeWalletInProfileDb } from '@/lib/supabase/profileWalletColumn';

export type SkillCredentialMintTrigger = 'submit' | 'claim';

type MintParams = {
  admin: SupabaseClient;
  userId: string;
  attemptId: string;
  resultId: string | null;
  score: number;
  passed: boolean;
  credentialId?: string | null;
  trigger: SkillCredentialMintTrigger;
};

function parseMinScore(): number {
  const n = Number.parseInt(process.env.NFT_MINT_MIN_SCORE ?? '86', 10);
  return Number.isFinite(n) ? n : 86;
}

function mintEnabled(): boolean {
  return process.env.NFT_SERVER_MINT_ENABLED === 'true';
}

function triggerAllowed(trigger: SkillCredentialMintTrigger): boolean {
  if (trigger === 'submit') return process.env.NFT_MINT_ON_SUBMIT === 'true';
  return process.env.NFT_MINT_ON_CLAIM !== 'false';
}

function normalizedEthAddress(raw: string): string | null {
  const trimmed = raw.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null;
  try {
    return getAddress(trimmed);
  } catch {
    return null;
  }
}

function thirdwebServerClient() {
  const secret = process.env.THIRDWEB_SECRET_KEY?.trim();
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID?.trim();
  if (secret) return createThirdwebClient({ secretKey: secret });
  if (clientId) return createThirdwebClient({ clientId });
  return null;
}

export async function tryServerMintSkillCredential(p: MintParams): Promise<void> {
  try {
    await tryServerMintSkillCredentialInner(p);
  } catch (e) {
    console.warn('[NFT mint] unexpected', e instanceof Error ? e.message : e);
  }
}

async function tryServerMintSkillCredentialInner(p: MintParams): Promise<void> {
  const {
    admin,
    userId,
    attemptId,
    resultId,
    score,
    passed,
    credentialId,
    trigger,
  } = p;

  if (!mintEnabled() || !triggerAllowed(trigger)) return;
  const minScore = parseMinScore();
  if (!passed || score < minScore) return;

  const pk = process.env.NFT_MINTER_PRIVATE_KEY?.trim();
  const contractRaw = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS?.trim();
  const chainIdRaw = process.env.NEXT_PUBLIC_CHAIN_ID ?? '84532';
  const chainId = Number.parseInt(chainIdRaw, 10);

  const imageUrl = process.env.NFT_DEFAULT_IMAGE_URL?.trim() || 'https://placehold.co/600x600/png?text=TrueAssess';
  const nameTpl = process.env.NFT_CREDENTIAL_NAME_TEMPLATE?.trim() || 'TrueAssess Credential';
  const defaultDesc = credentialId ? `Credential ${credentialId}` : `Skill test attempt ${attemptId}`;

  if (!pk || !normalizedEthAddress(contractRaw ?? '') || !Number.isFinite(chainId) || chainId <= 0) {
    return;
  }

  const contractAddr = normalizedEthAddress(contractRaw!)!;

  let recipient: string | null = null;

  if (includeWalletInProfileDb()) {
    const walletRes = await admin.from('profiles').select('wallet_address').eq('id', userId).maybeSingle();

    const missingProfileCol = walletRes.error && isProfilesWalletColumnError(walletRes.error.message);
    if (missingProfileCol || walletRes.error) {
      if (!missingProfileCol) {
        console.warn('[NFT mint]', walletRes.error?.message ?? 'profile fetch failed');
      }
      return;
    }

    recipient = normalizedEthAddress(String(walletRes.data?.wallet_address ?? ''));
  } else {
    const { data: authPack, error: authErr } = await admin.auth.admin.getUserById(userId);
    if (authErr || !authPack?.user) {
      console.warn('[NFT mint]', authErr?.message ?? 'user fetch failed');
      return;
    }
    const md = (authPack.user.user_metadata ?? {}) as Record<string, unknown>;
    recipient = normalizedEthAddress(String(md.wallet_address ?? md.walletAddress ?? ''));
  }

  if (!recipient) return;

  const { data: existing } = await admin
    .from('skill_test_nft_mints')
    .select('id, status, tx_hash')
    .eq('attempt_id', attemptId)
    .maybeSingle();

  if (existing?.status === 'confirmed' && existing.tx_hash) return;

  if (!existing) {
    const { error: insErr } = await admin.from('skill_test_nft_mints').insert({
      user_id: userId,
      attempt_id: attemptId,
      result_id: resultId,
      credential_id: credentialId ?? null,
      wallet_address: recipient,
      chain_id: chainId,
      contract_address: contractAddr.toLowerCase(),
      status: 'pending',
      trigger_source: trigger,
    });

    if (insErr?.code === '23505') {
      return;
    }
    if (insErr?.message?.includes('does not exist')) {
      return;
    }
    if (insErr) {
      console.warn('[NFT mint]', insErr.message);
      return;
    }
  } else if (existing.status === 'confirmed') {
    return;
  } else if (existing.status !== 'pending' && existing.status !== 'failed') {
    return;
  }

  const client = thirdwebServerClient();
  if (!client) return;

  let account;
  try {
    account = privateKeyToAccount({ client, privateKey: pk.startsWith('0x') ? pk : `0x${pk}` });
  } catch (e) {
    console.warn('[NFT mint] bad private key', e);
    await admin
      .from('skill_test_nft_mints')
      .update({
        status: 'failed',
        error_message: 'Invalid NFT_MINTER_PRIVATE_KEY',
        updated_at: new Date().toISOString(),
      })
      .eq('attempt_id', attemptId);
    return;
  }

  const chain = defineChain(chainId);
  const contract = getContract({
    client,
    chain,
    address: contractAddr as `0x${string}`,
  });

  const nftName =
    credentialId && nameTpl.includes('{id}')
      ? nameTpl.replaceAll('{id}', credentialId).replaceAll('{score}', String(score))
      : `${nameTpl}${credentialId ? ` — ${credentialId}` : ''}`;

  try {
    const tx = mintTo({
      contract,
      to: recipient,
      nft: {
        name: nftName.slice(0, 200),
        description: defaultDesc.slice(0, 2000),
        image: imageUrl,
      },
    });

    const sent = await sendTransaction({ account, transaction: tx });

    await waitForReceipt({
      client,
      chain,
      transactionHash: sent.transactionHash,
    }).catch(() => {
      /* hash stored; indexer can reconcile */
    });

    await admin
      .from('skill_test_nft_mints')
      .update({
        status: 'confirmed',
        tx_hash: sent.transactionHash,
        updated_at: new Date().toISOString(),
      })
      .eq('attempt_id', attemptId);
  } catch (e) {
    const msg = e instanceof Error ? e.message.slice(0, 2000) : 'Mint failed';
    console.warn('[NFT mint]', msg);
    await admin
      .from('skill_test_nft_mints')
      .update({
        status: 'failed',
        error_message: msg,
        updated_at: new Date().toISOString(),
      })
      .eq('attempt_id', attemptId);
  }
}
