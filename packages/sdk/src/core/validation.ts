import { ZODIAC_SIGNS, type ZodiacSign, type ZodiacToken } from "./types.js";

const signSet = new Set<string>(ZODIAC_SIGNS);
const base58Pattern = /^[1-9A-HJ-NP-Za-km-z]+$/u;

export function normalizeZodiacSign(value: string): ZodiacSign | null {
  const normalized = value.trim().toLowerCase().replaceAll(/\s|-/gu, "");
  return signSet.has(normalized) ? (normalized as ZodiacSign) : null;
}

export function isZodiacSign(value: string): value is ZodiacSign {
  return normalizeZodiacSign(value) === value;
}

export function assertZodiacSign(value: string): ZodiacSign {
  const sign = normalizeZodiacSign(value);

  if (!sign) {
    throw new Error(`Invalid zodiac sign: ${value}`);
  }

  return sign;
}

export function isLikelyBase58Address(value: string): boolean {
  return value.length >= 32 && value.length <= 44 && base58Pattern.test(value);
}

export function validateWalletAddress(value: string): boolean {
  return isLikelyBase58Address(value);
}

export function validateMintAddress(value: string): boolean {
  return isLikelyBase58Address(value);
}

export function validateZodiacToken(token: ZodiacToken): readonly string[] {
  const errors: string[] = [];

  if (!ZODIAC_SIGNS.includes(token.sign)) {
    errors.push(`Unsupported sign: ${token.sign}`);
  }

  if (!token.name.trim()) {
    errors.push("Token name is required.");
  }

  if (token.slug !== token.sign) {
    errors.push(`Token slug must match sign: ${token.slug}`);
  }

  if (!/^[A-Z0-9._-]{2,16}$/u.test(token.ticker)) {
    errors.push(`Token ticker is invalid: ${token.ticker}`);
  }

  if (!Number.isInteger(token.order) || token.order < 1 || token.order > 12) {
    errors.push(`Token order must be an integer from 1 to 12: ${token.order}`);
  }

  if (!token.symbol.trim()) {
    errors.push("Token symbol is required.");
  }

  if (!token.archetype.trim()) {
    errors.push("Token archetype is required.");
  }

  if (!token.shortBio.trim()) {
    errors.push("Token shortBio is required.");
  }

  if (!Number.isInteger(token.decimals) || token.decimals < 0 || token.decimals > 18) {
    errors.push(`Token decimals must be an integer from 0 to 18: ${token.decimals}`);
  }

  if (!validateMintAddress(token.mintAddress)) {
    errors.push(`Mint address is invalid for ${token.sign}.`);
  }

  return errors;
}
