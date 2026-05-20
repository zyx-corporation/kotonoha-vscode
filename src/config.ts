import * as vscode from "vscode";
import type { KotonohaConfig } from "./cliEnv";
import { getProjectRoot } from "./workspace";

export type { KotonohaConfig } from "./cliEnv";
export { cliEnv } from "./cliEnv";

export function getConfig(): KotonohaConfig {
  const cfg = vscode.workspace.getConfiguration("kotonoha");
  return {
    cliPath: cfg.get<string>("cliPath", "kotonoha"),
    projectPath: getProjectRoot(vscode.window.activeTextEditor),
    databaseUrl: cfg.get<string>("databaseUrl", ""),
    decidedBy: cfg.get<string>("decidedBy", ""),
  };
}
