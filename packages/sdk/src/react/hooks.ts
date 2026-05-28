import { useEffect, useMemo, useState } from "react";
import {
  getZodiacMetadata,
  getZodiacToken,
  readZodiacBalance,
  type ZodiacBalanceResult,
  type ZodiacMetadata,
  type ZodiacSign,
  type ZodiacToken
} from "../core/index.js";
import {
  readMarketSafely,
  type ZodiacMarketData
} from "../market/index.js";
import { useZodiacs } from "./context.js";

const balanceReaderNotConfiguredMessage =
  "Balance reader is not configured. Provide rpcUrl or balanceReader to ZodiacsProvider.";

export interface UseZodiacTokenResult {
  readonly metadata: ZodiacMetadata;
  readonly token: ZodiacToken;
}

export interface AsyncHookState<T> {
  readonly data: T | null;
  readonly error: Error | null;
  readonly loading: boolean;
}

export interface UseZodiacMarketOptions {
  readonly enabled?: boolean;
}

export function useZodiacToken(sign: ZodiacSign): UseZodiacTokenResult {
  const { registry } = useZodiacs();

  return useMemo(
    () => ({
      metadata: getZodiacMetadata(sign),
      token: getZodiacToken(sign, registry)
    }),
    [registry, sign]
  );
}

export function useZodiacBalance(
  sign: ZodiacSign,
  ownerAddress: string | null | undefined
): AsyncHookState<ZodiacBalanceResult> {
  const { balanceReader, registry } = useZodiacs();
  const { token } = useZodiacToken(sign);
  const [state, setState] = useState<AsyncHookState<ZodiacBalanceResult>>({
    data: null,
    error: null,
    loading: false
  });

  useEffect(() => {
    const normalizedOwnerAddress = ownerAddress?.trim();

    if (!normalizedOwnerAddress) {
      setState({ data: null, error: null, loading: false });
      return;
    }

    if (!balanceReader) {
      const error = new Error(balanceReaderNotConfiguredMessage);
      setState({
        data: unavailableZodiacBalanceResult(sign, token, error.message),
        error,
        loading: false
      });
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, error: null, loading: true }));

    readZodiacBalance({
      ownerAddress: normalizedOwnerAddress,
      reader: balanceReader,
      registry,
      sign
    })
      .then((data: ZodiacBalanceResult) => {
        if (!cancelled) {
          const error = data.status === "unavailable" ? new Error(data.reason ?? "Balance unavailable.") : null;
          setState({ data, error, loading: false });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            error: error instanceof Error ? error : new Error("Balance request failed."),
            loading: false
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [balanceReader, ownerAddress, registry, sign, token]);

  return state;
}

export function useZodiacMarket(
  sign: ZodiacSign,
  options: UseZodiacMarketOptions = {}
): AsyncHookState<ZodiacMarketData> {
  const { marketAdapter } = useZodiacs();
  const { token } = useZodiacToken(sign);
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<AsyncHookState<ZodiacMarketData>>({
    data: null,
    error: null,
    loading: enabled
  });

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false });
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setState((current) => ({ ...current, error: null, loading: true }));

    readMarketSafely(marketAdapter, {
      sign,
      signal: controller.signal,
      token
    })
      .then((data: ZodiacMarketData) => {
        if (!cancelled) {
          setState({ data, error: null, loading: false });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            error: error instanceof Error ? error : new Error("Market request failed."),
            loading: false
          });
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled, marketAdapter, sign, token]);

  return state;
}

function unavailableZodiacBalanceResult(
  sign: ZodiacSign,
  token: ZodiacToken,
  reason: string
): ZodiacBalanceResult {
  return {
    sign,
    token,
    balance: null,
    status: "unavailable",
    reason
  };
}
