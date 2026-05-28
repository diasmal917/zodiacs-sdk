import type { CSSProperties } from "react";

export const surfaceStyle: CSSProperties = {
  background: "#14110d",
  border: "1px solid #3b3328",
  borderRadius: 8,
  color: "#f3eadb",
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
};

export const mutedTextStyle: CSSProperties = {
  color: "#b9ab98"
};

export const labelStyle: CSSProperties = {
  color: "#a99982",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0,
  textTransform: "uppercase"
};

export const rowStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: 12,
  justifyContent: "space-between"
};
