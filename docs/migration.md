# Migration Notes

Existing Solana read APIs remain available:

- `getZodiacBalance`
- `getZodiacsOwnership`
- `getHeldZodiacs`
- `useZodiacBalance`
- `useZodiacMarket`
- `useZodiacToken`

These compatibility helpers continue to read native Solana SPL assets.

New integrations should prefer explicit names:

- `getSolanaZodiacBalance`
- `getSolanaZodiacsOwnership`
- `getBaseZodiacBalance`
- `getBaseZodiacsOwnership`
- `getCrossChainZodiacsOwnership`

The key model change is that the SDK now exposes a canonical multi-chain
registry. Solana SPL mints are the native originals. Base ERC-20 addresses are
official bridged representations that point back to the Solana mint for the
same sign.
