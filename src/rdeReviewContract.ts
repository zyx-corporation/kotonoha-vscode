/** RDE attach / review / export CLI contracts (M3-c; unit-tested). */

export const HUMAN_JUDGMENT_BANNER =
  "RDE does not substitute for human judgment.";

export type ReviewDecision = "approve" | "hold" | "reject";
export type RdeSourceKind = "cli" | "llm" | "import" | "replay";

export interface M2ExportSummary {
  format: string | null;
  assessmentCount: number;
  latestAssessmentId: string | null;
  latestSourceKind: string | null;
  validationWarnings: string[];
  humanReviewRequired: boolean;
  summaryParagraph: string | null;
}

export function buildRdeAttachArgs(
  deltaId: string,
  sourceKind: RdeSourceKind = "cli"
): string[] {
  return [
    "rde",
    "attach",
    "--delta-id",
    deltaId,
    "--source-kind",
    sourceKind,
  ];
}

export function buildReviewArgs(
  decision: ReviewDecision,
  deltaId: string,
  assessmentId?: string,
  decidedBy?: string
): string[] {
  const args = ["review", decision, "--delta-id", deltaId];
  if (assessmentId?.trim()) {
    args.push("--assessment-id", assessmentId.trim());
  }
  const by = decidedBy?.trim();
  if (by) {
    args.push("--decided-by", by);
  }
  return args;
}

export function buildExportArgs(
  deltaId: string,
  format: "m1" | "m2" = "m2"
): string[] {
  return ["export", "--delta-id", deltaId, "--format", format];
}

export function parseReviewDecision(raw: string): ReviewDecision | null {
  const n = raw.toLowerCase().trim();
  if (n === "approve" || n === "hold" || n === "reject") {
    return n;
  }
  return null;
}

export function validateRdeAttachPreconditions(opts: {
  databaseUrl: string;
  deltaId: string | null | undefined;
  workspaceReady?: boolean;
}): string | null {
  if (opts.workspaceReady === false) {
    return "Open a folder workspace (Git repository) before using Kotonoha.";
  }
  if (!opts.databaseUrl?.trim()) {
    return "Set kotonoha.databaseUrl (or DATABASE_URL) before attaching RDE.";
  }
  if (!opts.deltaId?.trim()) {
    return "Register a MeaningDelta first.";
  }
  return null;
}

export function validateReviewPreconditions(opts: {
  databaseUrl: string;
  deltaId: string | null | undefined;
  decision: string;
  workspaceReady?: boolean;
}): string | null {
  const base = validateRdeAttachPreconditions({
    databaseUrl: opts.databaseUrl,
    deltaId: opts.deltaId,
    workspaceReady: opts.workspaceReady,
  });
  if (base) {
    return base.replace("attaching RDE", "recording review");
  }
  if (!parseReviewDecision(opts.decision)) {
    return "Unknown review decision.";
  }
  return null;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function stringField(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  return typeof v === "string" ? v : null;
}

export function summarizeM2Export(data: unknown): M2ExportSummary {
  const empty: M2ExportSummary = {
    format: null,
    assessmentCount: 0,
    latestAssessmentId: null,
    latestSourceKind: null,
    validationWarnings: [],
    humanReviewRequired: false,
    summaryParagraph: null,
  };
  const root = asRecord(data);
  if (!root) {
    return empty;
  }

  const assessments = Array.isArray(root.rde_assessments)
    ? root.rde_assessments
    : [];
  const decisions = Array.isArray(root.review_decisions)
    ? root.review_decisions
    : [];
  const latest = assessments[assessments.length - 1];
  const latestObj = asRecord(latest);

  let validationWarnings: string[] = [];
  const report = latestObj ? asRecord(latestObj.validation_report) : null;
  if (report && Array.isArray(report.warnings)) {
    validationWarnings = report.warnings.filter(
      (w): w is string => typeof w === "string"
    );
  }

  const assessmentCount = assessments.length;
  const humanReviewRequired = assessmentCount > 0 && decisions.length === 0;

  return {
    format: stringField(root, "format"),
    assessmentCount,
    latestAssessmentId: latestObj ? stringField(latestObj, "id") : null,
    latestSourceKind: latestObj ? stringField(latestObj, "source_kind") : null,
    validationWarnings,
    humanReviewRequired,
    summaryParagraph: stringField(root, "summary_paragraph"),
  };
}

export function truncatePreview(text: string, maxLen: number): string {
  if (text.length <= maxLen) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxLen - 1))}…`;
}

export function formatM2ExportPreview(
  summary: M2ExportSummary,
  prettyJson: string,
  maxLen = 1200
): string {
  const lines: string[] = [];
  if (summary.summaryParagraph) {
    lines.push(`Summary: ${summary.summaryParagraph}`);
  }
  if (summary.humanReviewRequired) {
    lines.push("⚠ Human review required (no ReviewDecision recorded).");
  }
  if (summary.validationWarnings.length > 0) {
    lines.push(
      `Validation warnings (${summary.validationWarnings.length}): ${summary.validationWarnings.join("; ")}`
    );
  }
  if (summary.latestAssessmentId) {
    lines.push(
      `Latest RDE: ${summary.latestAssessmentId} · source_kind=${summary.latestSourceKind ?? "—"}`
    );
  }
  lines.push("");
  lines.push(truncatePreview(prettyJson, maxLen));
  return lines.join("\n");
}
