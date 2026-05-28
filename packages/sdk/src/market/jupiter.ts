import type { MarketAdapterConfig, ZodiacMarketAdapter } from "./types.js";
import { unavailableMarketData } from "./unavailable.js";

interface JupiterPriceResponse {
  readonly data?: Record<string, { readonly price?: string | number }>;
}

export function createJupiterMarketAdapter(config: MarketAdapterConfig = {}): ZodiacMarketAdapter {
  const endpoint = config.endpoint ?? "https://api.jup.ag/price/v2";
  const fetchImpl = config.fetchImpl ?? globalThis.fetch;

  return {
    id: "jupiter",
    readMarket: async (options) => {
      if (!options.token.mintAddress) {
        return unavailableMarketData(options, "jupiter", {
          code: "not-configured",
          message: "No mint address is configured."
        });
      }

      if (!fetchImpl) {
        return unavailableMarketData(options, "jupiter", {
          code: "not-configured",
          message: "No fetch implementation is available."
        });
      }

      let response: Response;

      try {
        const url = new URL(endpoint);
        url.searchParams.set("ids", options.token.mintAddress);

        const requestInit: RequestInit = options.signal ? { signal: options.signal } : {};
        response = await fetchImpl(url, requestInit);
      } catch (error) {
        return unavailableMarketData(options, "jupiter", {
          code: "adapter-error",
          message: error instanceof Error ? error.message : "Jupiter request failed."
        });
      }

      if (!response.ok) {
        return unavailableMarketData(options, "jupiter", {
          code: "http-error",
          message: `Jupiter returned HTTP ${response.status}.`
        });
      }

      let payload: unknown;

      try {
        payload = await response.json();
      } catch (error) {
        return unavailableMarketData(options, "jupiter", {
          code: "invalid-response",
          message: error instanceof Error ? error.message : "Jupiter response was not valid JSON."
        });
      }

      if (!isJupiterPriceResponse(payload)) {
        return unavailableMarketData(options, "jupiter", {
          code: "invalid-response",
          message: "Jupiter response was malformed."
        });
      }

      const priceValue = payload.data?.[options.token.mintAddress]?.price;
      const priceUsd = typeof priceValue === "string" ? Number(priceValue) : priceValue ?? null;

      if (priceUsd === null || !Number.isFinite(priceUsd)) {
        return unavailableMarketData(options, "jupiter", {
          code: "no-market",
          message: "No price was returned for this mint."
        });
      }

      return {
        sign: options.sign,
        token: options.token,
        priceUsd,
        marketCap: null,
        fdv: null,
        liquidity: null,
        volume24h: null,
        change24h: null,
        supply: null,
        source: "jupiter",
        lastUpdated: new Date().toISOString(),
        status: "ok"
      };
    }
  };
}

function isJupiterPriceResponse(value: unknown): value is JupiterPriceResponse {
  if (!isRecord(value)) {
    return false;
  }

  if (value.data === undefined) {
    return true;
  }

  if (!isRecord(value.data)) {
    return false;
  }

  return Object.values(value.data).every((entry) => entry === undefined || isRecord(entry));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
