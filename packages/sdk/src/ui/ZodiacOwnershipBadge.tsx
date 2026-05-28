import type { CSSProperties } from "react";
import type { ZodiacBalanceResult } from "../core/index.js";

export interface ZodiacOwnershipBadgeProps {
  readonly balance?: ZodiacBalanceResult | null;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function ZodiacOwnershipBadge({ balance, className, style }: ZodiacOwnershipBadgeProps) {
  const copy = getOwnershipCopy(balance);

  return (
    <span
      className={className}
      style={{
        alignItems: "center",
        border: `1px solid ${copy.border}`,
        borderRadius: 999,
        color: copy.color,
        display: "inline-flex",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        padding: "7px 10px",
        ...style
      }}
    >
      {copy.label}
    </span>
  );
}

function getOwnershipCopy(balance: ZodiacBalanceResult | null | undefined): {
  readonly label: string;
  readonly color: string;
  readonly border: string;
} {
  if (!balance) {
    return { label: "Pending", color: "#d8c6a7", border: "#5b4d39" };
  }

  if (balance.status === "available" && balance.balance) {
    return { label: "Held", color: "#f1d38a", border: "#8f7441" };
  }

  if (balance.status === "not-found") {
    return { label: "Not held", color: "#b9ab98", border: "#4b4238" };
  }

  return { label: "Unavailable", color: "#c9b596", border: "#5b4d39" };
}
