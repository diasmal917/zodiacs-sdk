import type { ZodiacSign, ZodiacToken } from "../core/index.js";

export type MarketDataStatus = "ok" | "unavailable";

export interface MarketDataError {
  readonly code: "not-configured" | "no-market" | "http-error" | "invalid-response" | "adapter-error";
  readonly message: string;
}

export interface MarketSnapshot {
  readonly sign: ZodiacSign;
  readonly token: ZodiacToken;
  readonly priceUsd: number | null;
  readonly marketCap: number | null;
  readonly fdv: number | null;
  readonly liquidity: number | null;
  readonly volume24h: number | null;
  readonly change24h: number | null;
  readonly supply: number | null;
  readonly source: string;
  readonly lastUpdated: string | null;
  readonly status: MarketDataStatus;
  readonly error?: MarketDataError;
}

export interface MarketDataReadOptions {
  readonly sign: ZodiacSign;
  readonly token: ZodiacToken;
  readonly signal?: AbortSignal;
}

export interface MarketDataAdapter {
  readonly id: string;
  readonly readMarket: (options: MarketDataReadOptions) => Promise<MarketSnapshot>;
}

export interface MarketAdapterConfig {
  readonly endpoint?: string;
  readonly fetchImpl?: typeof fetch;
}

export type ZodiacMarketStatus = MarketDataStatus;
export type ZodiacMarketData = MarketSnapshot;
export type ZodiacMarketReadOptions = MarketDataReadOptions;
export type ZodiacMarketAdapter = MarketDataAdapter;
