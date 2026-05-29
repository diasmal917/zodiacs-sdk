# Official Bridged Base Representations

Base ERC-20 Zodiacs are official bridged representations of the native Solana
SPL assets. They are not modeled as independent originals.

In the SDK registry, Base representations are marked:

- `chain: "base"`
- `chainId: 8453`
- `kind: "bridged"`
- `tokenStandard: "ERC20"`
- `isCanonicalOrigin: false`
- `originChain: "solana"`
- `originAddress: <native Solana mint>`

Bridge metadata records the official provenance:

- `status: "official-bridged"`
- `protocol: "wormhole"`
- `sourceChain: "solana"`
- `destinationChain: "base"`

The Base representations are deployed through Wormhole BridgeToken contracts.

Apps can lead with Base holdings in Base-focused interfaces while still showing
the provenance line: native on Solana, bridged to Base.
