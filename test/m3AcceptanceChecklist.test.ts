import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { M3_GATE_CHECKLIST } from "../dist/m3AcceptanceChecklist";

describe("M3_GATE_CHECKLIST", () => {
  it("has nine items matching spec §6 + UI quality gates (invariant)", () => {
    assert.equal(M3_GATE_CHECKLIST.length, 9);
  });

  it("uses unique ids (negative)", () => {
    const ids = M3_GATE_CHECKLIST.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("covers git context and review gate wording (positive)", () => {
    const text = M3_GATE_CHECKLIST.map((i) => i.criterion).join(" ");
    assert.match(text, /Git 差分/);
    assert.match(text, /MeaningDelta/);
    assert.match(text, /RDEAssessment/);
    assert.match(text, /ReviewDecision/);
    assert.match(text, /CLI/);
    assert.match(text, /README/);
    assert.match(text, /多言語化/);
    assert.match(text, /デザイン評価/);
  });
});
