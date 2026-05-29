import type { CSSProperties } from "react";
import {
  getBaseZodiacRepresentation,
  getCosmicReceiptData,
  getElementComposition,
  getModalityComposition,
  getNativeCounterpart,
  getRepresentationByAddress,
  getZodiacAsset,
  getZodiacWheelState,
  isOfficialZodiacAddress,
  type ZodiacAddressLookupOptions,
  type ZodiacRepresentation,
  type ZodiacSign
} from "../core/index.js";
import { labelStyle, mutedTextStyle, surfaceStyle } from "./styles.js";

export function OfficialZodiacBadge({
  address,
  representation,
  options
}: {
  readonly address?: string;
  readonly representation?: ZodiacRepresentation | null;
  readonly options?: ZodiacAddressLookupOptions;
}) {
  const resolved = representation ?? (address ? getRepresentationByAddress(address, options) : null);

  if (!resolved) {
    return <span style={badgeStyle}>Not found in the official Zodiacs.org registry</span>;
  }

  return (
    <span style={badgeStyle}>
      {resolved.kind === "native"
        ? "Official native Zodiacs.org asset on Solana"
        : "Official bridged Zodiacs.org asset on Base"}
    </span>
  );
}

export function ZodiacRepresentationBadge({ representation }: { readonly representation: ZodiacRepresentation }) {
  return <span style={badgeStyle}>{representation.kind === "native" ? "Native" : "Bridged"}</span>;
}

export function ZodiacChainBadge({ representation }: { readonly representation: ZodiacRepresentation }) {
  return <span style={badgeStyle}>{representation.chain === "solana" ? "Solana" : "Base"}</span>;
}

export function ZodiacBridgeProvenance({ representation }: { readonly representation: ZodiacRepresentation }) {
  if (!representation.bridge) {
    return <p style={mutedTextStyle}>Native on Solana.</p>;
  }

  return (
    <p style={mutedTextStyle}>
      Bridged from {representation.bridge.sourceChain} to {representation.bridge.destinationChain}
      {representation.bridge.protocol ? ` through ${representation.bridge.protocol}` : ""}.
    </p>
  );
}

export function OfficialZodiacTokenCard({
  sign,
  chain = "solana",
  style
}: {
  readonly sign: ZodiacSign;
  readonly chain?: "solana" | "base";
  readonly style?: CSSProperties;
}) {
  const asset = getZodiacAsset(sign);
  const representation = chain === "base" ? getBaseZodiacRepresentation(sign) : asset.native;

  return (
    <article style={{ ...surfaceStyle, display: "grid", gap: 12, padding: 16, ...style }}>
      <header>
        <p style={labelStyle}>{asset.displayName}</p>
        <h3 style={{ margin: "4px 0 0" }}>{representation.symbol}</h3>
      </header>
      <OfficialZodiacBadge representation={representation} />
      <p style={mutedTextStyle}>{asset.metadata.shortBio}</p>
      <ZodiacBridgeProvenance representation={representation} />
    </article>
  );
}

export function OfficialZodiacsGrid({ chain = "solana" }: { readonly chain?: "solana" | "base" }) {
  return (
    <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
      {(["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"] as const).map((sign) => (
        <OfficialZodiacTokenCard key={sign} chain={chain} sign={sign} />
      ))}
    </section>
  );
}

