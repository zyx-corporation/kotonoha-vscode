/** Build `kotonoha delta create` argv (M3-b contract; unit-tested). */
export function buildDeltaCreateArgs(
  file: string,
  lineStart: number | null,
  lineEnd: number | null,
  observationFilePath?: string
): string[] {
  const args = ["delta", "create", file];
  if (lineStart != null) {
    args.push("--line-start", String(lineStart));
  }
  if (lineEnd != null) {
    args.push("--line-end", String(lineEnd));
  }
  if (observationFilePath) {
    args.push(observationFilePath);
  }
  return args;
}
