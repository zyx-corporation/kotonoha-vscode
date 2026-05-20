import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseStatus } from "../dist/cliContract";

describe("parseStatus", () => {
  it("parses kotonoha status key: value lines (positive)", () => {
    const stdout = [
      "repository: /tmp/repo",
      "branch: main",
      "commit: abc1234",
      "working tree: dirty (2 files)",
      "database: connected",
      "meaning_deltas: 3",
    ].join("\n");

    assert.deepEqual(parseStatus(stdout), {
      repository: "/tmp/repo",
      branch: "main",
      commit: "abc1234",
      "working tree": "dirty (2 files)",
      database: "connected",
      meaning_deltas: "3",
    });
  });

  it("ignores lines without a colon (negative / invariant)", () => {
    assert.deepEqual(parseStatus("no colon here\nbranch: dev\n"), {
      branch: "dev",
    });
  });

  it("returns empty object for empty stdout", () => {
    assert.deepEqual(parseStatus(""), {});
  });

  it("uses first colon only when value contains colons", () => {
    assert.deepEqual(parseStatus("note: time: 12:00"), { note: "time: 12:00" });
  });

  it("merges dirty changes line into working tree (positive)", () => {
    const s = parseStatus(
      "working tree: dirty\nchanges: staged=1 unstaged=0 untracked=0"
    );
    assert.match(s["working tree"], /dirty/);
    assert.match(s["working tree"], /staged=1/);
  });

  it("parses kotonoha init line (positive)", () => {
    const s = parseStatus("kotonoha: not initialized (run `kotonoha init`)");
    assert.match(s["kotonoha_init"], /not initialized/);
  });
});
