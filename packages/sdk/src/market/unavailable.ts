import type { MarketDataError, ZodiacMarketData, ZodiacMarketReadOptions } from "./types.js";

export function unavailableMarketData(
  options: ZodiacMarketReadOptions,
  source: string,
  error?: MarketDataError | string
): ZodiacMarketData {
  const normalizedError =
    typeof error === "string"
      ? {
          code: "adapter-error" as const,
          message: error
        }
      : error;

  return {
    sign: options.sign,
    token: options.token,
    priceUsd: null,
    marketCap: null,
    fdv: null,
    liquidity: null,
    volume24h: null,
    change24h: null,
    supply: null,
    source,
    lastUpdated: null,
    status: "unavailable",
    ...(normalizedError ? { error: normalizedError } : {})
  };
}
