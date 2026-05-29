import { getAddress, isAddress } from "viem";
import type { ZodiacChain } from "./types.js";
import { isLikelyBase58Address } from "./validation.js";

export function isEvmAddress(address: string): boolean {
  return isAddress(address);
}

export function normalizeEvmAddress(address: string): string {
  return getAddress(address);
}

export function isSolanaAddressLike(address: string): boolean {
  return isLikelyBase58Address(address);
}

export function normalizeZodiacAddress(address: string, chain?: ZodiacChain): string {
  const trimmed = address.trim();

  if (chain === "base") {
    return normalizeEvmAddress(trimmed);
  }

  if (chain === "solana") {
    return trimmed;
  }

  return isEvmAddress(trimmed) ? normalizeEvmAddress(trimmed) : trimmed;
}
