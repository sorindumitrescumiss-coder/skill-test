'use client';

import React, { useMemo, useState } from 'react';
import { createThirdwebClient, getContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { mintTo } from 'thirdweb/extensions/erc721';
import { ConnectButton, useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

function isEthAddress(s: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(s.trim());
}

export default function CreateNFTAdminClient() {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? '';
  const contractAddress = (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ?? '').trim();
  const chainIdRaw = process.env.NEXT_PUBLIC_CHAIN_ID ?? '84532';
  const chainId = Number.parseInt(chainIdRaw, 10);

  const [recipient, setRecipient] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const client = useMemo(() => {
    if (!clientId) return null;
    return createThirdwebClient({ clientId });
  }, [clientId]);

  const chain = useMemo(() => {
    if (!Number.isFinite(chainId) || chainId <= 0) return null;
    return defineChain(chainId);
  }, [chainId]);

  const contract = useMemo(() => {
    if (!client || !chain || !isEthAddress(contractAddress)) return null;
    return getContract({ client, chain, address: contractAddress as `0x${string}` });
  }, [client, chain, contractAddress]);

  const account = useActiveAccount();
  const { mutate: sendTx, isPending } = useSendTransaction();

  const configOk = Boolean(client && chain && contract);

  const handleMint = () => {
    if (!contract || !account) {
      toast.error('Connect a wallet first.');
      return;
    }
    const to = recipient.trim() || account.address;
    if (!isEthAddress(to)) {
      toast.error('Enter a valid recipient address (0x…40 hex).');
      return;
    }
    if (!name.trim()) {
      toast.error('Name is required.');
      return;
    }
    if (!image.trim()) {
      toast.error('Image URL is required (metadata).');
      return;
    }

    const tx = mintTo({
      contract,
      to,
      nft: {
        name: name.trim(),
        description: description.trim() || undefined,
        image: image.trim(),
      },
    });

    sendTx(tx, {
      onSuccess: () => {
        toast.success('Mint transaction submitted. Confirm in your wallet explorer if needed.');
      },
      onError: (e) => {
        const msg = e instanceof Error ? e.message : 'Mint failed.';
        toast.error(msg);
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#4f46e5]/25 bg-[#f4ebe1] text-[#4f46e5]">
            <ImagePlus className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Admin</p>
            <h1 className="font-serif text-2xl font-semibold italic text-parchment-950">Create NFT</h1>
            <p className="mt-1 text-sm text-stone-600">
              Mint from your deployed ERC-721 collection. Your connected wallet must have mint permission on the contract.
            </p>
          </div>
        </div>
        <div className="shrink-0 [&_button]:text-sm">
          {client && chain ? (
            <ConnectButton client={client} chain={chain} />
          ) : (
            <span className="inline-block rounded-lg border border-parchment-300 bg-parchment-100 px-4 py-2 text-sm text-stone-600">
              Connect wallet (needs client ID)
            </span>
          )}
        </div>
      </div>

      {!clientId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Set <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_THIRDWEB_CLIENT_ID</code> in{' '}
          <code className="rounded bg-amber-100 px-1">.env</code>. Create a free client ID in the thirdweb dashboard.
        </div>
      ) : null}

      {clientId && (!Number.isFinite(chainId) || chainId <= 0) ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
          Invalid <code className="rounded bg-red-100 px-1">NEXT_PUBLIC_CHAIN_ID</code>.
        </div>
      ) : null}

      {clientId && Number.isFinite(chainId) && chainId > 0 && !isEthAddress(contractAddress) ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Set <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_NFT_CONTRACT_ADDRESS</code> to your ERC-721 contract
          (e.g. thirdweb &quot;NFT Collection&quot;) on chain {chainId}.
        </div>
      ) : null}

      <div className="mt-6 space-y-4 rounded-xl border border-parchment-300/80 bg-parchment-150/95 p-6 shadow-[0_8px_28px_-12px_rgba(30,41,59,0.18)]">
        <div>
          <label htmlFor="nft-recipient" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Recipient (optional)
          </label>
          <input
            id="nft-recipient"
            type="text"
            autoComplete="off"
            placeholder="Defaults to your connected wallet"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm text-parchment-950 placeholder:text-stone-400 focus:border-[#4f46e5] focus:outline-none focus:ring-1 focus:ring-[#4f46e5]"
          />
        </div>
        <div>
          <label htmlFor="nft-name" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Name
          </label>
          <input
            id="nft-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm text-parchment-950 focus:border-[#4f46e5] focus:outline-none focus:ring-1 focus:ring-[#4f46e5]"
          />
        </div>
        <div>
          <label htmlFor="nft-desc" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Description
          </label>
          <textarea
            id="nft-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full resize-y rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm text-parchment-950 focus:border-[#4f46e5] focus:outline-none focus:ring-1 focus:ring-[#4f46e5]"
          />
        </div>
        <div>
          <label htmlFor="nft-image" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Image URL
          </label>
          <input
            id="nft-image"
            type="url"
            placeholder="https://… or ipfs://…"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm text-parchment-950 placeholder:text-stone-400 focus:border-[#4f46e5] focus:outline-none focus:ring-1 focus:ring-[#4f46e5]"
          />
          <p className="mt-1 text-xs text-stone-500">
            thirdweb uploads metadata when minting; the image field should resolve publicly.
          </p>
        </div>

        <button
          type="button"
          disabled={!configOk || !account || isPending || !clientId}
          onClick={handleMint}
          className="w-full rounded-lg bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5a4639] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Sending…' : 'Mint NFT'}
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-stone-500">
        Selling on a marketplace uses a separate listing step (for example{' '}
        <a href="https://thirdweb.com" className="text-[#4f46e5] underline hover:no-underline" target="_blank" rel="noreferrer">
          thirdweb Marketplace
        </a>
        ).
      </p>
    </div>
  );
}
