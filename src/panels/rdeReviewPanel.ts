import * as vscode from "vscode";
import { runCli, runCliOrThrow } from "../cli";
import { session } from "../state";
import { escapeHtml } from "../util/escapeHtml";
import { webviewShell } from "../webview/html";

export class RdeReviewPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "kotonoha.rdeReview";

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
          await this.attachRde(webviewView.webview);
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
    webview.html = webviewShell(
      "RDE & Review",
      `
  <h2>RDE assessment</h2>
  <div class="card">
    <p class="note">ΔM: <code>${escapeHtml(String(delta))}</code></p>
    <button onclick="attach()">Attach RDE (pick JSON file)</button>
    <button class="secondary" onclick="refresh()">Refresh export preview</button>
    ${session.lastAssessmentId ? `<p class="ok">Last assessment: ${escapeHtml(session.lastAssessmentId)}</p>` : ""}
  </div>
  <h2>Review</h2>
  <div class="card">
    <p class="warn">RDE does not substitute for human judgment.</p>
    <button onclick="review('approve')">Approve</button>
    <button class="secondary" onclick="review('hold')">Hold</button>
    <button class="secondary" onclick="review('reject')">Reject</button>
    <button class="secondary" onclick="exportM2()">Copy export (m2)</button>
  </div>
  ${exportPreview ? `<h2>Export preview</h2><pre class="card" style="white-space:pre-wrap;font-size:10px;max-height:160px;overflow:auto">${escapeHtml(exportPreview)}</pre>` : ""}
  ${message ? `<p class="${isError ? "error" : "ok"}">${escapeHtml(message)}</p>` : ""}
  <script>
    const vscode = acquireVsCodeApi();
    function attach() { vscode.postMessage({ type: 'attach' }); }
    function review(d) { vscode.postMessage({ type: 'review', decision: d }); }
    function exportM2() { vscode.postMessage({ type: 'export' }); }
    function refresh() { vscode.postMessage({ type: 'refresh' }); }
  </script>`
    );
  }

  private async attachRde(webview: vscode.Webview): Promise<void> {
    if (!session.lastDeltaId) {
      this.render(webview, undefined, "Register a MeaningDelta first.", true);
      return;
    }
    const pick = await vscode.window.showOpenDialog({
      canSelectMany: false,
      filters: { JSON: ["json"] },
    });
    if (!pick?.[0]) return;

    try {
      const buf = await vscode.workspace.fs.readFile(pick[0]);
      const json = buf.toString();
      const id = await runCliOrThrow(
        [
          "rde",
          "attach",
          "--delta-id",
          session.lastDeltaId,
          "--source-kind",
          "cli",
        ],
        json
      );
      session.lastAssessmentId = id;
      this.render(webview, undefined, `Attached RDE: ${id}`);
    } catch (e) {
      this.render(webview, undefined, e instanceof Error ? e.message : String(e), true);
    }
  }

  private async review(
    decision: string,
    webview: vscode.Webview
  ): Promise<void> {
    if (!session.lastDeltaId) {
      this.render(webview, undefined, "No MeaningDelta.", true);
      return;
    }
    const sub = decision === "approve" ? "approve" : decision === "hold" ? "hold" : "reject";
    const args = ["review", sub, "--delta-id", session.lastDeltaId];
    if (session.lastAssessmentId) {
      args.push("--assessment-id", session.lastAssessmentId);
    }
    try {
      const id = await runCliOrThrow(args);
      this.render(webview, undefined, `Review recorded: ${id}`);
    } catch (e) {
      this.render(webview, undefined, e instanceof Error ? e.message : String(e), true);
    }
  }

  private async refreshExport(webview: vscode.Webview): Promise<void> {
    if (!session.lastDeltaId) {
      this.render(webview, undefined, "No MeaningDelta.", true);
      return;
    }
    try {
      const out = await runCliOrThrow([
        "export",
        "--delta-id",
        session.lastDeltaId,
        "--format",
        "m2",
      ]);
      const pretty = JSON.stringify(JSON.parse(out), null, 2);
      const summary = pretty.slice(0, 1200) + (pretty.length > 1200 ? "\n…" : "");
      this.render(webview, summary);
    } catch (e) {
      this.render(webview, undefined, e instanceof Error ? e.message : String(e), true);
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
      const out = await runCliOrThrow([
        "export",
        "--delta-id",
        session.lastDeltaId,
        "--format",
        "m2",
      ]);
      await vscode.env.clipboard.writeText(out);
      vscode.window.showInformationMessage("Kotonoha: m2 export copied to clipboard.");
    } catch (e) {
      vscode.window.showErrorMessage(
        e instanceof Error ? e.message : String(e)
      );
    }
  }
}
