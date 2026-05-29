import type { PublicClient } from "viem";
import {
  getBaseZodiacsOwnership
} from "./base.js";
import {
  getSolanaZodiacsOwnership
} from "./solana.js";
import { getCrossChainZodiacShelf } from "./identity.js";
import type {
  BaseZodiacsOwnership,
  ConnectionOrRpcUrl,
  CrossChainZodiacsOwnership,
  UnifiedZodiacShelf,
  ZodiacsOwnership
} from "./types.js";

export interface ZodiacHoldingsByChainParams {
  readonly solana?: {
    readonly connection: ConnectionOrRpcUrl;
    readonly ownerAddress: string;
  };
  readonly base?: {
    readonly publicClient: PublicClient;
    readonly ownerAddress: string;
  };
}

export interface ZodiacHoldingsByChain {
  readonly solana?: ZodiacsOwnership;
  readonly base?: BaseZodiacsOwnership;
}

export async function getZodiacHoldingsByChain(
  params: ZodiacHoldingsByChainParams
): Promise<ZodiacHoldingsByChain> {
  const [solana, base] = await Promise.all([
    params.solana
      ? getSolanaZodiacsOwnership(params.solana.connection, params.solana.ownerAddress)
      : Promise.resolve(undefined),
    params.base
      ? getBaseZodiacsOwnership(params.base.publicClient, params.base.ownerAddress)
      : Promise.resolve(undefined)
  ]);

  return {
    ...(solana ? { solana } : {}),
    ...(base ? { base } : {})
  };
}

export const getCrossChainZodiacsOwnership = getZodiacHoldingsByChain;

export async function getUnifiedZodiacShelf(
  params: ZodiacHoldingsByChainParams
): Promise<UnifiedZodiacShelf> {
  return getCrossChainZodiacShelf(await getCrossChainZodiacsOwnership(params) as CrossChainZodiacsOwnership);
}
