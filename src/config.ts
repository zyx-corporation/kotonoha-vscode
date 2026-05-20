import * as vscode from "vscode";

export interface KotonohaConfig {
  cliPath: string;
  projectPath: string;
  databaseUrl: string;
  decidedBy: string;
}

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

export function cliEnv(config: KotonohaConfig): NodeJS.ProcessEnv {
  const env = { ...process.env };
  if (config.databaseUrl) {
    env.DATABASE_URL = config.databaseUrl;
  }
  if (config.decidedBy) {
    env.KOTONOHA_DECIDED_BY = config.decidedBy;
  }
  return env;
}
