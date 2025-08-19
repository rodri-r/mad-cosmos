// src/lib/fetchNftsCryptoOrg.ts
import axios from 'axios';
import { NFT } from './fetchNfts';

// Add a small delay to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchNftsCryptoOrg(
  restEndpoint: string,
  owner: string
): Promise<NFT[]> {
  try {
    const nftsRes = await axios.get(`${restEndpoint}/chainmain/nft/nfts`, {
      params: { owner },
      timeout: 10000,
    });
    const idCollections = nftsRes.data?.owner?.id_collections ?? [];

    const nfts: NFT[] = [];

    // For each collection, fetch metadata
    for (const coll of idCollections) {
      const denomId = coll.denom_id;
      const tokenIds = coll.token_ids;

      try {
        // Add delay between requests to avoid rate limiting
        await delay(200);

        const collRes = await axios.get(
          `${restEndpoint}/chainmain/nft/collections/${denomId}`,
          { timeout: 10000 }
        );
        const collectionNfts = collRes.data?.collection?.nfts ?? [];

        // Create a map of tokenId → metadata
        const tokenMetadataMap = collectionNfts.reduce((map: any, nft: any) => {
          let data = {};
          try {
            data = JSON.parse(nft.data);
          } catch (e) {
            console.warn(`Failed to parse data for ${nft.id}`);
          }
          map[nft.id] = data;
          return map;
        }, {});

        // Add each token the user owns
        for (const tokenId of tokenIds) {
          const metadata = tokenMetadataMap[tokenId] || {};

          const imageUrl =
            metadata.image ||
            metadata.Image ||
            undefined;

          nfts.push({
            id: tokenId,
            classId: denomId,
            collectionName: collRes.data?.collection?.denom?.name || denomId,
            name: metadata.name || nft.name || `#${tokenId}`,
            uri: imageUrl,
            imageUrl: imageUrl,
          });
        }
      } catch (e: any) {
        console.warn(`Failed to fetch metadata for collection ${denomId}`, e.message);
        // Fallback: add tokens with minimal data
        for (const tokenId of tokenIds) {
          nfts.push({
            id: tokenId,
            classId: denomId,
            uri: undefined,
            imageUrl: undefined,
          });
        }
      }
    }

    return nfts;
  } catch (e: any) {
    console.error('Failed to fetch Crypto.org NFTs', e);
    return [];
  }
}
