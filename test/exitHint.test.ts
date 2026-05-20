import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { exitHint } from "../dist/cliContract";

describe("exitHint", () => {
  it("maps CLI exit codes 1–3 per cli-definition (positive)", () => {
    assert.match(exitHint(1), /environment|usage/i);
    assert.match(exitHint(2), /validation/i);
    assert.match(exitHint(3), /database|I\/O/i);
  });

  it("falls back for unknown codes (negative)", () => {
    assert.equal(exitHint(99), "CLI exit 99");
  });
});
