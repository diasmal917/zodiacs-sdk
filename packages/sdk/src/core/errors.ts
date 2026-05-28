export type ZodiacsValidationErrorCode =
  | "invalid-zodiac-sign"
  | "invalid-wallet-address"
  | "invalid-mint-address"
  | "invalid-rpc-endpoint"
  | "invalid-solana-connection";

export class ZodiacsValidationError extends Error {
  override readonly name = "ZodiacsValidationError";
  readonly code: ZodiacsValidationErrorCode;

  constructor(code: ZodiacsValidationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