export function ZodiacAddressVerifier({
  address,
  options
}: {
  readonly address: string;
  readonly options?: ZodiacAddressLookupOptions;
}) {
  const representation = getRepresentationByAddress(address, options);
  const native = representation ? getNativeCounterpart(representation.address, { chain: representation.chain }) : null;
  const bridged = representation ? getBaseZodiacRepresentation(representation.sign) : null;

  if (!representation) {
    return <UnverifiedZodiacWarning address={address} />;
  }

  return (
    <article style={{ ...surfaceStyle, display: "grid", gap: 10, padding: 16 }}>
      <OfficialZodiacBadge representation={representation} />
      <VerifierRow label="Sign" value={representation.sign} />
      <VerifierRow label="Chain" value={representation.chain} />
      <VerifierRow label="Representation" value={representation.kind} />
      <VerifierRow label="Token standard" value={representation.tokenStandard} />
      <VerifierRow label="Origin chain" value={representation.originChain ?? "solana"} />
      <VerifierRow label="Native counterpart" value={native?.address ?? "Unavailable"} />
      <VerifierRow label="Base counterpart" value={bridged?.address ?? "Unavailable"} />
      <ZodiacBridgeProvenance representation={representation} />
    </article>
  );
}

export function UnverifiedZodiacWarning({ address }: { readonly address?: string }) {
  return (
    <article style={{ ...surfaceStyle, padding: 16 }}>
      <p style={labelStyle}>Unverified</p>
      <p style={mutedTextStyle}>
        {address ? `${address} is not found in the official Zodiacs.org registry.` : "Not found in the official Zodiacs.org registry."}
      </p>
    </article>
  );
}

export function ZodiacShelf({ ownership }: { readonly ownership: { readonly holdings: readonly { readonly sign: ZodiacSign; readonly held: boolean }[] } }) {
  const held = ownership.holdings.filter((holding) => holding.held);

  return (
    <section style={{ ...surfaceStyle, padding: 16 }}>
      <p style={labelStyle}>Public Zodiacs shelf</p>
      <p style={mutedTextStyle}>{held.map((holding) => holding.sign).join(", ") || "No held signs found."}</p>
    </section>
  );
}

export function ZodiacWheel({ ownership }: { readonly ownership: { readonly holdings: readonly { readonly sign: ZodiacSign; readonly held: boolean }[] } }) {
  return (
    <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
      {getZodiacWheelState(ownership).map((item) => (
        <span key={item.sign} style={item.held ? badgeStyle : quietBadgeStyle}>{item.sign}</span>
      ))}
    </div>
  );
}

export function ZodiacElementComposition({ ownership }: { readonly ownership: { readonly holdings: readonly { readonly sign: ZodiacSign; readonly held: boolean }[] } }) {
  return <Composition title="Element mix" composition={getElementComposition(ownership)} />;
}

export function ZodiacModalityComposition({ ownership }: { readonly ownership: { readonly holdings: readonly { readonly sign: ZodiacSign; readonly held: boolean }[] } }) {
  return <Composition title="Modality mix" composition={getModalityComposition(ownership)} />;
}

export function CosmicReceiptCard({ ownership }: { readonly ownership: { readonly holdings: readonly { readonly sign: ZodiacSign; readonly held: boolean }[] } }) {
  const receipt = getCosmicReceiptData(ownership);

  return (
    <article style={{ ...surfaceStyle, padding: 16 }}>
      <p style={labelStyle}>Cosmic receipt</p>
      <p style={mutedTextStyle}>{receipt.label}</p>
      <p>Total held: {receipt.totalHeld}</p>
    </article>
  );
}

function Composition({ title, composition }: { readonly title: string; readonly composition: Record<string, number> }) {
  return (
    <section style={{ ...surfaceStyle, padding: 16 }}>
      <p style={labelStyle}>{title}</p>
      {Object.entries(composition).map(([key, value]) => (
        <VerifierRow key={key} label={key} value={String(value)} />
      ))}
    </section>
  );
}

function VerifierRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
      <span style={labelStyle}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const badgeStyle: CSSProperties = {
  border: "1px solid #6f5a33",
  borderRadius: 999,
  color: "#f1d38a",
  display: "inline-flex",
  fontSize: 12,
  fontWeight: 650,
  padding: "5px 9px"
};

const quietBadgeStyle: CSSProperties = {
  ...badgeStyle,
  borderColor: "#3b3328",
  color: "#b9ab98"
};
