/** MeaningDelta registration form → CLI observation (M3-b; unit-tested). */

export interface MeaningDeltaFormInput {
  intended?: string;
  preservedCsv?: string;
  lost?: string;
  transformed?: string;
  unresolved?: string;
  drift?: string;
}

export function validateRegisterPreconditions(opts: {
  databaseUrl: string;
  file: string;
  workspaceReady?: boolean;
}): string | null {
  if (opts.workspaceReady === false) {
    return "Open a folder workspace (Git repository) before using Kotonoha.";
  }
  if (!opts.databaseUrl?.trim()) {
    return "Set kotonoha.databaseUrl (or DATABASE_URL) before registering.";
  }
  if (!opts.file?.trim()) {
    return "Open a file inside the workspace folder (not an out-of-workspace path).";
  }
  return null;
}

/** 0-based editor lines → 1-based CLI `--line-start` / `--line-end`. */
export function computeLineAnchor(
  startLine0: number | null,
  endLine0: number | null,
  hasNonEmptySelection: boolean
): { lineStart: number | null; lineEnd: number | null } {
  if (startLine0 === null) {
    return { lineStart: null, lineEnd: null };
  }
  const lineStart = startLine0 + 1;
  const lineEnd =
    hasNonEmptySelection && endLine0 !== null ? endLine0 + 1 : lineStart;
  return { lineStart, lineEnd };
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Build observation object for `kotonoha delta create` (positional JSON file). */
export function buildObservationFromForm(
  form: MeaningDeltaFormInput
): Record<string, unknown> {
  const obs: Record<string, unknown> = {};
  const intended = form.intended?.trim();
  if (intended) {
    obs.intended_change = intended;
  }
  const preserved = form.preservedCsv?.trim();
  if (preserved) {
    obs.preserved = splitCsv(preserved);
  }
  const lost = form.lost?.trim();
  if (lost) {
    obs.lost = splitCsv(lost);
  }
  const transformed = form.transformed?.trim();
  if (transformed) {
    obs.transformed = [transformed];
  }
  const unresolved = form.unresolved?.trim();
  if (unresolved) {
    obs.unresolved = [unresolved];
  }
  const drift = form.drift?.trim();
  if (drift) {
    obs.drift = [drift];
  }
  return obs;
}

export function observationHasPayload(
  observation: Record<string, unknown>
): boolean {
  return Object.keys(observation).length > 0;
}
