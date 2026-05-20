import { spawn } from "child_process";
import { exitHint } from "./cliContract";
import { getConfig, cliEnv } from "./config";

export { exitHint, parseStatus } from "./cliContract";

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
    throw new CliError(
      `${exitHint(result.code)}\n${result.stderr.trim() || result.stdout.trim()}`,
      result.code,
      result.stderr
    );
  }
  return result.stdout.trim();
}
