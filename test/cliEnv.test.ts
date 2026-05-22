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
      principalId: "00000000-0000-0000-0000-000000000001",
      projectId: "00000000-0000-0000-0000-000000000099",
    });
    assert.equal(env.DATABASE_URL, "postgres://local/test");
    assert.equal(env.KOTONOHA_DECIDED_BY, "reviewer@example");
    assert.equal(env.KOTONOHA_PRINCIPAL_ID, "00000000-0000-0000-0000-000000000001");
    assert.equal(env.KOTONOHA_PROJECT_ID, "00000000-0000-0000-0000-000000000099");
  });

  it("does not inject empty secrets (negative)", () => {
    const env = cliEnv({
      cliPath: "kotonoha",
      projectPath: "",
      databaseUrl: "",
      decidedBy: "",
      principalId: "",
      projectId: "",
    });
    assert.equal(env.DATABASE_URL, base.DATABASE_URL);
    assert.equal(env.KOTONOHA_DECIDED_BY, base.KOTONOHA_DECIDED_BY);
    assert.equal(env.KOTONOHA_PRINCIPAL_ID, base.KOTONOHA_PRINCIPAL_ID);
    assert.equal(env.KOTONOHA_PROJECT_ID, base.KOTONOHA_PROJECT_ID);
  });
});
