import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildDeltaCreateArgs } from "../dist/deltaCreateArgs";

describe("buildDeltaCreateArgs", () => {
  it("builds minimal delta create argv (positive)", () => {
    assert.deepEqual(buildDeltaCreateArgs("src/a.rs", null, null), [
      "delta",
      "create",
      "src/a.rs",
    ]);
  });

  it("includes line anchors and observation path when provided (positive)", () => {
    assert.deepEqual(
      buildDeltaCreateArgs("docs/x.md", 12, 18, "/tmp/obs.json"),
      [
        "delta",
        "create",
        "docs/x.md",
        "--line-start",
        "12",
        "--line-end",
        "18",
        "--observation",
        "/tmp/obs.json",
      ]
    );
  });

  it("omits observation path when undefined (negative)", () => {
    const args = buildDeltaCreateArgs("f.ts", 1, 1, undefined);
    assert.equal(args.includes("--line-start"), true);
    assert.equal(args.some((a: string) => a.endsWith(".json")), false);
  });
});
