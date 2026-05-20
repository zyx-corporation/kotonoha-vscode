export interface KotonohaConfig {
  cliPath: string;
  projectPath: string;
  databaseUrl: string;
  decidedBy: string;
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
