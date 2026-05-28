import type { ZodiacMarketAdapter } from "./types.js";
import { unavailableMarketData } from "./unavailable.js";

export function createPlaceholderMarketAdapter(message = "Market data is not configured."): ZodiacMarketAdapter {
  return {
    id: "placeholder",
    readMarket: async (options) =>
      unavailableMarketData(options, "placeholder", {
        code: "not-configured",
        message
      })
  };
}
