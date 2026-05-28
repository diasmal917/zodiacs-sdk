# Zodiacs SDK v0.1.0 Release Audit Checkpoint

This checkpoint documents the local state expected before the v0.1.0 release audit.

## Package Structure

- `@zodiacs/sdk` in `packages/sdk`
- `zodiacs-sdk-nextjs-example` in `examples/nextjs`

The workspace is managed with pnpm through `pnpm-workspace.yaml`.

## Implemented Features

- Typed registry for the twelve Zodiacs.org cultural assets.
- Metadata helpers for symbolic identity, ownership surfaces, and display copy.
- Read-only Solana balance helpers for SPL token accounts by wallet owner and mint.
- Optional market context adapters for DEX Screener, Jupiter, and placeholder data.
- React provider and hooks for token metadata, read-only balances, and market context.
- HTML-based React UI components for asset cards, ownership state, market context, and a twelve-asset panel.
- Minimal Next.js example app for read-only balance lookup and UI composition.

## Solana Balance Behavior

- Balance reads use public wallet addresses and token mint addresses.
- `getZodiacBalance` queries parsed token accounts by owner and mint, then sums all matching token accounts.
- Missing token accounts return a zero balance.
- RPC or malformed-response failures return a typed unavailable balance.
- Invalid wallet addresses, invalid zodiac signs, invalid mint addresses, invalid RPC endpoints, or invalid connection objects throw typed validation errors before RPC reads.
- `ZodiacsProvider` can use `rpcUrl` to create a first-party read-only balance reader, or accept a custom `balanceReader` override.

## Market Adapter Behavior

- Market data is optional display context.
- Placeholder market data returns an unavailable snapshot by design.
- DEX Screener and Jupiter adapters return normalized snapshots when usable data is available.
- Network failures, non-OK HTTP responses, JSON parse failures, missing markets, and malformed payloads return unavailable snapshots.
- Ordinary network, API, and data failures should not throw from adapters.

## Environment Variables

- `NEXT_PUBLIC_SOLANA_RPC_URL` enables read-only Solana balance lookup in the Next.js example.
- The SDK does not require private keys or secret environment variables.
- No `.env` file should be included in a source release.

## Test And Build Commands

```sh
corepack pnpm install
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```

Optional release dry-runs:

```sh
npm pack --dry-run --json
corepack pnpm publish --recursive --dry-run --no-git-checks --ignore-scripts --access public
```

Run package dry-runs from `packages/sdk`.

## Known Limitations

- The SDK does not execute transactions.
- Market context is optional and may be unavailable.
- Balance reads depend on the configured Solana RPC endpoint.
- Public RPC endpoints may rate-limit or return transient failures.
- The local audit workspace is not a git repository. Generated artifacts can be ignored by `.gitignore`, but tracked-file status and untracking cannot be verified in this workspace.

## Read-Only And Security Posture

The v0.1.0 SDK is read-only. It does not include signing, swaps, trading, custody, private keys, keypair generation, buy buttons, sell buttons, or transaction submission. It is built around cultural assets, symbolic identity, ownership, market context, scarcity, and symbolic endurance.

## Recommended Next Audit Prompt

```text
Audit the Zodiacs SDK for v0.1.0 release readiness. Confirm package exports, TypeScript declarations, ESM compatibility, build output, tests, React hooks, market adapter fault tolerance, Solana read-only balance behavior, example setup, README accuracy, npm publishing readiness, no private keys, no signing, no swaps or trading, no custody, no buy or sell buttons, no financial-promotional claims, and premium Zodiacs.org tone. Return blockers, non-blocking improvements, exact files needing changes, and a release readiness score.
```
