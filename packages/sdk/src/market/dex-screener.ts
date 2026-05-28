import type { MarketAdapterConfig, ZodiacMarketAdapter } from "./types.js";
import { unavailableMarketData } from "./unavailable.js";

interface DexScreenerPair {
  readonly priceUsd?: string;
  readonly marketCap?: number;
  readonly fdv?: number;
  readonly volume?: { readonly h24?: number };
  readonly liquidity?: { readonly usd?: number };
  readonly priceChange?: { readonly h24?: number };
}

interface DexScreenerResponse {
  readonly pairs?: readonly DexScreenerPair[] | null;
}

export function createDexScreenerMarketAdapter(config: MarketAdapterConfig = {}): ZodiacMarketAdapter {
  const endpoint = config.endpoint ?? "https://api.dexscreener.com/latest/dex/tokens";
  const fetchImpl = config.fetchImpl ?? globalThis.fetch;

  return {
    id: "dex-screener",
    readMarket: async (options) => {
      if (!options.token.mintAddress) {
        return unavailableMarketData(options, "dex-screener", {
          code: "not-configured",
          message: "No mint address is configured."
        });
      }

      if (!fetchImpl) {
        return unavailableMarketData(options, "dex-screener", {
          code: "not-configured",
          message: "No fetch implementation is available."
        });
      }

      let response: Response;

      try {
        const url = `${endpoint.replace(/\/$/u, "")}/${options.token.mintAddress}`;
        const requestInit: RequestInit = options.signal ? { signal: options.signal } : {};
        response = await fetchImpl(url, requestInit);
      } catch (error) {
        return unavailableMarketData(options, "dex-screener", {
          code: "adapter-error",
          message: error instanceof Error ? error.message : "DEX Screener request failed."
        });
      }

      if (!response.ok) {
        return unavailableMarketData(options, "dex-screener", {
          code: "http-error",
          message: `DEX Screener returned HTTP ${response.status}.`
        });
      }

      let payload: unknown;

      try {
        payload = await response.json();
      } catch (error) {
        return unavailableMarketData(options, "dex-screener", {
          code: "invalid-response",
          message: error instanceof Error ? error.message : "DEX Screener response was not valid JSON."
        });
      }

      if (!isDexScreenerResponse(payload)) {
        return unavailableMarketData(options, "dex-screener", {
          code: "invalid-response",
          message: "DEX Screener response was malformed."
        });
      }

      const pair = payload.pairs?.[0];

      if (!pair?.priceUsd) {
        return unavailableMarketData(options, "dex-screener", {
          code: "no-market",
          message: "No market pair was returned for this mint."
        });
      }

      const priceUsd = Number(pair.priceUsd);

      if (!Number.isFinite(priceUsd)) {
        return unavailableMarketData(options, "dex-screener", {
          code: "invalid-response",
          message: "Market price was not numeric."
        });
      }

      return {
        sign: options.sign,
        token: options.token,
        priceUsd,
        marketCap: toFiniteNumber(pair.marketCap),
        fdv: toFiniteNumber(pair.fdv),
        liquidity: toFiniteNumber(pair.liquidity?.usd),
        volume24h: toFiniteNumber(pair.volume?.h24),
        change24h: toFiniteNumber(pair.priceChange?.h24),
        supply: null,
        source: "dex-screener",
        lastUpdated: new Date().toISOString(),
        status: "ok"
      };
    }
  };
}

function toFiniteNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isDexScreenerResponse(value: unknown): value is DexScreenerResponse {
  if (!isRecord(value)) {
    return false;
  }

  return value.pairs === undefined || value.pairs === null || Array.isArray(value.pairs);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
