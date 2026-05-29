import {
  getBaseZodiacRepresentation,
  getSolanaZodiacRepresentation,
  getZodiacToken,
  type ZodiacChain,
  type ZodiacRepresentation,
  type ZodiacSign
} from "../core/index.js";
import type { ZodiacMarketAdapter, ZodiacMarketData } from "./types.js";
import { readMarketSafely } from "./safe-read.js";

export async function getZodiacMarket(
  adapter: ZodiacMarketAdapter,
  sign: ZodiacSign,
  options: { readonly chain?: ZodiacChain; readonly signal?: AbortSignal } = {}
): Promise<ZodiacMarketData> {
  const representation =
    options.chain === "base"
      ? getBaseZodiacRepresentation(sign)
      : getSolanaZodiacRepresentation(sign);

  return getZodiacMarketByRepresentation(adapter, representation, options);
}

export function getSolanaZodiacMarket(
  adapter: ZodiacMarketAdapter,
  sign: ZodiacSign,
  options: { readonly signal?: AbortSignal } = {}
): Promise<ZodiacMarketData> {
  return getZodiacMarket(adapter, sign, { ...options, chain: "solana" });
}

export function getBaseZodiacMarket(
  adapter: ZodiacMarketAdapter,
  sign: ZodiacSign,
  options: { readonly signal?: AbortSignal } = {}
): Promise<ZodiacMarketData> {
  return getZodiacMarket(adapter, sign, { ...options, chain: "base" });
}

export function getZodiacMarketByRepresentation(
  adapter: ZodiacMarketAdapter,
  representation: ZodiacRepresentation,
  options: { readonly signal?: AbortSignal } = {}
): Promise<ZodiacMarketData> {
  const token = {
    ...getZodiacToken(representation.sign),
    mintAddress: representation.address
  };

  return readMarketSafely(adapter, {
    sign: representation.sign,
    token,
    ...(options.signal ? { signal: options.signal } : {})
  });
}
