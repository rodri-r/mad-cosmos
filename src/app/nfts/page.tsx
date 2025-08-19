// src/app/nfts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { CHAINS, type ChainInfo } from '@/chainConfig';
import {
  fetchNFTs,
  resolveMetadata,
  type NFT,
} from '@/lib/fetchNfts';
import {
  isValidCosmosAddress,
  inferChainFromAddress,
} from '@/lib/address';

// Import the stylesheet we just created
import './nfts.css';

export default function NFTPage() {
  /* ---------- State ---------- */
  const [address, setAddress] = useState<string>('');
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<ChainInfo>(CHAINS[0]);
  const [autoDetect, setAutoDetect] = useState<boolean>(true);

  const [nfts, setNfts] = useState<NFT[]>([]);
  const [metadataMap, setMetadataMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  /* ---------- Handlers ---------- */
  const handleAddressChange = (val: string) => {
    const trimmed = val.trim();
    setAddress(trimmed);
    setAddressError(
      trimmed && !isValidCosmosAddress(trimmed)
        ? 'Invalid Cosmos address'
        : null
    );
  };

  // Auto‑detect chain when a valid address is entered
  useEffect(() => {
    if (autoDetect && isValidCosmosAddress(address)) {
      const inferred = inferChainFromAddress(address);
      if (inferred) setSelectedChain(inferred);
    }
  }, [address, autoDetect]);

  const loadNFTs = async () => {
    if (!address || addressError) {
      alert('Enter a valid address');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const raw = await fetchNFTs(selectedChain, address);
      setNfts(raw);

      // Resolve missing metadata (e.g. when the NFT only gives a URI)
      const metaPromises = raw.map(async (n) => {
        if (n.uri && !n.imageUrl) {
          const meta = await resolveMetadata(n.uri);
          return [n.id, meta];
        }
        return [n.id, null];
      });
      const entries = await Promise.all(metaPromises);
      setMetadataMap(Object.fromEntries(entries));
    } catch (e: any) {
      alert(`Failed to load NFTs: ${e.message}`);
      setNfts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="nft-page">
      {/* ==== Header ==== */}
      <section className="nft-page__header">
        <h1 className="nft-page__title">Cosmos NFT Viewer</h1>
        <p className="nft-page__subtitle">
          Paste a Cosmos address and explore its NFTs on any supported chain.
        </p>
      </section>

      {/* ==== Form ==== */}
      <section className="nft-form">
        <div className="nft-form__row">
          {/* Auto‑detect toggle */}
          <label className="nft-form__label">
            <input
              type="checkbox"
              checked={autoDetect}
              onChange={(e) => setAutoDetect(e.target.checked)}
            />
            Auto‑detect chain
          </label>

          {/* Chain selector – disabled when auto‑detect is on */}
          <select
            disabled={autoDetect}
            value={selectedChain.chainId}
            onChange={(e) =>
              setSelectedChain(
                CHAINS.find((c) => c.chainId === e.target.value) ?? CHAINS[0]
              )
            }
            className="nft-form__select"
          >
            {CHAINS.map((c) => (
              <option key={c.chainId} value={c.chainId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Address input */}
        <div className="nft-form__row">
          <input
            type="text"
            placeholder="stars1... / cro1..."
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            className={`nft-form__input ${addressError ? 'error' : ''}`}
          />
          {addressError && (
            <span style={{ color: '#ef4444', fontSize: '.85rem' }}>
              {addressError}
            </span>
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={loadNFTs}
          disabled={!address || !!addressError}
          className="nft-form__button"
        >
          Show My NFTs
        </button>
      </section>

      {/* ==== Loading ==== */}
      {loading && (
        <div className="nft-loading">
          <div className="nft-loading__spinner" />
          <p>Loading NFTs …</p>
        </div>
      )}

      {/* ==== NFT grid ==== */}
      {hasSearched && !loading && nfts.length > 0 && (
        <section className="nft-grid">
          {nfts.map((n) => {
            const meta = metadataMap[n.id] || {};
            const title = n.name ?? `${n.classId} #${n.id}`;
            const subtitle = n.collectionName ?? n.classId;
            const imgSrc = n.imageUrl || n.uri;

            return (
              <article key={n.id} className="nft-card">
                {imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc}
                    alt={title}
                    className="nft-card__img"
                  />
                ) : (
                  <div className="nft-card__img" />
                )}
                <div className="nft-card__body">
                  <div className="nft-card__title">{title}</div>
                  <div className="nft-card__subtitle">{subtitle}</div>
                  <div className="nft-card__token">Token ID: {n.id}</div>
                  {meta.description && (
                    <p style={{ marginTop: '.4rem', fontSize: '.75rem' }}>
                      {meta.description}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* ==== Empty state ==== */}
      {hasSearched && !loading && nfts.length === 0 && (
        <section className="nft-empty">
          <svg
            className="nft-empty__icon"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3>No NFTs found</h3>
          <p>
            This address does not own any NFTs on{' '}
            <span style={{ color: '#81e6d9', fontWeight: 600 }}>
              {selectedChain.name}
            </span>
            .
          </p>
        </section>
      )}
    </div>
  );
}
