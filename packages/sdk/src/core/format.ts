import type { TokenBalance, ZodiacToken } from "./types.js";

export interface FormatTokenAmountOptions {
  readonly maximumFractionDigits?: number;
  readonly minimumFractionDigits?: number;
  readonly locale?: string;
}

export function formatCompactNumber(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    notation: "compact"
  }).format(value);
}

export function formatCurrency(value: number | null | undefined, currency = "USD", locale = "en-US"): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Unavailable";
  }

  return new Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits: value >= 1 ? 2 : 6,
    style: "currency"
  }).format(value);
}

export function formatPercentChange(value: number | null | undefined, locale = "en-US"): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Unavailable";
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
    style: "percent"
  }).format(value / 100);
}

export function formatTokenAmount(
  amountRaw: string | number | bigint,
  decimals: number,
  options: FormatTokenAmountOptions = {}
): string {
  const locale = options.locale ?? "en-US";
  const decimalValue = rawAmountToNumber(amountRaw, decimals);

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: options.maximumFractionDigits ?? 6,
    minimumFractionDigits: options.minimumFractionDigits ?? 0
  }).format(decimalValue);
}

export function formatZodiacBalance(
  balance: TokenBalance | null,
  token: ZodiacToken,
  options: FormatTokenAmountOptions = {}
): string {
  if (!balance) {
    return `0 ${token.ticker}`;
  }

  const amount =
    balance.uiAmount === null
      ? formatTokenAmount(balance.amountRaw, balance.decimals, options)
      : new Intl.NumberFormat(options.locale ?? "en-US", {
          maximumFractionDigits: options.maximumFractionDigits ?? 6,
          minimumFractionDigits: options.minimumFractionDigits ?? 0
        }).format(balance.uiAmount);

  return `${amount} ${token.ticker}`;
}

export function rawAmountToNumber(amountRaw: string | number | bigint, decimals: number): number {
  const raw = typeof amountRaw === "bigint" ? amountRaw.toString() : String(amountRaw);

  if (!/^\d+$/u.test(raw)) {
    throw new Error(`Token amount must be an unsigned integer string: ${raw}`);
  }

  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new Error(`Token decimals must be an integer from 0 to 18: ${decimals}`);
  }

  return Number(raw) / 10 ** decimals;
}
