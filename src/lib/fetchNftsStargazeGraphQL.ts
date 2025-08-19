// src/lib/fetchNftsStargazeGraphQL.ts
import { request, gql } from 'graphql-request';
import { NFT } from './fetchNfts';

const TOKENS_BY_OWNER = gql`
  query TokensByOwner($owner: String!) {
    tokens(owner: $owner) {
      tokens {
        collection {
          contractAddress
        }
        tokenId
      }
    }
  }
`;

const TOKEN_DETAIL = gql`
  query TokenDetail($collectionAddr: String!, $tokenId: String!) {
    token(collectionAddr: $collectionAddr, tokenId: $tokenId) {
      name
      imageUrl
      tokenUri
      collection {
        name
        address
      }
    }
  }
`;

export async function fetchNftsStargazeGraphQL(
  graphqlEndpoint: string,
  owner: string
): Promise<NFT[]> {
  const listData = await request(graphqlEndpoint, TOKENS_BY_OWNER, { owner });
  const rawTokens = listData?.tokens?.tokens ?? [];

  const enriched: NFT[] = await Promise.all(
    rawTokens.map(async (t: any) => {
      const collectionAddr = t.collection?.contractAddress;
      const tokenId = t.tokenId;

      if (!collectionAddr || !tokenId) {
        return {
          id: tokenId ?? '',
          classId: collectionAddr ?? '',
          uri: undefined,
          imageUrl: undefined,
        };
      }

      try {
        const detail = await request(graphqlEndpoint, TOKEN_DETAIL, {
          collectionAddr,
          tokenId,
        });

        const token = detail?.token ?? {};

        return {
          id: tokenId,
          classId: token.collection?.address ?? collectionAddr,
          collectionName: token.collection?.name,
          name: token.name,
          uri: token.tokenUri,
          imageUrl: token.imageUrl,
        };
      } catch (e) {
        console.warn(
          `Failed to fetch detailed data for ${collectionAddr}#${tokenId}`,
          e instanceof Error ? e.message : e
        );
        return {
          id: tokenId,
          classId: collectionAddr,
          uri: undefined,
          imageUrl: undefined,
        };
      }
    })
  );

  return enriched;
}
