# Address Verification

The verifier helpers answer whether a token address is part of the official
Zodiacs.org registry and what representation it is.

Useful helpers:

- `isOfficialZodiacAddress`
- `isOfficialSolanaZodiacMint`
- `isOfficialBaseZodiacAddress`
- `getRepresentationByAddress`
- `getZodiacSignByAddress`
- `getNativeCounterpart`
- `assertOfficialZodiacAddress`

Unknown addresses return `false` or `null`. Assertion helpers throw typed
errors for flows that require a hard failure.

EVM address lookup is case-insensitive. Solana mint lookup preserves the
existing Solana address string.

Neutral labels:

- Official native Zodiacs.org asset on Solana
- Official bridged Zodiacs.org asset on Base
- Not found in the official Zodiacs.org registry
