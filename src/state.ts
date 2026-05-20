/** Shared UI state across webview panels (M3 scaffold). */
export interface KotonohaSession {
  lastDeltaId?: string;
  lastAssessmentId?: string;
}

export const session: KotonohaSession = {};
