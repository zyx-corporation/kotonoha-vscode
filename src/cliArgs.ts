/** CLI argv builders shared by panels (unit-tested). */

export function buildStatusArgs(projectPath: string): string[] {
  const args = ["status"];
  if (projectPath) {
    args.push("--path", projectPath);
  }
  return args;
}
