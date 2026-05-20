import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "../dist/util/escapeHtml";

describe("escapeHtml", () => {
  it("escapes HTML metacharacters (negative / XSS invariant)", () => {
    assert.equal(
      escapeHtml(`<&>"' script`),
      "&lt;&amp;&gt;&quot;&#39; script"
    );
  });

  it("leaves safe plain text unchanged (positive)", () => {
    assert.equal(escapeHtml("main · L12–18"), "main · L12–18");
  });
});
