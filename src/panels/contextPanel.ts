import * as vscode from "vscode";
import { runCli } from "../cli";
import { parseStatus } from "../cliContract";
import { getConfig } from "../config";
import { escapeHtml } from "../util/escapeHtml";
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
    const editor = vscode.window.activeTextEditor;
    const config = getConfig();
    const relFile = editor
      ? vscode.workspace.asRelativePath(editor.document.uri, false)
      : "—";
    const sel = editor?.selection;
    const selection =
      sel && !sel.isEmpty
        ? `L${sel.start.line + 1}–${sel.end.line + 1}`
        : sel
          ? `L${sel.start.line + 1}:${sel.start.character + 1}`
          : "—";

    let statusBlock = "";
    let error = "";

    try {
      const result = await runCli(["status"]);
      if (result.code !== 0) {
        error = result.stderr || `status exited ${result.code}`;
      } else {
        const s = parseStatus(result.stdout);
        statusBlock = `
<dl>
  <dt>repository</dt><dd>${escapeHtml(s["repository"] ?? (config.projectPath || "—"))}</dd>
  <dt>branch</dt><dd>${escapeHtml(s["branch"] ?? "—")}</dd>
  <dt>commit</dt><dd>${escapeHtml(s["commit"] ?? "—")}</dd>
  <dt>working tree</dt><dd>${escapeHtml(s["working tree"] ?? "—")}</dd>
  <dt>database</dt><dd>${escapeHtml(s["database"] ?? "—")}</dd>
  <dt>meaning_deltas</dt><dd>${escapeHtml(s["meaning_deltas"] ?? "—")}</dd>
</dl>`;
      }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }

    webview.html = webviewShell(
      "Kotonoha Context",
      `
  <h2>Current context</h2>
  <div class="card">
    <dl>
      <dt>active file</dt><dd>${escapeHtml(relFile)}</dd>
      <dt>selection</dt><dd>${escapeHtml(selection)}</dd>
    </dl>
    ${statusBlock}
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
    <button onclick="refresh()">Refresh</button>
  </div>
  <p class="note">Git diff: use VS Code Source Control or <code>kotonoha diff</code>.</p>
  <script>
    const vscode = acquireVsCodeApi();
    function refresh() { vscode.postMessage({ type: 'refresh' }); }
  </script>`
    );
  }
}
