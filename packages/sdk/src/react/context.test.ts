import { describe, expect, it, vi } from "vitest";
import {
  getZodiacToken,
  type ParsedTokenAccountResponse,
  type ReadonlyZodiacBalanceReader,
  type SolanaBalanceConnection
} from "../core/index.js";
import { ZodiacsProvider } from "./context.js";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useMemo: (factory: () => unknown) => factory()
  };
});

const walletAddress = "CWKQJJYec89wcx871C8vmyTPc3jhsdoAYs5aGffUtELJ";

function parsedTokenResponse(amount: string): ParsedTokenAccountResponse {
  return {
    value: [
      {
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
      }
    ]
  };
}

describe("ZodiacsProvider", () => {
  it("creates a first-party read-only balance reader when rpcUrl is provided", async () => {
    const getParsedTokenAccountsByOwner = vi.fn(async () => parsedTokenResponse("1250000"));
    const connection: SolanaBalanceConnection = { getParsedTokenAccountsByOwner };
    const element = ZodiacsProvider({ children: null, rpcUrl: connection });
    const balanceReader = element.props.value.balanceReader as ReadonlyZodiacBalanceReader | null;
    const token = getZodiacToken("aries");

    await expect(balanceReader?.getTokenBalance(walletAddress, token.mintAddress, token)).resolves.toMatchObject({
      amountRaw: "1250000",
      decimals: 6,
      mintAddress: token.mintAddress,
      ownerAddress: walletAddress,
      uiAmount: 1.25
    });
    expect(getParsedTokenAccountsByOwner).toHaveBeenCalledOnce();
  });

  it("uses a custom balanceReader instead of the rpcUrl reader", () => {
    const customBalanceReader: ReadonlyZodiacBalanceReader = {
      getTokenBalance: vi.fn(async () => null)
    };
    const connection: SolanaBalanceConnection = {
      getParsedTokenAccountsByOwner: vi.fn(async () => parsedTokenResponse("1250000"))
    };
    const element = ZodiacsProvider({
      balanceReader: customBalanceReader,
      children: null,
      rpcUrl: connection
    });

    expect(element.props.value.balanceReader).toBe(customBalanceReader);
  });
});
