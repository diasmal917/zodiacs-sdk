# Native Solana Zodiacs

The native Zodiacs assets are SPL tokens on Solana. In the SDK registry, Solana
representations are marked:

- `chain: "solana"`
- `kind: "native"`
- `tokenStandard: "SPL"`
- `isCanonicalOrigin: true`

Apps should use the explicit Solana read helpers for native ownership state:

- `getSolanaZodiacBalance`
- `getSolanaZodiacBalances`
- `getSolanaZodiacsOwnership`
- `getSolanaHeldZodiacs`

The older generic helpers remain as compatibility aliases for Solana reads.
New integrations should prefer explicit chain names.
