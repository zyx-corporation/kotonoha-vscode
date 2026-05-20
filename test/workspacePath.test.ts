import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { relativeRepoFile } from "../dist/workspacePath";

describe("relativeRepoFile", () => {
  it("returns posix-relative path inside repo (positive)", () => {
    assert.equal(
      relativeRepoFile("/repo", "/repo/docs/a.md"),
      "docs/a.md"
    );
  });

  it("rejects paths outside repo (negative)", () => {
    assert.equal(relativeRepoFile("/repo", "/other/x.md"), "");
  });
});
