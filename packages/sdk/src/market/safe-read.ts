import type { ZodiacMarketAdapter, ZodiacMarketData, ZodiacMarketReadOptions } from "./types.js";
import { unavailableMarketData } from "./unavailable.js";

export async function readMarketSafely(
  adapter: ZodiacMarketAdapter,
  options: ZodiacMarketReadOptions
): Promise<ZodiacMarketData> {
  try {
    return await adapter.readMarket(options);
  } catch (error) {
    return unavailableMarketData(
      options,
      adapter.id,
      {
        code: "adapter-error",
        message: error instanceof Error ? error.message : "Market adapter failed."
      }
    );
  }
}
