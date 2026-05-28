export const ZODIAC_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces"
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export type ZodiacElement = "fire" | "earth" | "air" | "water";

export type ZodiacModality = "cardinal" | "fixed" | "mutable";

export interface ZodiacMarketLinks {
  readonly dexScreener: string;
  readonly jupiter: string;
}

export interface ZodiacDateRange {
  readonly starts: string;
  readonly ends: string;
}

export interface ZodiacMetadata {
  readonly sign: ZodiacSign;
  readonly name: string;
  readonly glyph: string;
  readonly element: ZodiacElement;
  readonly modality: ZodiacModality;
  readonly dateRange: ZodiacDateRange;
  readonly assetLine: string;
}

export interface ZodiacToken {
  readonly sign: ZodiacSign;
  readonly name: string;
  readonly slug: ZodiacSign;
  readonly ticker: string;
  readonly order: number;
  readonly element: ZodiacElement;
  readonly modality: ZodiacModality;
  readonly rulingPlanet: string;
  readonly symbol: string;
  readonly archetype: string;
  readonly shortBio: string;
  readonly decimals: number;
  readonly mintAddress: string;
  readonly marketLinks: ZodiacMarketLinks;
  readonly metadataUri?: string;
  readonly imageUri?: string;
}

export type ZodiacTokenRegistry = ReadonlyMap<ZodiacSign, ZodiacToken>;

export interface ZodiacRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export type ConnectionOrRpcUrl = string | SolanaBalanceConnection;

export interface ParsedTokenAccountAmount {
  readonly amount: string;
  readonly decimals: number;
  readonly uiAmount?: number | null;
  readonly uiAmountString?: string;
}

export interface ParsedTokenAccountResponse {
  readonly value: readonly {
    readonly account: {
      readonly data: {
        readonly parsed?: {
          readonly info?: {
            readonly tokenAmount?: ParsedTokenAccountAmount;
          };
        };
      };
    };
  }[];
}

export interface SolanaBalanceConnection {
  readonly getParsedTokenAccountsByOwner: (
    ownerAddress: unknown,
    filter: { readonly mint: unknown }
  ) => Promise<ParsedTokenAccountResponse>;
}

export interface TokenBalance {
  readonly ownerAddress: string;
  readonly mintAddress: string;
  readonly amountRaw: string;
  readonly decimals: number;
  readonly uiAmount: number | null;
}

export type ZodiacBalanceReadStatus = "ok" | "zero" | "unavailable";

export interface ZodiacBalanceError {
  readonly code: "rpc-error" | "invalid-rpc-response";
  readonly message: string;
}

export interface ZodiacBalance {
  readonly sign: ZodiacSign;
  readonly token: ZodiacToken;
  readonly walletAddress: string;
  readonly mintAddress: string;
  readonly rawAmount: string;
  readonly decimals: number;
  readonly uiAmount: number;
  readonly uiAmountString: string;
  readonly status: ZodiacBalanceReadStatus;
  readonly error?: ZodiacBalanceError;
}

export interface ZodiacsHolding {
  readonly sign: ZodiacSign;
  readonly token: ZodiacToken;
  readonly balance: ZodiacBalance;
  readonly held: boolean;
}

export type ZodiacsOwnershipStatus = "available" | "partial" | "unavailable";

export interface ZodiacsOwnership {
  readonly walletAddress: string;
  readonly status: ZodiacsOwnershipStatus;
  readonly holdings: readonly ZodiacsHolding[];
  readonly heldSigns: readonly ZodiacSign[];
  readonly totalHeld: number;
  readonly errors: readonly ZodiacBalanceError[];
}

export interface ReadonlyZodiacBalanceReader {
  readonly getTokenBalance: (
    ownerAddress: string,
    mintAddress: string,
    token: ZodiacToken
  ) => Promise<TokenBalance | null>;
}

export type ZodiacBalanceStatus = "available" | "missing-mint" | "not-found" | "unavailable";

export interface ZodiacBalanceResult {
  readonly sign: ZodiacSign;
  readonly token: ZodiacToken;
  readonly balance: TokenBalance | null;
  readonly status: ZodiacBalanceStatus;
  readonly reason?: string;
}

export interface ReadZodiacBalanceOptions {
  readonly ownerAddress: string;
  readonly sign: ZodiacSign;
  readonly reader: ReadonlyZodiacBalanceReader;
  readonly registry?: ZodiacTokenRegistry;
}

export interface ReadZodiacsBalancesOptions {
  readonly ownerAddress: string;
  readonly reader: ReadonlyZodiacBalanceReader;
  readonly registry?: ZodiacTokenRegistry;
}
