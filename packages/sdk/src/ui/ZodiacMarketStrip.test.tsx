import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ZodiacMarketData } from "../market/index.js";
import type { ZodiacToken } from "../core/index.js";
import { ZodiacMarketStrip } from "./ZodiacMarketStrip.js";

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

describe("ZodiacMarketStrip", () => {
  it("renders when market data is unavailable", () => {
    const market = {
      sign: "aries",
      token,
      priceUsd: null,
      marketCap: null,
      fdv: null,
      liquidity: null,
      volume24h: null,
      change24h: null,
      supply: null,
      source: "placeholder",
      lastUpdated: null,
      status: "unavailable",
      error: {
        code: "not-configured",
        message: "Market data is not configured."
      }
    } satisfies ZodiacMarketData;

    const markup = renderToStaticMarkup(<ZodiacMarketStrip market={market} />);

    expect(markup).toContain("Market");
    expect(markup).toContain("placeholder");
    expect(markup).toContain("Market data is not configured.");
    expect(markup).toContain("Unavailable");
  });
});
