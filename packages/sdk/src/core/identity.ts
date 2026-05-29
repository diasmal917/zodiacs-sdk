import { getZodiacAsset } from "./official-registry.js";
import { ZODIAC_SIGNS, type BaseZodiacsOwnership, type CrossChainZodiacsOwnership, type UnifiedZodiacShelf, type ZodiacElement, type ZodiacModality, type ZodiacSign, type ZodiacsOwnership } from "./types.js";

interface HoldingLike {
  readonly sign: ZodiacSign;
  readonly held: boolean;
}

interface OwnershipLike {
  readonly holdings: readonly HoldingLike[];
}

export function getZodiacShelf<T extends OwnershipLike>(ownership: T): readonly HoldingLike[] {
  return ownership.holdings.filter((holding) => holding.held);
}

export function getElementComposition(ownership: OwnershipLike): Record<ZodiacElement, number> {
  return getComposition(ownership, "element");
}

export function getModalityComposition(ownership: OwnershipLike): Record<ZodiacModality, number> {
  return getComposition(ownership, "modality");
}

export function getTotalHeld(ownership: OwnershipLike): number {
  return getZodiacShelf(ownership).length;
}

export function getHeldElements(ownership: OwnershipLike): readonly ZodiacElement[] {
  return unique(getZodiacShelf(ownership).map((holding) => getZodiacAsset(holding.sign).metadata.element));
}

export function getHeldModalities(ownership: OwnershipLike): readonly ZodiacModality[] {
  return unique(getZodiacShelf(ownership).map((holding) => getZodiacAsset(holding.sign).metadata.modality));
}

export function getOwnSignStatus(ownership: OwnershipLike, sunSign: ZodiacSign): {
  readonly sign: ZodiacSign;
  readonly held: boolean;
  readonly label: "held" | "not-held";
} {
  const held = ownership.holdings.some((holding) => holding.sign === sunSign && holding.held);
  return {
    sign: sunSign,
    held,
    label: held ? "held" : "not-held"
  };
}

export function getZodiacWheelState(ownership: OwnershipLike): readonly {
  readonly sign: ZodiacSign;
  readonly held: boolean;
}[] {
  return ZODIAC_SIGNS.map((sign) => ({
    sign,
    held: ownership.holdings.some((holding) => holding.sign === sign && holding.held)
  }));
}

export function getCosmicReceiptData(
  ownership: OwnershipLike,
  options: { readonly label?: string } = {}
): {
  readonly label: string;
  readonly heldSigns: readonly ZodiacSign[];
  readonly totalHeld: number;
  readonly elementComposition: Record<ZodiacElement, number>;
  readonly modalityComposition: Record<ZodiacModality, number>;
} {
  const heldSigns = getZodiacShelf(ownership).map((holding) => holding.sign);

  return {
    label: options.label ?? "public Zodiacs shelf",
    heldSigns,
    totalHeld: heldSigns.length,
    elementComposition: getElementComposition(ownership),
    modalityComposition: getModalityComposition(ownership)
  };
}

export function getCrossChainZodiacShelf(ownershipByChain: CrossChainZodiacsOwnership): UnifiedZodiacShelf {
  const items = ZODIAC_SIGNS.map((sign) => {
    const nativeHeld = isHeld(ownershipByChain.solana, sign);
    const bridgedHeld = isHeld(ownershipByChain.base, sign);

    return {
      sign,
      held: nativeHeld || bridgedHeld,
      nativeHeld,
      bridgedHeld,
      representations: [
        getZodiacAsset(sign).native,
        ...getZodiacAsset(sign).representations.filter((representation) => representation.kind === "bridged")
      ]
    };
  });
  const heldSigns = items.filter((item) => item.held).map((item) => item.sign);

  return {
    label: "combined wallet holdings across official representations",
    items,
    heldSigns,
    totalHeld: heldSigns.length
  };
}

export function getNativeAndBridgedSummary(ownershipByChain: CrossChainZodiacsOwnership): {
  readonly nativeHeld: number;
  readonly bridgedHeld: number;
  readonly combinedHeld: number;
  readonly heldSigns: readonly ZodiacSign[];
} {
  const shelf = getCrossChainZodiacShelf(ownershipByChain);

  return {
    nativeHeld: shelf.items.filter((item) => item.nativeHeld).length,
    bridgedHeld: shelf.items.filter((item) => item.bridgedHeld).length,
    combinedHeld: shelf.totalHeld,
    heldSigns: shelf.heldSigns
  };
}

function getComposition<T extends ZodiacElement | ZodiacModality>(
  ownership: OwnershipLike,
  field: "element" | "modality"
): Record<T, number> {
  const initial =
    field === "element"
      ? { fire: 0, earth: 0, air: 0, water: 0 }
      : { cardinal: 0, fixed: 0, mutable: 0 };

  return getZodiacShelf(ownership).reduce<Record<string, number>>((counts, holding) => {
    const key = getZodiacAsset(holding.sign).metadata[field];
    return {
      ...counts,
      [key]: (counts[key] ?? 0) + 1
    };
  }, initial) as Record<T, number>;
}

function unique<T>(items: readonly T[]): readonly T[] {
  return [...new Set(items)];
}

function isHeld(ownership: ZodiacsOwnership | BaseZodiacsOwnership | undefined, sign: ZodiacSign): boolean {
  return ownership?.holdings.some((holding) => holding.sign === sign && holding.held) ?? false;
}
