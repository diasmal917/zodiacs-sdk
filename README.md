# Zodiacs SDK

Read-only TypeScript SDK for integrating Zodiacs.org cultural assets into
astrology, identity, and ownership applications.

The MVP provides a typed token registry, metadata helpers, React hooks,
HTML-based UI components, and optional market context. It is built around
symbolic identity, scarcity, ownership, and symbolic endurance.

## Package

- `@zodiacs/sdk`

## Commands

```sh
corepack pnpm install
corepack pnpm build
corepack pnpm test
corepack pnpm typecheck
```

## Read-Only Solana Usage

The SDK reads SPL token balances for the twelve local Zodiacs mint addresses.
It does not request private keys, sign messages, execute swaps, execute trades,
submit transactions, or provide custody.

```ts
import {
  getZodiacsOwnership,
  getHeldZodiacs,
  getZodiacBalance
} from "@zodiacs/sdk";

const rpcUrl = "https://api.mainnet-beta.solana.com";
const walletAddress = "CWKQJJYec89wcx871C8vmyTPc3jhsdoAYs5aGffUtELJ";

const aries = await getZodiacBalance(rpcUrl, walletAddress, "aries");

const ownership = await getZodiacsOwnership(rpcUrl, walletAddress);
const heldZodiacs = await getHeldZodiacs(rpcUrl, walletAddress);
```

`getZodiacBalance` returns a normalized object:

```ts
if (aries.status === "ok") {
  console.log(aries.rawAmount);
  console.log(aries.uiAmountString);
}

if (aries.status === "zero") {
  console.log("No Aries token account balance for this wallet.");
}

if (aries.status === "unavailable") {
  console.log(aries.error.message);
}
```

The balance layer queries token accounts by wallet owner and mint, then sums all
matching token accounts. RPC failures are returned as typed unavailable balances
inside the result. Core functions throw only for invalid inputs such as an
invalid wallet address, zodiac sign, or RPC endpoint.

## React Usage

```tsx
import {
  ZodiacsProvider,
  useZodiacBalance,
  useZodiacMarket,
  useZodiacToken
} from "@zodiacs/sdk";

function AriesIdentity({ walletAddress }: { walletAddress: string }) {
  const { token } = useZodiacToken("aries");
  const balance = useZodiacBalance("aries", walletAddress);
  const market = useZodiacMarket("aries");

  return (
    <section>
      <h2>{token.name}</h2>
      <p>{token.shortBio}</p>
      <p>Ownership: {balance.data?.status ?? "loading"}</p>
      <p>Market context: {market.data?.status ?? "loading"}</p>
    </section>
  );
}

export function App() {
  return (
    <ZodiacsProvider rpcUrl="https://api.mainnet-beta.solana.com">
      <AriesIdentity walletAddress="CWKQJJYec89wcx871C8vmyTPc3jhsdoAYs5aGffUtELJ" />
    </ZodiacsProvider>
  );
}
```

`useZodiacMarket` uses the placeholder market adapter unless a provider supplies
another adapter. Missing market context does not prevent metadata or ownership
surfaces from rendering. `useZodiacBalance` requires either `rpcUrl` on
`ZodiacsProvider` or a custom read-only `balanceReader`. Invalid wallet input
and RPC failures are exposed as safe hook state.

## Optional Market Context

Market data is optional. Adapters return normalized snapshots when upstream data
is available, and unavailable snapshots when network, API, or payload failures
occur. Treat market context as display context only.

```ts
import {
  createDexScreenerMarketAdapter,
  createJupiterMarketAdapter,
  createPlaceholderMarketAdapter,
  getZodiacToken,
  readMarketSafely
} from "@zodiacs/sdk";

const token = getZodiacToken("aries");
const placeholder = createPlaceholderMarketAdapter();
const dexScreener = createDexScreenerMarketAdapter();
const jupiter = createJupiterMarketAdapter();

const market = await readMarketSafely(dexScreener, {
  sign: "aries",
  token
});

console.log(market.status);
console.log(market.priceUsd);
```

`MarketSnapshot` includes `priceUsd`, `marketCap`, `fdv`, `liquidity`,
`volume24h`, `change24h`, `supply`, `source`, `lastUpdated`, and
`status: "ok" | "unavailable"`. Unavailable snapshots include an optional
typed `error`.

## Next.js Example

See [examples/nextjs](./examples/nextjs) for a minimal read-only integration app.

```sh
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.mainnet-beta.solana.com" corepack pnpm --filter zodiacs-sdk-nextjs-example dev
```

The example includes a wallet address input, zodiac selector, `ZodiacAssetCard`,
`ZodiacsPanel`, read-only balance lookup, and placeholder market context.

## Security Posture

Zodiacs SDK v0.1.0 is read-only. It does not include signing, swaps, trading,
custody, private keys, buy buttons, sell buttons, or financial-promotional
claims.
