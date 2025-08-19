// src/lib/fetchNftsStargaze.ts
import { request, gql } from 'graphql-request';
import { NFT } from './fetchNfts';

// Get list of tokens owned by address
const TOKENS_BY_OWNER = gql`
  query TokensByOwner($owner: String!) {
    tokens(owner: $owner) {
      tokens {
        collection { contractAddress }
        tokenId
      }
    }
  }
`;

// Get full metadata for a single token
const TOKEN_DETAIL = gql`
  query TokenDetail($collectionAddr: String!, $tokenId: String!) {
    token(collectionAddr: $collectionAddr, tokenId: $tokenId) {
      name
      imageUrl
      tokenUri
      collection {
        name
        contractAddress
      }
    }
  }
`;

export async function fetchNftsStargaze(
  graphqlEndpoint: string,
  owner: string
): Promise<NFT[]> {
  // Get list of tokens
  const listData = await request(graphqlEndpoint, TOKENS_BY_OWNER, { owner });
  const tokens = listData?.tokens?.tokens ?? [];

  // For each token, fetch full metadata
  const nfts = await Promise.all(
    tokens.map(async (t: any) => {
      const collectionAddr = t.collection?.contractAddress;
      const tokenId = t.tokenId;

      try {
        const detail = await request(graphqlEndpoint, TOKEN_DETAIL, {
          collectionAddr,
          tokenId,
        });

        const token = detail?.token ?? {};

        return {
          id: tokenId,
          classId: token.collection?.contractAddress ?? collectionAddr,
          collectionName: token.collection?.name,
          name: token.name,
          uri: token.tokenUri,
          imageUrl: token.imageUrl,
        };
      } catch (e) {
        console.warn(`Failed to fetch metadata for ${collectionAddr}#${tokenId}`);
        return {
          id: tokenId,
          classId: collectionAddr,
          uri: undefined,
          imageUrl: undefined,
        };
      }
    })
  );

  return nfts;
}
