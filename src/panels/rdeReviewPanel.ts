import * as vscode from "vscode";
import { runCliOrThrow } from "../cli";
import { getConfig } from "../config";
import {
  HUMAN_JUDGMENT_BANNER,
  buildExportArgs,
  buildRdeAttachArgs,
  buildReviewArgs,
  formatM2ExportPreview,
  parseReviewDecision,
  summarizeM2Export,
  validateRdeAttachPreconditions,
  validateReviewPreconditions,
} from "../rdeReviewContract";
import { session } from "../state";
import { escapeHtml } from "../util/escapeHtml";
import { webviewShell } from "../webview/html";

export class RdeReviewPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "kotonoha.rdeReview";

  private lastExportSummary?: ReturnType<typeof summarizeM2Export>;

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = { enableScripts: true };
    this.render(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.type) {
        case "attach":
          await this.attachRdeFromFile(webviewView.webview);
          break;
        case "paste":
          await this.attachRdeFromClipboard(webviewView.webview);
          break;
        case "review":
          await this.review(msg.decision, webviewView.webview);
          break;
        case "export":
          await this.copyExportInternal();
          break;
        case "refresh":
          await this.refreshExport(webviewView.webview);
          break;
      }
    });
  }

  private render(
    webview: vscode.Webview,
    exportPreview?: string,
    message?: string,
    isError?: boolean
  ): void {
    const delta = session.lastDeltaId ?? "— (register ΔM first)";
    const summary = this.lastExportSummary;
    const warnBlock =
      summary && summary.validationWarnings.length > 0
        ? `<p class="warn">Strict / validation: ${escapeHtml(summary.validationWarnings.join("; "))}</p>`
        : "";
    const reviewBlock =
      summary?.humanReviewRequired
        ? `<p class="warn">Human review required — no ReviewDecision yet.</p>`
        : "";

    webview.html = webviewShell(
      "RDE & Review",
      `
  <h2>RDE assessment</h2>
  <div class="card">
    <p class="note">ΔM: <code>${escapeHtml(String(delta))}</code></p>
    <button onclick="attach()">Attach RDE (pick JSON file)</button>
    <button class="secondary" onclick="paste()">Paste RDE from clipboard</button>
    <button class="secondary" onclick="refresh()">Refresh export preview</button>
    ${session.lastAssessmentId ? `<p class="ok">Last assessment: ${escapeHtml(session.lastAssessmentId)}</p>` : ""}
    ${warnBlock}
    ${reviewBlock}
  </div>
  <h2>Review</h2>
  <div class="card">
    <p class="warn">${escapeHtml(HUMAN_JUDGMENT_BANNER)}</p>
    <button onclick="review('approve')">Approve</button>
    <button class="secondary" onclick="review('hold')">Hold</button>
    <button class="secondary" onclick="review('reject')">Reject</button>
    <button class="secondary" onclick="exportM2()">Copy export (m2)</button>
  </div>
  ${exportPreview ? `<h2>Export preview</h2><pre class="card" style="white-space:pre-wrap;font-size:10px;max-height:200px;overflow:auto">${escapeHtml(exportPreview)}</pre>` : ""}
  ${message ? `<p class="${isError ? "error" : "ok"}">${escapeHtml(message)}</p>` : ""}
  <script>
    const vscode = acquireVsCodeApi();
    function attach() { vscode.postMessage({ type: 'attach' }); }
    function paste() { vscode.postMessage({ type: 'paste' }); }
    function review(d) { vscode.postMessage({ type: 'review', decision: d }); }
    function exportM2() { vscode.postMessage({ type: 'export' }); }
    function refresh() { vscode.postMessage({ type: 'refresh' }); }
  </script>`
    );
  }

  private async attachRdeFromFile(webview: vscode.Webview): Promise<void> {
    const config = getConfig();
    const preflight = validateRdeAttachPreconditions({
      databaseUrl: config.databaseUrl,
      deltaId: session.lastDeltaId,
    });
    if (preflight) {
      this.render(webview, undefined, preflight, true);
      return;
    }

    const pick = await vscode.window.showOpenDialog({
      canSelectMany: false,
      filters: { JSON: ["json"] },
    });
    if (!pick?.[0]) {
      return;
    }

    const buf = await vscode.workspace.fs.readFile(pick[0]);
    await this.attachRdeJson(webview, buf.toString());
  }

  private async attachRdeFromClipboard(webview: vscode.Webview): Promise<void> {
    const config = getConfig();
    const preflight = validateRdeAttachPreconditions({
      databaseUrl: config.databaseUrl,
      deltaId: session.lastDeltaId,
    });
    if (preflight) {
      this.render(webview, undefined, preflight, true);
      return;
    }

    const json = (await vscode.env.clipboard.readText()).trim();
    if (!json) {
      this.render(webview, undefined, "Clipboard is empty.", true);
      return;
    }
    await this.attachRdeJson(webview, json);
  }

  private async attachRdeJson(webview: vscode.Webview, json: string): Promise<void> {
    const deltaId = session.lastDeltaId!;
    try {
      const id = await runCliOrThrow(buildRdeAttachArgs(deltaId), json);
      session.lastAssessmentId = id;
      await this.refreshExport(webview, `Attached RDE: ${id}`);
    } catch (e) {
      this.render(
        webview,
        undefined,
        e instanceof Error ? e.message : String(e),
        true
      );
    }
  }

  private async review(
    decision: string,
    webview: vscode.Webview
  ): Promise<void> {
    const config = getConfig();
    const preflight = validateReviewPreconditions({
      databaseUrl: config.databaseUrl,
      deltaId: session.lastDeltaId,
      decision,
    });
    if (preflight) {
      this.render(webview, undefined, preflight, true);
      return;
    }

    const sub = parseReviewDecision(decision)!;
    const args = buildReviewArgs(
      sub,
      session.lastDeltaId!,
      session.lastAssessmentId ?? undefined,
      config.decidedBy
    );

    try {
      const id = await runCliOrThrow(args);
      await this.refreshExport(webview, `Review recorded: ${id}`);
    } catch (e) {
      this.render(
        webview,
        undefined,
        e instanceof Error ? e.message : String(e),
        true
      );
    }
  }

  private async refreshExport(
    webview: vscode.Webview,
    message?: string
  ): Promise<void> {
    if (!session.lastDeltaId) {
      this.render(webview, undefined, "Register a MeaningDelta first.", true);
      return;
    }

    try {
      const out = await runCliOrThrow(buildExportArgs(session.lastDeltaId));
      const parsed = JSON.parse(out) as unknown;
      this.lastExportSummary = summarizeM2Export(parsed);
      const pretty = JSON.stringify(parsed, null, 2);
      const preview = formatM2ExportPreview(this.lastExportSummary, pretty);
      if (
        this.lastExportSummary.latestAssessmentId &&
        !session.lastAssessmentId
      ) {
        session.lastAssessmentId = this.lastExportSummary.latestAssessmentId;
      }
      this.render(webview, preview, message);
    } catch (e) {
      this.render(
        webview,
        undefined,
        e instanceof Error ? e.message : String(e),
        true
      );
    }
  }

  public copyExport(): Promise<void> {
    return this.copyExportInternal();
  }

  private async copyExportInternal(): Promise<void> {
    if (!session.lastDeltaId) {
      vscode.window.showErrorMessage("Kotonoha: register a MeaningDelta first.");
      return;
    }
    try {
      const out = await runCliOrThrow(buildExportArgs(session.lastDeltaId));
      await vscode.env.clipboard.writeText(out);
      vscode.window.showInformationMessage(
        "Kotonoha: m2 export copied to clipboard."
      );
    } catch (e) {
      vscode.window.showErrorMessage(
        e instanceof Error ? e.message : String(e)
      );
    }
  }
}
