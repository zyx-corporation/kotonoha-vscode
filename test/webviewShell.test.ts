import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { webviewShell } from "../dist/webview/html";

describe("webviewShell", () => {
  it("wraps body in CSP HTML document (positive)", () => {
    const html = webviewShell("Test", "<p>ok</p>");
    assert.match(html, /<!DOCTYPE html>/);
    assert.match(html, /Content-Security-Policy/);
    assert.match(html, /<title>Test<\/title>/);
    assert.match(html, /<p>ok<\/p>/);
  });
});
