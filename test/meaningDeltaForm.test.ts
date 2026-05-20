import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildObservationFromForm,
  computeLineAnchor,
  observationHasPayload,
  validateRegisterPreconditions,
} from "../dist/meaningDeltaForm";

describe("validateRegisterPreconditions", () => {
  it("requires database URL (maps to CLI exit 1 / env)", () => {
    assert.equal(
      validateRegisterPreconditions({ databaseUrl: "", file: "a.md" }),
      "Set kotonoha.databaseUrl (or DATABASE_URL) before registering."
    );
  });

  it("requires an anchored file (negative)", () => {
    assert.equal(
      validateRegisterPreconditions({
        databaseUrl: "postgres://x",
        file: "",
      }),
      "Open a file in the workspace first."
    );
  });

  it("returns null when ready (positive)", () => {
    assert.equal(
      validateRegisterPreconditions({
        databaseUrl: "postgres://x",
        file: "docs/x.md",
      }),
      null
    );
  });
});

describe("computeLineAnchor", () => {
  it("uses caret line when selection is empty (positive)", () => {
    assert.deepEqual(computeLineAnchor(11, 11, false), {
      lineStart: 12,
      lineEnd: 12,
    });
  });

  it("uses selection line range when non-empty (positive)", () => {
    assert.deepEqual(computeLineAnchor(4, 9, true), {
      lineStart: 5,
      lineEnd: 10,
    });
  });

  it("returns nulls when editor line unknown (negative)", () => {
    assert.deepEqual(computeLineAnchor(null, null, false), {
      lineStart: null,
      lineEnd: null,
    });
  });
});

describe("buildObservationFromForm", () => {
  it("maps form fields to observation JSON per M3 §4.2 (positive)", () => {
    assert.deepEqual(
      buildObservationFromForm({
        intended: " Clarify scope ",
        preservedCsv: "intent, scope",
        lost: "old wording",
        transformed: "new policy",
        unresolved: "open Q",
        drift: "terminology shift",
      }),
      {
        intended_change: "Clarify scope",
        preserved: ["intent", "scope"],
        lost: ["old wording"],
        transformed: ["new policy"],
        unresolved: ["open Q"],
        drift: ["terminology shift"],
      }
    );
  });

  it("omits whitespace-only fields (negative)", () => {
    assert.deepEqual(
      buildObservationFromForm({
        intended: "   ",
        preservedCsv: "",
      }),
      {}
    );
  });
});

describe("observationHasPayload", () => {
  it("is false for empty observation (negative)", () => {
    assert.equal(observationHasPayload({}), false);
  });

  it("is true when any key present (positive)", () => {
    assert.equal(observationHasPayload({ intended_change: "x" }), true);
  });
});
