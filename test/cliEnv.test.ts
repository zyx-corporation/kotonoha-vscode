import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cliEnv } from "../dist/cliEnv";

describe("cliEnv", () => {
  const base = { ...process.env };

  it("sets DATABASE_URL and KOTONOHA_DECIDED_BY when configured (positive)", () => {
    const env = cliEnv({
      cliPath: "kotonoha",
      projectPath: "/repo",
      databaseUrl: "postgres://local/test",
      decidedBy: "reviewer@example",
    });
    assert.equal(env.DATABASE_URL, "postgres://local/test");
    assert.equal(env.KOTONOHA_DECIDED_BY, "reviewer@example");
  });

  it("does not inject empty secrets (negative)", () => {
    const env = cliEnv({
      cliPath: "kotonoha",
      projectPath: "",
      databaseUrl: "",
      decidedBy: "",
    });
    assert.equal(env.DATABASE_URL, base.DATABASE_URL);
    assert.equal(env.KOTONOHA_DECIDED_BY, base.KOTONOHA_DECIDED_BY);
  });
});
