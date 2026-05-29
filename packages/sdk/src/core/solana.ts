import { Connection, PublicKey } from "@solana/web3.js";
import {
  ZODIAC_SIGNS,
  type ZodiacsOwnership,
  type ZodiacsHolding,
  type ConnectionOrRpcUrl,
  type ParsedTokenAccountAmount,
  type ParsedTokenAccountResponse,
  type ReadonlyZodiacBalanceReader,
  type SolanaBalanceConnection,
  type TokenBalance,
  type ZodiacBalance,
  type ZodiacBalanceError,
  type ZodiacSign
} from "./types.js";
import { getZodiacToken } from "./registry.js";
import { getSolanaZodiacRepresentation } from "./official-registry.js";
import { rawAmountToNumber } from "./format.js";
import { ZodiacsValidationError } from "./errors.js";

export function createSolanaConnection(connectionOrRpcUrl: ConnectionOrRpcUrl): SolanaBalanceConnection {
  if (typeof connectionOrRpcUrl !== "string") {
    if (typeof connectionOrRpcUrl.getParsedTokenAccountsByOwner !== "function") {
      throw new ZodiacsValidationError(
        "invalid-solana-connection",
        "Invalid Solana connection: getParsedTokenAccountsByOwner is required."
      );
    }

    return connectionOrRpcUrl;
  }

  const rpcUrl = connectionOrRpcUrl.trim();

  if (!rpcUrl) {
    throw new ZodiacsValidationError("invalid-rpc-endpoint", "Invalid RPC endpoint: URL is required.");
  }

  try {
    new URL(rpcUrl);
  } catch {
    throw new ZodiacsValidationError("invalid-rpc-endpoint", `Invalid RPC endpoint: ${connectionOrRpcUrl}`);
  }

  return new Connection(rpcUrl, "confirmed") as unknown as SolanaBalanceConnection;
}

export function createReadonlySolanaBalanceReader(
  connectionOrRpcUrl: ConnectionOrRpcUrl
): ReadonlyZodiacBalanceReader {
  const connection = createSolanaConnection(connectionOrRpcUrl);

  return {
    getTokenBalance: async (ownerAddress, mintAddress, token): Promise<TokenBalance | null> => {
      const walletPublicKey = createPublicKey(ownerAddress, "wallet address");
      const mintPublicKey = createPublicKey(mintAddress, `${token.sign} mint address`);
      const response = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
        mint: mintPublicKey
      });
      const amount = normalizeParsedTokenAccounts(response, token.decimals);

      if (amount.rawAmount === "0") {
        return null;
      }

      return {
        ownerAddress,
        mintAddress,
        amountRaw: amount.rawAmount,
        decimals: amount.decimals,
        uiAmount: amount.uiAmount
      };
    }
  };
}

export async function getZodiacBalance(
  connectionOrRpcUrl: ConnectionOrRpcUrl,
  walletAddress: string,
  sign: ZodiacSign
): Promise<ZodiacBalance> {
  assertZodiacSignInput(sign);
  const walletPublicKey = createPublicKey(walletAddress, "wallet address");
  const token = getZodiacToken(sign);
  const mintPublicKey = createPublicKey(token.mintAddress, `${sign} mint address`);
  const connection = createSolanaConnection(connectionOrRpcUrl);

  try {
    const response = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
      mint: mintPublicKey
    });

    const amount = normalizeParsedTokenAccounts(response, token.decimals);

    return {
      sign,
      token,
      representation: getSolanaZodiacRepresentation(sign),
      chain: "solana",
      kind: "native",
      tokenStandard: "SPL",
      walletAddress,
      mintAddress: token.mintAddress,
      rawAmount: amount.rawAmount,
      decimals: amount.decimals,
      uiAmount: amount.uiAmount,
      uiAmountString: amount.uiAmountString,
      status: amount.rawAmount === "0" ? "zero" : "ok"
    };
  } catch (error) {
    return unavailableBalance(
      sign,
      walletAddress,
      error instanceof Error ? error.message : "Solana RPC balance request failed."
    );
  }
}

export async function getZodiacsOwnership(
  connectionOrRpcUrl: ConnectionOrRpcUrl,
  walletAddress: string
): Promise<ZodiacsOwnership> {
  createPublicKey(walletAddress, "wallet address");
  const connection = createSolanaConnection(connectionOrRpcUrl);
  const balances = await Promise.all(
    ZODIAC_SIGNS.map((sign) => getZodiacBalance(connection, walletAddress, sign))
  );
  const holdings = balances.map<ZodiacsHolding>((balance) => ({
    sign: balance.sign,
    token: balance.token,
    balance,
    held: balance.status === "ok" && balance.rawAmount !== "0"
  }));
  const heldSigns = holdings.filter((holding) => holding.held).map((holding) => holding.sign);
  const errors = balances.flatMap((balance) => (balance.error ? [balance.error] : []));

  return {
    walletAddress,
    chain: "solana",
    status: getZodiacsOwnershipStatus(balances),
    holdings,
    heldSigns,
    totalHeld: heldSigns.length,
    errors
  };
}

