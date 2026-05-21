import * as vscode from "vscode";
import { buildStatusArgs } from "../cliArgs";
import { runCli } from "../cli";
import { parseStatus } from "../cliContract";
import { getConfig } from "../config";
import { getPanelLocale, t } from "../i18n";
import { escapeHtml } from "../util/escapeHtml";
import { getEditorRelFile, requireWorkspaceIssue } from "../workspace";
import { webviewShell } from "../webview/html";

export class ContextPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "kotonoha.context";

  private webview?: vscode.Webview;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    this.webview = webviewView.webview;
    void this.render(this.webview);

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === "refresh") {
        await this.refresh();
      }
    });
  }

  public refresh(): void {
    if (this.webview) {
      void this.render(this.webview);
    }
  }

  public async render(webview: vscode.Webview): Promise<void> {
    const locale = getPanelLocale();
    const editor = vscode.window.activeTextEditor;
    const config = getConfig();
    const relFile = getEditorRelFile(editor) || "—";
    const sel = editor?.selection;
    const selection =
      sel && !sel.isEmpty
        ? `L${sel.start.line + 1}–${sel.end.line + 1}`
        : sel
          ? `L${sel.start.line + 1}:${sel.start.character + 1}`
          : "—";

    const wsIssue = requireWorkspaceIssue();
    let statusBlock = "";
    let error = wsIssue ? t(locale, wsIssue) : "";

    if (!error) {
      try {
        const result = await runCli(buildStatusArgs(config.projectPath));
        if (result.code !== 0) {
          error =
            result.stderr ||
            t(locale, "context.statusExit", { code: result.code });
        } else {
          const s = parseStatus(result.stdout);
          const row = (key: keyof typeof s, labelKey: Parameters<typeof t>[1]) =>
            `<dt>${escapeHtml(t(locale, labelKey))}</dt><dd>${escapeHtml(s[key] ?? "—")}</dd>`;
          statusBlock = `
<dl>
  ${row("repository", "context.status.repository")}
  ${row("branch", "context.status.branch")}
  ${row("commit", "context.status.commit")}
  ${row("working tree", "context.status.workingTree")}
  ${row("database", "context.status.database")}
  ${row("meaning_deltas", "context.status.meaningDeltas")}
  ${row("project_id", "context.status.projectId")}
  <dt>${escapeHtml(t(locale, "context.status.kotonohaInit"))}</dt><dd>${escapeHtml(s["kotonoha_init"] ?? "ok")}</dd>
</dl>`;
        }
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }
    }

    webview.html = webviewShell(
      t(locale, "context.pageTitle"),
      `
  <h2>${escapeHtml(t(locale, "context.heading"))}</h2>
  <div class="card">
    <dl>
      <dt>${escapeHtml(t(locale, "context.activeFile"))}</dt><dd>${escapeHtml(relFile)}</dd>
      <dt>${escapeHtml(t(locale, "context.selection"))}</dt><dd>${escapeHtml(selection)}</dd>
    </dl>
    ${statusBlock}
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
    <button onclick="refresh()">${escapeHtml(t(locale, "context.refresh"))}</button>
  </div>
  <p class="note">${escapeHtml(t(locale, "context.gitDiffNote"))}</p>
  <script>
    const vscode = acquireVsCodeApi();
    function refresh() { vscode.postMessage({ type: 'refresh' }); }
  </script>`,
      locale
    );
  }
}
