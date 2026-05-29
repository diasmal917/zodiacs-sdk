# AGENTS.md

You are building the Zodiacs SDK for Zodiacs.org.

The SDK is the official read-only integration layer for the canonical Zodiacs.org registry. Solana SPL mints are native origins, and Base ERC-20 addresses are official bridged representations. Keep the SDK restrained, durable, and institutional.

Rules:
- TypeScript only.
- pnpm workspace.
- ESM packages.
- Build packages with tsup.
- Test with Vitest.
- No private keys.
- No wallet signing.
- No transaction submission.
- No asset movement helpers.
- Market data is optional and must fail safely.
- Important UI text must be real HTML, not baked into images.

Language:
- Use “cultural asset,” “symbolic identity,” “ownership,” and “market context.”
- Avoid hype, memes, and financial-promotional claims.
