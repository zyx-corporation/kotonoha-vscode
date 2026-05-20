/** CLI stdout / exit-code helpers (no VS Code dependency; unit-tested). */

/** User-facing hint for CLI exit codes (see cli-definition). */
export function exitHint(code: number): string {
  switch (code) {
    case 1:
      return "CLI exit 1: environment / usage (check DATABASE_URL, Git repo, settings)";
    case 2:
      return "CLI exit 2: validation failed";
    case 3:
      return "CLI exit 3: database or I/O error";
    default:
      return `CLI exit ${code}`;
  }
}

/** Parse `kotonoha status` stdout into key/value lines we care about. */
export function parseStatus(stdout: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of stdout.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    let key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key === "kotonoha") {
      out["kotonoha_init"] = val;
      continue;
    }
    if (key.startsWith("kotonoha ")) {
      key = key.slice("kotonoha ".length);
    }
    if (key === "changes" && out["working tree"]) {
      out["working tree"] = `${out["working tree"]} · ${val}`;
    } else {
      out[key] = val;
    }
  }
  return out;
}
