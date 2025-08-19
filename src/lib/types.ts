// src/lib/types.ts
/** Minimal NFT shape used throughout the app */
export interface NFT {
  /** Unique token id (stringified number) */
  id: string;
  /** Collection / class identifier */
  classId: string;
  /** Human‑readable name (optional) */
  name?: string;
  /** Direct image URL (optional) */
  imageUrl?: string;
  /** URI that points to off‑chain metadata (IPFS, HTTP, …) */
  uri?: string;
  /** Collection name (optional) */
  collectionName?: string;
  /** Any extra fields returned by the chain’s API – keep it loosely typed */
  [key: string]: any;
}
