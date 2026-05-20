import { spawn } from "child_process";
import { getConfig, cliEnv } from "./config";

export interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

export class CliError extends Error {
  constructor(
    message: string,
    readonly exitCode: number,
    readonly stderr: string
  ) {
    super(message);
  }
}

export async function runCli(
  args: string[],
  stdin?: string
): Promise<CliResult> {
  const config = getConfig();
  const cwd = config.projectPath || undefined;

  return new Promise((resolve, reject) => {
    const child = spawn(config.cliPath, args, {
      cwd,
      env: cliEnv(config),
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });

    if (stdin !== undefined) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });
}

export async function runCliOrThrow(
  args: string[],
  stdin?: string
): Promise<string> {
  const result = await runCli(args, stdin);
  if (result.code !== 0) {
    const hint = exitHint(result.code);
    throw new CliError(
      `${hint}\n${result.stderr.trim() || result.stdout.trim()}`,
      result.code,
      result.stderr
    );
  }
  return result.stdout.trim();
}

function exitHint(code: number): string {
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
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    out[key] = val;
  }
  return out;
}
