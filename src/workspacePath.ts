import * as path from "path";

/** Repo-relative path (pure; unit-tested). */
export function relativeRepoFile(repoRoot: string, absoluteFile: string): string {
  const rel = path.relative(repoRoot, absoluteFile);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return "";
  }
  return rel.split(path.sep).join("/");
}
