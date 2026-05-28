import type { CSSProperties } from "react";
import { formatCurrency, formatPercentChange } from "../core/index.js";
import type { ZodiacMarketData } from "../market/index.js";
import { labelStyle, rowStyle } from "./styles.js";

export interface ZodiacMarketStripProps {
  readonly market?: ZodiacMarketData | null;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function ZodiacMarketStrip({ market, className, style }: ZodiacMarketStripProps) {
  const sourceLabel = market?.source ?? "optional";
  const isUnavailable = !market || market.status === "unavailable";

  return (
    <div
      className={className}
      style={{
        borderTop: "1px solid #332c24",
        display: "grid",
        gap: 10,
        paddingTop: 14,
        ...style
      }}
    >
      <div style={rowStyle}>
        <span style={labelStyle}>Market</span>
        <span style={{ color: "#b9ab98", fontSize: 12 }}>{sourceLabel}</span>
      </div>
      {isUnavailable ? (
        <p style={{ color: "#b9ab98", fontSize: 13, lineHeight: 1.45, margin: 0 }}>
          {market?.error?.message ?? "Market context unavailable."}
        </p>
      ) : null}
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <MarketValue label="Price" value={formatCurrency(market?.priceUsd)} />
        <MarketValue label="24h" value={formatPercentChange(market?.change24h)} />
        <MarketValue label="Liquidity" value={formatCurrency(market?.liquidity)} />
      </div>
    </div>
  );
}

function MarketValue({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ color: "#f3eadb", fontSize: 14, fontWeight: 600, marginTop: 4, overflowWrap: "anywhere" }}>
        {value}
      </div>
    </div>
  );
}
