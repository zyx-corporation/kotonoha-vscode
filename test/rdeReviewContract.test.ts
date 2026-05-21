import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  HUMAN_JUDGMENT_BANNER,
  buildExportArgs,
  buildRdeAttachArgs,
  buildReviewArgs,
  formatM2ExportPreview,
  parseReviewDecision,
  summarizeM2Export,
  truncatePreview,
  validateRdeAttachPreconditions,
  validateReviewPreconditions,
} from "../dist/rdeReviewContract";

const SAMPLE_M2 = {
  format: "kotonoha.m2_export.v0.1",
  summary_paragraph: "One delta with RDE.",
  rde_assessments: [
    {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      source_kind: "cli",
      validation_report: {
        strict: false,
        warnings: ["category preserved is empty"],
        warning_count: 1,
      },
    },
  ],
  review_decisions: [],
};

describe("HUMAN_JUDGMENT_BANNER", () => {
  it("matches cli-definition human responsibility wording (invariant)", () => {
    assert.match(HUMAN_JUDGMENT_BANNER, /does not substitute/i);
  });
});

describe("buildRdeAttachArgs", () => {
  it("includes delta-id and default source-kind cli (positive)", () => {
    assert.deepEqual(buildRdeAttachArgs("d-1"), [
      "rde",
      "attach",
      "--delta-id",
      "d-1",
      "--source-kind",
      "cli",
    ]);
  });

  it("allows explicit source-kind (positive)", () => {
    assert.deepEqual(buildRdeAttachArgs("d-1", "llm"), [
      "rde",
      "attach",
      "--delta-id",
      "d-1",
      "--source-kind",
      "llm",
    ]);
  });
});

describe("buildReviewArgs", () => {
  it("maps approve/hold/reject subcommands (positive)", () => {
    assert.deepEqual(buildReviewArgs("approve", "d-1", "a-1"), [
      "review",
      "approve",
      "--delta-id",
      "d-1",
      "--assessment-id",
      "a-1",
    ]);
  });

  it("adds decided-by when configured (positive)", () => {
    assert.deepEqual(
      buildReviewArgs("hold", "d-1", undefined, "reviewer@example"),
      ["review", "hold", "--delta-id", "d-1", "--decided-by", "reviewer@example"]
    );
  });
});

describe("buildExportArgs", () => {
  it("requests m2 export by default (positive)", () => {
    assert.deepEqual(buildExportArgs("d-1"), [
      "export",
      "--delta-id",
      "d-1",
      "--format",
      "m2",
    ]);
  });
});

describe("parseReviewDecision", () => {
  it("accepts known decisions (positive)", () => {
    assert.equal(parseReviewDecision("approve"), "approve");
    assert.equal(parseReviewDecision("Hold"), "hold");
  });

  it("rejects unknown decisions (negative)", () => {
    assert.equal(parseReviewDecision("maybe"), null);
  });
});

describe("validateRdeAttachPreconditions", () => {
  it("blocks without database URL (exit 1 equivalent)", () => {
    assert.equal(
      validateRdeAttachPreconditions({ databaseUrl: "", deltaId: "x" }),
      "preflight.databaseUrlAttach"
    );
  });

  it("blocks without delta id (negative)", () => {
    assert.equal(
      validateRdeAttachPreconditions({
        databaseUrl: "postgres://x",
        deltaId: null,
      }),
      "preflight.deltaRequired"
    );
  });
});

describe("validateReviewPreconditions", () => {
  it("requires valid decision subcommand (negative)", () => {
    assert.equal(
      validateReviewPreconditions({
        databaseUrl: "postgres://x",
        deltaId: "d",
        decision: "invalid",
      }),
      "preflight.unknownDecision"
    );
  });
});

describe("summarizeM2Export", () => {
  it("extracts validation_report warnings and human-review flag (positive)", () => {
    const s = summarizeM2Export(SAMPLE_M2);
    assert.equal(s.format, "kotonoha.m2_export.v0.1");
    assert.equal(s.assessmentCount, 1);
    assert.equal(s.latestAssessmentId, "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    assert.equal(s.latestSourceKind, "cli");
    assert.deepEqual(s.validationWarnings, ["category preserved is empty"]);
    assert.equal(s.humanReviewRequired, true);
    assert.equal(s.summaryParagraph, "One delta with RDE.");
  });

  it("humanReviewRequired false when review exists (negative)", () => {
    const s = summarizeM2Export({
      ...SAMPLE_M2,
      review_decisions: [{ id: "r-1", decision: "approve" }],
    });
    assert.equal(s.humanReviewRequired, false);
  });

  it("tolerates malformed export (negative)", () => {
    const s = summarizeM2Export(null);
    assert.equal(s.assessmentCount, 0);
    assert.equal(s.humanReviewRequired, false);
  });
});

describe("truncatePreview", () => {
  it("truncates long text with ellipsis (positive)", () => {
    assert.equal(truncatePreview("abcdef", 4), "abc…");
  });
});

describe("formatM2ExportPreview", () => {
  it("includes summary header and JSON body (positive)", () => {
    const text = formatM2ExportPreview(
      summarizeM2Export(SAMPLE_M2),
      JSON.stringify(SAMPLE_M2, null, 2),
      "en",
      500
    );
    assert.match(text, /Human review required/i);
    assert.match(text, /validation warning/i);
    assert.match(text, /kotonoha\.m2_export/);
  });
});
