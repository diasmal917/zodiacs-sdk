import { describe, expect, it, vi } from "vitest";
import type { ZodiacToken } from "../core/index.js";
import {
  createDexScreenerMarketAdapter,
  createJupiterMarketAdapter,
  createPlaceholderMarketAdapter,
  readMarketSafely
} from "./index.js";

const token = {
  sign: "aries",
  name: "Aries",
  slug: "aries",
  ticker: "ARIES",
  order: 1,
  element: "fire",
  modality: "cardinal",
  rulingPlanet: "Mars",
  symbol: "♈",
  archetype: "The Initiator",
  shortBio: "A cultural asset for symbolic identity.",
  decimals: 6,
  mintAddress: "GhFiFrExPY3proVF96oth1gESWA5QPQzdtb8cy8b1YZv",
  marketLinks: {
    dexScreener: "https://dexscreener.com/solana/GhFiFrExPY3proVF96oth1gESWA5QPQzdtb8cy8b1YZv",
    jupiter: "https://jup.ag/tokens/GhFiFrExPY3proVF96oth1gESWA5QPQzdtb8cy8b1YZv"
  }
} satisfies ZodiacToken;
const options = { sign: "aries" as const, token };

function mockResponse({
  jsonError,
  ok,
  payload,
  status = 200
}: {
  readonly jsonError?: Error;
  readonly ok: boolean;
  readonly payload?: unknown;
  readonly status?: number;
}): Response {
  return {
    ok,
    status,
    json: async () => {
      if (jsonError) {
        throw jsonError;
      }

      return payload;
    }
  } as Response;
}

describe("market adapters", () => {
  it("returns unavailable placeholder data safely", async () => {
    const adapter = createPlaceholderMarketAdapter();

    await expect(adapter.readMarket(options)).resolves.toMatchObject({
      sign: "aries",
      priceUsd: null,
      marketCap: null,
      fdv: null,
      liquidity: null,
      volume24h: null,
      change24h: null,
      supply: null,
      source: "placeholder",
      lastUpdated: null,
      status: "unavailable"
    });
  });

  describe("direct adapter fault tolerance", () => {
    const adapterCases = [
      {
        create: createDexScreenerMarketAdapter,
        malformedPayload: { pairs: "not-an-array" },
        name: "DEX Screener",
        source: "dex-screener"
      },
      {
        create: createJupiterMarketAdapter,
        malformedPayload: { data: "not-an-object" },
        name: "Jupiter",
        source: "jupiter"
      }
    ] as const;

    for (const adapterCase of adapterCases) {
      it(`${adapterCase.name} returns unavailable when fetch throws`, async () => {
        const fetchImpl = vi.fn(async () => {
          throw new Error("network unavailable");
        }) as unknown as typeof fetch;
        const adapter = adapterCase.create({ fetchImpl });

        await expect(adapter.readMarket(options)).resolves.toMatchObject({
          source: adapterCase.source,
          status: "unavailable",
          error: {
            code: "adapter-error",
            message: "network unavailable"
          }
        });
      });

      it(`${adapterCase.name} returns unavailable for non-OK HTTP responses`, async () => {
        const fetchImpl = vi.fn(async () => mockResponse({ ok: false, status: 503 })) as unknown as typeof fetch;
        const adapter = adapterCase.create({ fetchImpl });

        await expect(adapter.readMarket(options)).resolves.toMatchObject({
          source: adapterCase.source,
          status: "unavailable",
          error: {
            code: "http-error"
          }
        });
      });

      it(`${adapterCase.name} returns unavailable when JSON parsing fails`, async () => {
        const fetchImpl = vi.fn(async () =>
          mockResponse({ jsonError: new Error("invalid json"), ok: true })
        ) as unknown as typeof fetch;
        const adapter = adapterCase.create({ fetchImpl });

        await expect(adapter.readMarket(options)).resolves.toMatchObject({
          source: adapterCase.source,
          status: "unavailable",
          error: {
            code: "invalid-response",
            message: "invalid json"
          }
        });
      });

      it(`${adapterCase.name} returns unavailable for malformed payloads`, async () => {
        const fetchImpl = vi.fn(async () =>
          mockResponse({ ok: true, payload: adapterCase.malformedPayload })
        ) as unknown as typeof fetch;
        const adapter = adapterCase.create({ fetchImpl });

        await expect(adapter.readMarket(options)).resolves.toMatchObject({
          source: adapterCase.source,
          status: "unavailable",
          error: {
            code: "invalid-response"
          }
        });
      });
    }
  });

  it("normalizes DEX Screener pair data", async () => {
    const fetchImpl = vi.fn(async () =>
      mockResponse({
        ok: true,
        payload: {
          pairs: [
            {
              priceUsd: "0.0123",
              marketCap: 123000,
              fdv: 456000,
              liquidity: { usd: 78900 },
              volume: { h24: 1200 },
              priceChange: { h24: -1.25 }
            }
          ]
        }
      })
    ) as unknown as typeof fetch;
    const adapter = createDexScreenerMarketAdapter({ fetchImpl });

    const snapshot = await adapter.readMarket(options);

    expect(snapshot).toMatchObject({
      priceUsd: 0.0123,
      marketCap: 123000,
      fdv: 456000,
      liquidity: 78900,
      volume24h: 1200,
      change24h: -1.25,
      supply: null,
      source: "dex-screener",
      status: "ok"
    });
    expect(snapshot.lastUpdated).toEqual(expect.any(String));
  });

  it("normalizes Jupiter price data with unavailable extended fields", async () => {
    const fetchImpl = vi.fn(async () =>
      mockResponse({
        ok: true,
        payload: {
          data: {
            [token.mintAddress]: { price: "0.042" }
          }
        }
      })
    ) as unknown as typeof fetch;
    const adapter = createJupiterMarketAdapter({ fetchImpl });

    await expect(adapter.readMarket(options)).resolves.toMatchObject({
      priceUsd: 0.042,
      marketCap: null,
      fdv: null,
      liquidity: null,
      volume24h: null,
      change24h: null,
      supply: null,
      source: "jupiter",
      status: "ok"
    });
  });

  it("converts adapter failures to unavailable snapshots", async () => {
    const adapter = {
      id: "failing",
      readMarket: async () => {
        throw new Error("upstream unavailable");
      }
    };

    await expect(readMarketSafely(adapter, options)).resolves.toMatchObject({
      priceUsd: null,
      source: "failing",
      status: "unavailable",
      error: {
        code: "adapter-error",
        message: "upstream unavailable"
      }
    });
  });
});
