import * as vscode from "vscode";
import { runCliOrThrow } from "../cli";
import { getConfig } from "../config";
import { getPanelLocale, translateIssue, t } from "../i18n";
import {
  HUMAN_JUDGMENT_BANNER_KEY,
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
import { requireWorkspaceIssue } from "../workspace";
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
    this.webviewRef = webviewView.webview;
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
    const locale = getPanelLocale();
    const delta = session.lastDeltaId
      ? t(locale, "rde.deltaLabel", { id: session.lastDeltaId })
      : t(locale, "rde.deltaNone");
    const summary = this.lastExportSummary;
    const warnBlock =
      summary && summary.validationWarnings.length > 0
        ? `<p class="warn">${escapeHtml(
            t(locale, "rde.validationWarnings", {
              warnings: summary.validationWarnings.join("; "),
            })
          )}</p>`
        : "";
    const reviewBlock =
      summary?.humanReviewRequired
        ? `<p class="warn">${escapeHtml(t(locale, "rde.humanReviewRequiredPanel"))}</p>`
        : "";
    const messageBlock = message
      ? `<p class="${isError ? "error" : "ok"}">${escapeHtml(translateIssue(locale, message))}</p>`
      : "";
    const assessmentBlock = session.lastAssessmentId
      ? `<p class="ok">${escapeHtml(
          t(locale, "rde.lastAssessment", { id: session.lastAssessmentId })
        )}</p>`
      : "";
    const exportBlock = exportPreview
      ? `<h2>${escapeHtml(t(locale, "rde.headingExportPreview"))}</h2><pre class="card" style="white-space:pre-wrap;font-size:10px;max-height:200px;overflow:auto">${escapeHtml(exportPreview)}</pre>`
      : "";

    webview.html = webviewShell(
      t(locale, "rde.pageTitle"),
      `
  <h2>${escapeHtml(t(locale, "rde.headingAssessment"))}</h2>
  <div class="card">
    <p class="note"><code>${escapeHtml(delta)}</code></p>
    <button onclick="attach()">${escapeHtml(t(locale, "rde.attachFile"))}</button>
    <button class="secondary" onclick="paste()">${escapeHtml(t(locale, "rde.pasteClipboard"))}</button>
    <button class="secondary" onclick="refresh()">${escapeHtml(t(locale, "rde.refreshExport"))}</button>
    ${assessmentBlock}
    ${warnBlock}
    ${reviewBlock}
  </div>
  <h2>${escapeHtml(t(locale, "rde.headingReview"))}</h2>
  <div class="card">
    <p class="warn">${escapeHtml(t(locale, HUMAN_JUDGMENT_BANNER_KEY))}</p>
    <button onclick="review('approve')">${escapeHtml(t(locale, "rde.approve"))}</button>
    <button class="secondary" onclick="review('hold')">${escapeHtml(t(locale, "rde.hold"))}</button>
    <button class="secondary" onclick="review('reject')">${escapeHtml(t(locale, "rde.reject"))}</button>
    <button class="secondary" onclick="exportM2()">${escapeHtml(t(locale, "rde.copyExport"))}</button>
  </div>
  ${exportBlock}
  ${messageBlock}
  <script>
    const vscode = acquireVsCodeApi();
    function attach() { vscode.postMessage({ type: 'attach' }); }
    function paste() { vscode.postMessage({ type: 'paste' }); }
    function review(d) { vscode.postMessage({ type: 'review', decision: d }); }
    function exportM2() { vscode.postMessage({ type: 'export' }); }
    function refresh() { vscode.postMessage({ type: 'refresh' }); }
  </script>`,
      locale === "ja" ? "ja" : "en"
    );
  }

  private async attachRdeFromFile(webview: vscode.Webview): Promise<void> {
    const config = getConfig();
    const preflight = validateRdeAttachPreconditions({
      databaseUrl: config.databaseUrl,
      deltaId: session.lastDeltaId,
      workspaceReady: requireWorkspaceIssue() === null,
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
      workspaceReady: requireWorkspaceIssue() === null,
    });
    if (preflight) {
      this.render(webview, undefined, preflight, true);
      return;
    }

    const json = (await vscode.env.clipboard.readText()).trim();
    if (!json) {
      this.render(webview, undefined, "rde.clipboardEmpty", true);
      return;
    }
    await this.attachRdeJson(webview, json);
  }

  private async attachRdeJson(webview: vscode.Webview, json: string): Promise<void> {
    const locale = getPanelLocale();
    const deltaId = session.lastDeltaId!;
    try {
      JSON.parse(json);
    } catch {
      this.render(webview, undefined, "rde.invalidJson", true);
      return;
    }
    try {
      const id = await runCliOrThrow(buildRdeAttachArgs(deltaId), json);
      session.lastAssessmentId = id;
      await this.refreshExport(
        webview,
        t(locale, "rde.attached", { id })
      );
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
    const locale = getPanelLocale();
    const config = getConfig();
    const preflight = validateReviewPreconditions({
      databaseUrl: config.databaseUrl,
      deltaId: session.lastDeltaId,
      decision,
      workspaceReady: requireWorkspaceIssue() === null,
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
      await this.refreshExport(
        webview,
        t(locale, "rde.reviewRecorded", { id })
      );
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
    const locale = getPanelLocale();
    if (!session.lastDeltaId) {
      this.lastExportSummary = undefined;
      this.render(webview, undefined, "preflight.deltaRequired", true);
      return;
    }

    try {
      const out = await runCliOrThrow(buildExportArgs(session.lastDeltaId));
      const parsed = JSON.parse(out) as unknown;
      this.lastExportSummary = summarizeM2Export(parsed);
      const root = parsed as Record<string, unknown>;
      const decisionCount = Array.isArray(root.review_decisions)
        ? root.review_decisions.length
        : 0;
      if (decisionCount > 0) {
        this.lastExportSummary.humanReviewRequired = false;
      }
      const pretty = JSON.stringify(parsed, null, 2);
      const preview = formatM2ExportPreview(
        this.lastExportSummary,
        pretty,
        locale
      );
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

  public async runReviewFromCommand(decision: string): Promise<void> {
    const locale = getPanelLocale();
    if (!this.webviewRef) {
      vscode.window.showWarningMessage(t(locale, "notify.openRdePanelFirst"));
      return;
    }
    await this.review(decision, this.webviewRef);
  }

  private webviewRef?: vscode.Webview;

  /** Re-render and refresh export when Meaning Delta updates `session.lastDeltaId`. */
  public refresh(): void {
    if (!this.webviewRef) {
      return;
    }
    if (session.lastDeltaId) {
      void this.refreshExport(this.webviewRef);
    } else {
      this.lastExportSummary = undefined;
      this.render(this.webviewRef);
    }
  }

  public copyExport(): Promise<void> {
    return this.copyExportInternal();
  }

  private async copyExportInternal(): Promise<void> {
    const locale = getPanelLocale();
    if (!session.lastDeltaId) {
      vscode.window.showErrorMessage(t(locale, "notify.registerDeltaFirst"));
      return;
    }
    try {
      const out = await runCliOrThrow(buildExportArgs(session.lastDeltaId));
      await vscode.env.clipboard.writeText(out);
      vscode.window.showInformationMessage(t(locale, "notify.exportCopied"));
    } catch (e) {
      vscode.window.showErrorMessage(
        translateIssue(
          locale,
          e instanceof Error ? e.message : String(e)
        )
      );
    }
  }
}
