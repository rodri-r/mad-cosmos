// src/chainConfig.ts
export interface ChainInfo {
  chainId: string;
  name: string;
  prefix: string;
  explorer?: string;
  // Stargaze uses GraphQL
  graphqlEndpoint?: string;
  // Crypto.org uses REST
  restEndpoint?: string;
}

export const CHAINS: ChainInfo[] = [
  {
    chainId: 'stargaze-1',
    name: 'Stargaze',
    prefix: 'stars',
    explorer: 'https://mintscan.io/stargaze',
    graphqlEndpoint: 'https://graphql.mainnet.stargaze-apis.com/graphql',
  },
  {
    chainId: 'crypto-org-chain-mainnet-1',
    name: 'Crypto.org PoS',
    prefix: 'cro',
    explorer: 'https://mintscan.io/cryptoorg',
    restEndpoint: 'https://cryptocom-api.polkachu.com',
  },
];
