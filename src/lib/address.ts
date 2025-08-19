import { fromBech32 } from '@cosmjs/encoding';
import { CHAINS, ChainInfo } from '../chainConfig';

/**
 * Returns true if the string is a valid Cosmos bech‑32 address.
 */
export function isValidCosmosAddress(addr: string): boolean {
  try {
    fromBech32(addr);
    return true;
  } catch {
    return false;
  }
}

/**
 * Tries to infer a chain from the address prefix.
 * Returns the matching ChainInfo or undefined.
 */
export function inferChainFromAddress(addr: string): ChainInfo | undefined {
  try {
    const { prefix } = fromBech32(addr);
    return CHAINS.find((c) => c.prefix === prefix);
  } catch {
    return undefined;
  }
}