export const getSolanaZodiacBalance = getZodiacBalance;

export async function getSolanaZodiacBalances(
  connectionOrRpcUrl: ConnectionOrRpcUrl,
  walletAddress: string
): Promise<readonly ZodiacBalance[]> {
  const connection = createSolanaConnection(connectionOrRpcUrl);
  return Promise.all(ZODIAC_SIGNS.map((sign) => getZodiacBalance(connection, walletAddress, sign)));
}

export const getSolanaZodiacsOwnership = getZodiacsOwnership;

export const getSolanaHeldZodiacs = getHeldZodiacs;

export async function getHeldZodiacs(
  connectionOrRpcUrl: ConnectionOrRpcUrl,
  walletAddress: string
): Promise<readonly ZodiacsHolding[]> {
  const ownership = await getZodiacsOwnership(connectionOrRpcUrl, walletAddress);
  return ownership.holdings.filter((holding) => holding.held);
}

function normalizeParsedTokenAccounts(
  response: ParsedTokenAccountResponse,
  fallbackDecimals: number
): {
  readonly rawAmount: string;
  readonly decimals: number;
  readonly uiAmount: number;
  readonly uiAmountString: string;
} {
  if (!Array.isArray(response.value)) {
    throw new Error("Invalid RPC response: expected token account array.");
  }

  let totalRaw = 0n;
  let decimals = fallbackDecimals;
  let hasTokenAccount = false;

  for (const account of response.value) {
    const amount = account.account.data.parsed?.info?.tokenAmount;

    if (!amount) {
      throw new Error("Invalid RPC response: token amount is missing.");
    }

    assertParsedAmount(amount);

    if (hasTokenAccount && amount.decimals !== decimals) {
      throw new Error("Invalid RPC response: token account decimals are inconsistent.");
    }

    totalRaw += BigInt(amount.amount);
    decimals = amount.decimals;
    hasTokenAccount = true;
  }

  const rawAmount = totalRaw.toString();

  return {
    rawAmount,
    decimals,
    uiAmount: rawAmountToNumber(rawAmount, decimals),
    uiAmountString: formatRawAmountString(rawAmount, decimals)
  };
}

function assertParsedAmount(amount: ParsedTokenAccountAmount): void {
  if (!/^\d+$/u.test(amount.amount)) {
    throw new Error("Invalid RPC response: token amount must be an unsigned integer string.");
  }

  if (!Number.isInteger(amount.decimals) || amount.decimals < 0 || amount.decimals > 18) {
    throw new Error("Invalid RPC response: token decimals are outside the supported range.");
  }
}

function unavailableBalance(sign: ZodiacSign, walletAddress: string, message: string): ZodiacBalance {
  const token = getZodiacToken(sign);
  const error: ZodiacBalanceError = {
    code: message.startsWith("Invalid RPC response") ? "invalid-rpc-response" : "rpc-error",
    message
  };

  return {
    sign,
    token,
    representation: getSolanaZodiacRepresentation(sign),
    chain: "solana",
    kind: "native",
    tokenStandard: "SPL",
    walletAddress,
    mintAddress: token.mintAddress,
    rawAmount: "0",
    decimals: token.decimals,
    uiAmount: 0,
    uiAmountString: "0",
    status: "unavailable",
    error
  };
}

function getZodiacsOwnershipStatus(balances: readonly ZodiacBalance[]): ZodiacsOwnership["status"] {
  const unavailableCount = balances.filter((balance) => balance.status === "unavailable").length;

  if (unavailableCount === 0) {
    return "available";
  }

  return unavailableCount === balances.length ? "unavailable" : "partial";
}

function createPublicKey(value: string, label: string): PublicKey {
  try {
    return new PublicKey(value);
  } catch {
    throw new ZodiacsValidationError(
      label === "wallet address" ? "invalid-wallet-address" : "invalid-mint-address",
      `Invalid ${label}: ${value}`
    );
  }
}

function assertZodiacSignInput(value: string): asserts value is ZodiacSign {
  if (!ZODIAC_SIGNS.includes(value as ZodiacSign)) {
    throw new ZodiacsValidationError("invalid-zodiac-sign", `Invalid zodiac sign: ${value}`);
  }
}

function formatRawAmountString(rawAmount: string, decimals: number): string {
  if (rawAmount === "0") {
    return "0";
  }

  if (decimals === 0) {
    return rawAmount;
  }

  const padded = rawAmount.padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals);
  const fractional = padded.slice(-decimals).replace(/0+$/u, "");

  return fractional ? `${whole}.${fractional}` : whole;
}
