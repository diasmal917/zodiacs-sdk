export type ZodiacsValidationErrorCode =
  | "invalid-zodiac-sign"
  | "invalid-wallet-address"
  | "invalid-mint-address"
  | "invalid-rpc-endpoint"
  | "invalid-solana-connection"
  | "invalid-zodiac-address"
  | "unsupported-zodiacs-chain"
  | "unofficial-zodiac-address"
  | "zodiac-read-unavailable"
  | "zodiac-registry-integrity";

export class ZodiacsError extends Error {
  override readonly name: string = "ZodiacsError";
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class ZodiacsValidationError extends ZodiacsError {
  override readonly name: string = "ZodiacsValidationError";

  constructor(code: ZodiacsValidationErrorCode, message: string) {
    super(code, message);
  }
}

export class InvalidZodiacSignError extends ZodiacsValidationError {
  override readonly name: string = "InvalidZodiacSignError";

  constructor(value: string) {
    super("invalid-zodiac-sign", `Invalid zodiac sign: ${value}`);
  }
}

export class InvalidZodiacAddressError extends ZodiacsValidationError {
  override readonly name: string = "InvalidZodiacAddressError";

  constructor(value: string) {
    super("invalid-zodiac-address", `Invalid Zodiacs address: ${value}`);
  }
}

export class UnsupportedZodiacsChainError extends ZodiacsValidationError {
  override readonly name: string = "UnsupportedZodiacsChainError";

  constructor(value: string) {
    super("unsupported-zodiacs-chain", `Unsupported Zodiacs chain: ${value}`);
  }
}

export class UnofficialZodiacAddressError extends ZodiacsValidationError {
  override readonly name: string = "UnofficialZodiacAddressError";

  constructor(value: string) {
    super("unofficial-zodiac-address", `Address not found in the official Zodiacs.org registry: ${value}`);
  }
}

export class ZodiacReadUnavailableError extends ZodiacsError {
  override readonly name: string = "ZodiacReadUnavailableError";

  constructor(message = "Zodiacs read is unavailable.") {
    super("zodiac-read-unavailable", message);
  }
}

export class ZodiacRegistryIntegrityError extends ZodiacsError {
  override readonly name: string = "ZodiacRegistryIntegrityError";

  constructor(message: string) {
    super("zodiac-registry-integrity", message);
  }
}
