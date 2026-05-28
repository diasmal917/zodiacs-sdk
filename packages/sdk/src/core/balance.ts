import {
  DEFAULT_ZODIAC_TOKEN_REGISTRY,
  getZodiacToken
} from "./registry.js";
import {
  ZODIAC_SIGNS,
  type ReadZodiacsBalancesOptions,
  type ReadZodiacBalanceOptions,
  type ZodiacBalanceResult
} from "./types.js";

export async function readZodiacBalance(
  options: ReadZodiacBalanceOptions
): Promise<ZodiacBalanceResult> {
  const registry = options.registry ?? DEFAULT_ZODIAC_TOKEN_REGISTRY;
  const token = getZodiacToken(options.sign, registry);

  try {
    const balance = await options.reader.getTokenBalance(options.ownerAddress, token.mintAddress, token);

    return {
      sign: options.sign,
      token,
      balance,
      status: balance ? "available" : "not-found"
    };
  } catch (error) {
    return {
      sign: options.sign,
      token,
      balance: null,
      status: "unavailable",
      reason: error instanceof Error ? error.message : "Balance reader failed."
    };
  }
}

export async function readZodiacsBalances(
  options: ReadZodiacsBalancesOptions
): Promise<readonly ZodiacBalanceResult[]> {
  return Promise.all(
    ZODIAC_SIGNS.map((sign) => {
      const readOptions: ReadZodiacBalanceOptions = {
        ownerAddress: options.ownerAddress,
        reader: options.reader,
        sign
      };

      if (options.registry) {
        return readZodiacBalance({ ...readOptions, registry: options.registry });
      }

      return readZodiacBalance(readOptions);
    })
  );
}
