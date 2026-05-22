export interface KotonohaConfig {
  cliPath: string;
  projectPath: string;
  databaseUrl: string;
  decidedBy: string;
  /** M7-c: maps to `KOTONOHA_PRINCIPAL_ID` for CLI / core RBAC */
  principalId: string;
  /** M7-c: maps to `KOTONOHA_PROJECT_ID` for project-scoped commands */
  projectId: string;
}

export function cliEnv(config: KotonohaConfig): NodeJS.ProcessEnv {
  const env = { ...process.env };
  if (config.databaseUrl) {
    env.DATABASE_URL = config.databaseUrl;
  }
  if (config.decidedBy) {
    env.KOTONOHA_DECIDED_BY = config.decidedBy;
  }
  if (config.principalId) {
    env.KOTONOHA_PRINCIPAL_ID = config.principalId;
  }
  if (config.projectId) {
    env.KOTONOHA_PROJECT_ID = config.projectId;
  }
  return env;
}
