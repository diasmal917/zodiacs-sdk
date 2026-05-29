# Zodiacs SDK

Official read-only TypeScript SDK for the canonical Zodiacs.org registry,
native Solana SPL Zodiacs assets, and official bridged Base ERC-20
representations.

```sh
pnpm add @zodiacs/sdk
```

```ts
import {
  getRepresentationByAddress,
  getSolanaZodiacRepresentation,
  getBaseZodiacRepresentation
} from "@zodiacs/sdk";

const representation = getRepresentationByAddress(
  "0x3ffB5282F5891Dd8c813E64059EdB0607537eC91"
);

console.log(representation?.kind); // "bridged"
console.log(getSolanaZodiacRepresentation("aries").chain); // "solana"
console.log(getBaseZodiacRepresentation("aries").originChain); // "solana"
```

The SDK is read-only. It provides registry verification, public balance reads,
metadata, React hooks, and UI components. It does not request private keys,
sign messages, submit transactions, provide custody, or provide transaction
approval helpers.

Always verify official addresses against the published Zodiacs.org registry.
The SDK exposes the official registry for apps and clients, but downstream
interfaces should display chain and representation provenance clearly.
