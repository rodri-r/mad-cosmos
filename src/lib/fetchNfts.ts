// src/lib/fetchNfts.ts
import { ChainInfo, NFT } from './fetchNfts';
import { fetchNftsStargaze } from './fetchNftsStargaze';
import { fetchNftsCryptoOrg } from './fetchNftsCryptoOrg';

export async function fetchNFTs(chain: ChainInfo, owner: string): Promise<NFT[]> {
  if (chain.graphqlEndpoint) {
    return await fetchNftsStargaze(chain.graphqlEndpoint, owner);
  } else if (chain.restEndpoint) {
    return await fetchNftsCryptoOrg(chain.restEndpoint, owner);
  } else {
    throw new Error(`No NFT endpoint configured for ${chain.name}`);
  }
}

export async function resolveMetadata(uri?: string): Promise<any | null> {
  if (!uri) return null;

  const url = uri.startsWith('ipfs://')
    ? `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`
    : uri;

  try {
    const { data } = await axios.get(url, { timeout: 8000 });
    return data;
  } catch {
    return null;
  }
}
