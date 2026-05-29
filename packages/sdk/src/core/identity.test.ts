import { describe, expect, it } from "vitest";
import {
  getCosmicReceiptData,
  getCrossChainZodiacShelf,
  getElementComposition,
  getModalityComposition,
  getNativeAndBridgedSummary,
  getOwnSignStatus,
  getTotalHeld,
  getZodiacWheelState
} from "./index.js";

const ownership = {
  holdings: [
    { sign: "aries", held: true },
    { sign: "taurus", held: false },
    { sign: "gemini", held: true }
  ]
} as const;

describe("identity composition helpers", () => {
  it("computes element, modality, total, own-sign, and wheel state", () => {
    expect(getElementComposition(ownership)).toMatchObject({ fire: 1, air: 1 });
    expect(getModalityComposition(ownership)).toMatchObject({ cardinal: 1, mutable: 1 });
    expect(getTotalHeld(ownership)).toBe(2);
    expect(getOwnSignStatus(ownership, "aries")).toMatchObject({ held: true, label: "held" });
    expect(getZodiacWheelState(ownership)).toHaveLength(12);
  });

  it("builds receipt and cross-chain shelf data without market data", () => {
    expect(getCosmicReceiptData(ownership)).toMatchObject({
      label: "public Zodiacs shelf",
      heldSigns: ["aries", "gemini"],
      totalHeld: 2
    });

    const ownershipByChain = {
      solana: {
        walletAddress: "solana-wallet",
        chain: "solana",
        status: "available",
        holdings: [{ sign: "aries", held: true }],
        heldSigns: ["aries"],
        totalHeld: 1,
        errors: []
      } as never,
      base: {
        ownerAddress: "0x1111111111111111111111111111111111111111",
        chain: "base",
        status: "available",
        holdings: [{ sign: "taurus", held: true }],
        heldSigns: ["taurus"],
        totalHeld: 1,
        errors: []
      } as never
    };
    const shelf = getCrossChainZodiacShelf(ownershipByChain);

    expect(shelf.label).toBe("combined wallet holdings across official representations");
    expect(shelf.heldSigns).toEqual(["aries", "taurus"]);
    expect(getNativeAndBridgedSummary(ownershipByChain)).toMatchObject({
      nativeHeld: 1,
      bridgedHeld: 1,
      combinedHeld: 2
    });
  });
});
