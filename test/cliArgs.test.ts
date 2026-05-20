import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildStatusArgs } from "../dist/cliArgs";

describe("buildStatusArgs", () => {
  it("passes --path for multi-root / explicit root (positive)", () => {
    assert.deepEqual(buildStatusArgs("/tmp/repo"), [
      "status",
      "--path",
      "/tmp/repo",
    ]);
  });

  it("omits --path when empty (negative)", () => {
    assert.deepEqual(buildStatusArgs(""), ["status"]);
  });
});
