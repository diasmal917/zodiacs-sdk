# Official Zodiacs.org Registry

The Zodiacs SDK exposes the official Zodiacs.org registry as neutral
infrastructure for downstream apps, clients, interfaces, and integrators.

The registry models one canonical asset universe:

- each sign is one asset identity
- each sign has one native Solana SPL mint
- each sign has one official bridged Base ERC-20 representation
- every Base representation points back to its Solana origin

The registry does not claim ownership over astrology, zodiac signs, or zodiac
glyphs. It identifies the official Zodiacs.org representations so apps can
verify addresses and render official cultural asset metadata safely.

Machine-readable artifact:

```txt
packages/sdk/registry/zodiacs.registry.json
```

Primary helpers:

- `getZodiacsRegistry`
- `getZodiacAsset`
- `getRepresentationByAddress`
- `isOfficialZodiacAddress`
- `getNativeCounterpart`
- `getBridgedCounterpart`
