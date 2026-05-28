import { describe, expect, it, vi } from "vitest";
import {
  ZodiacsValidationError,
  getZodiacsOwnership,
  getHeldZodiacs,
  getZodiacBalance,
  type ParsedTokenAccountResponse,
  type SolanaBalanceConnection
} from "./index.js";
import { getMintAddress } from "./registry.js";

const walletAddress = "CWKQJJYec89wcx871C8vmyTPc3jhsdoAYs5aGffUtELJ";

function parsedTokenResponse(...amounts: readonly string[]): ParsedTokenAccountResponse {
  return {
    value: amounts.map((amount) => ({
        account: {
          data: {
            parsed: {
              info: {
                tokenAmount: {
                  amount,
                  decimals: 6,
                  uiAmount: Number(amount) / 10 ** 6,
                  uiAmountString: String(Number(amount) / 10 ** 6)
                }
              }
            }
          }
        }
      }))
  };
}

describe("read-only Solana balances", () => {
  it("returns a normalized balance for a zodiac token", async () => {
    const getParsedTokenAccountsByOwner = vi.fn(async () => parsedTokenResponse("2500000"));
    const connection: SolanaBalanceConnection = { getParsedTokenAccountsByOwner };

    const balance = await getZodiacBalance(connection, walletAddress, "aries");

    expect(balance).toMatchObject({
      sign: "aries",
      walletAddress,
      mintAddress: getMintAddress("aries"),
      rawAmount: "2500000",
      decimals: 6,
      uiAmount: 2.5,
      uiAmountString: "2.5",
      status: "ok"
    });
    expect(getParsedTokenAccountsByOwner).toHaveBeenCalledOnce();
  });

  it("returns zero when the wallet has no token account for the mint", async () => {
    const connection: SolanaBalanceConnection = {
      getParsedTokenAccountsByOwner: vi.fn(async () => ({ value: [] }))
    };

    const balance = await getZodiacBalance(connection, walletAddress, "taurus");

    expect(balance.rawAmount).toBe("0");
    expect(balance.uiAmount).toBe(0);
    expect(balance.uiAmountString).toBe("0");
    expect(balance.status).toBe("zero");
  });

  it("sums multiple token accounts for the same mint", async () => {
    const connection: SolanaBalanceConnection = {
      getParsedTokenAccountsByOwner: vi.fn(async () => parsedTokenResponse("1000000", "2250000", "750000"))
    };

    const balance = await getZodiacBalance(connection, walletAddress, "leo");

    expect(balance.rawAmount).toBe("4000000");
    expect(balance.uiAmount).toBe(4);
    expect(balance.uiAmountString).toBe("4");
    expect(balance.status).toBe("ok");
  });

  it("returns a typed unavailable state when RPC fails", async () => {
    const connection: SolanaBalanceConnection = {
      getParsedTokenAccountsByOwner: vi.fn(async () => {
        throw new Error("RPC unavailable");
      })
    };

    const balance = await getZodiacBalance(connection, walletAddress, "gemini");

    expect(balance.status).toBe("unavailable");
    expect(balance.error).toEqual({
      code: "rpc-error",
      message: "RPC unavailable"
    });
    expect(balance.uiAmount).toBe(0);
    expect(balance.uiAmountString).toBe("0");
  });

  it("throws for invalid inputs before making RPC calls", async () => {
    const getParsedTokenAccountsByOwner = vi.fn(async () => ({ value: [] }));
    const connection: SolanaBalanceConnection = { getParsedTokenAccountsByOwner };

    await expect(getZodiacBalance(connection, "not-a-wallet", "aries")).rejects.toMatchObject({
      code: "invalid-wallet-address",
      name: "ZodiacsValidationError"
    });
    await expect(getZodiacBalance(connection, walletAddress, "ophiuchus" as never)).rejects.toMatchObject({
      code: "invalid-zodiac-sign",
      name: "ZodiacsValidationError"
    });
    await expect(getZodiacBalance(connection, walletAddress, "aries")).resolves.toBeDefined();
    expect(getParsedTokenAccountsByOwner).toHaveBeenCalledOnce();
  });

  it("exposes validation errors as typed errors", async () => {
    await expect(getZodiacBalance({} as SolanaBalanceConnection, walletAddress, "aries")).rejects.toBeInstanceOf(
      ZodiacsValidationError
    );
  });

  it("returns a normalized Zodiacs ownership object", async () => {
    const connection: SolanaBalanceConnection = {
      getParsedTokenAccountsByOwner: vi.fn(async (_owner, filter) =>
        String(filter.mint) === getMintAddress("aries") ? parsedTokenResponse("1000000") : { value: [] }
      )
    };

    const ownership = await getZodiacsOwnership(connection, walletAddress);
    const held = await getHeldZodiacs(connection, walletAddress);

    expect(ownership.status).toBe("available");
    expect(ownership.holdings).toHaveLength(12);
    expect(ownership.holdings.map((holding) => holding.sign)).toHaveLength(12);
    expect(ownership.heldSigns).toEqual(["aries"]);
    expect(ownership.totalHeld).toBe(1);
    expect(ownership.errors).toEqual([]);
    expect(held.map((holding) => holding.sign)).toEqual(["aries"]);
    expect(held.every((holding) => holding.balance.rawAmount !== "0")).toBe(true);
  });
});
