import * as vscode from "vscode";
import type { KotonohaConfig } from "./cliEnv";

export type { KotonohaConfig } from "./cliEnv";
export { cliEnv } from "./cliEnv";

export function getConfig(): KotonohaConfig {
  const cfg = vscode.workspace.getConfiguration("kotonoha");
  const folders = vscode.workspace.workspaceFolders;
  const defaultRoot = folders?.[0]?.uri.fsPath ?? "";
  return {
    cliPath: cfg.get<string>("cliPath", "kotonoha"),
    projectPath: cfg.get<string>("projectPath", "") || defaultRoot,
    databaseUrl: cfg.get<string>("databaseUrl", ""),
    decidedBy: cfg.get<string>("decidedBy", ""),
  };
}
