import { describe, expect, it } from "vitest";
import {
  OfficialZodiacBadge,
  UnverifiedZodiacWarning,
  ZodiacAddressVerifier
} from "./index.js";

describe("registry UI components", () => {
  it("renders native and bridged labels", () => {
    expect(OfficialZodiacBadge({ address: "GhFiFrExPY3proVF96oth1gESWA5QPQzdtb8cy8b1YZv" }).props.children).toBe(
      "Official native Zodiacs.org asset on Solana"
    );
    expect(OfficialZodiacBadge({ address: "0x3ffB5282F5891Dd8c813E64059EdB0607537eC91" }).props.children).toBe(
      "Official bridged Zodiacs.org asset on Base"
    );
  });

  it("renders neutral unknown-address language", () => {
    const element = UnverifiedZodiacWarning({ address: "0x0000000000000000000000000000000000000000" });
    expect(JSON.stringify(element)).toContain("not found in the official Zodiacs.org registry");
  });

  it("verifier includes origin and counterpart rows without action buttons", () => {
    const element = ZodiacAddressVerifier({ address: "0x3ffB5282F5891Dd8c813E64059EdB0607537eC91" });
    const serialized = JSON.stringify(element);

    expect(serialized).toContain("Origin chain");
    expect(serialized).toContain("Native counterpart");
    expect(serialized).not.toMatch(/buy|sell|swap|approve|transfer/iu);
  });
});
