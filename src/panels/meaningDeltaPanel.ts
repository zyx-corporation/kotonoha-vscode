import * as vscode from "vscode";
import { runCliOrThrow } from "../cli";
import { getConfig } from "../config";
import { session } from "../state";
import { webviewShell } from "../webview/html";

export class MeaningDeltaPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "kotonoha.meaningDelta";

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = { enableScripts: true };
    this.render(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === "register") {
        await this.registerDelta(msg, webviewView.webview);
      }
    });
  }

  private render(webview: vscode.Webview, message?: string, isError?: boolean): void {
    const editor = vscode.window.activeTextEditor;
    const relFile = editor
      ? vscode.workspace.asRelativePath(editor.document.uri, false)
      : "";
    const sel = editor?.selection;
    const lineStart = sel ? sel.start.line + 1 : "";
    const lineEnd = sel && !sel.isEmpty ? sel.end.line + 1 : sel ? sel.start.line + 1 : "";

    webview.html = webviewShell(
      "Meaning Delta",
      `
  <h2>Meaning delta (ΔM)</h2>
  <div class="card">
    <label for="intended">Intended change (SHOULD)</label>
    <textarea id="intended" placeholder="What meaning change do you intend?"></textarea>
    <label>Preserved (comma-separated, optional)</label>
    <input id="preserved" placeholder="intent, scope" />
    <label>Lost (optional)</label>
    <input id="lost" />
    <label>Transformed (optional)</label>
    <input id="transformed" />
    <label>Unresolved (optional)</label>
    <input id="unresolved" />
    <p class="note">Anchor: ${esc(relFile || "—")} · lines ${lineStart || "?"}–${lineEnd || "?"}</p>
    <button onclick="register()">Register ΔM</button>
    ${session.lastDeltaId ? `<p class="ok">Last ΔM: ${esc(session.lastDeltaId)}</p>` : ""}
    ${message ? `<p class="${isError ? "error" : "ok"}">${esc(message)}</p>` : ""}
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    function register() {
      const obs = {};
      const p = document.getElementById('preserved').value.trim();
      const l = document.getElementById('lost').value.trim();
      const t = document.getElementById('transformed').value.trim();
      const u = document.getElementById('unresolved').value.trim();
      if (p) obs.preserved = p.split(',').map(s => s.trim()).filter(Boolean);
      if (l) obs.lost = l.split(',').map(s => s.trim()).filter(Boolean);
      if (t) obs.transformed = [t];
      if (u) obs.unresolved = [u];
      vscode.postMessage({
        type: 'register',
        intended: document.getElementById('intended').value,
        observation: obs,
        file: ${JSON.stringify(relFile)},
        lineStart: ${lineStart || "null"},
        lineEnd: ${lineEnd || "null"},
      });
    }
  </script>`
    );
  }

  private async registerDelta(
    msg: {
      file: string;
      lineStart: number | null;
      lineEnd: number | null;
      observation: Record<string, unknown>;
    },
    webview: vscode.Webview
  ): Promise<void> {
    const config = getConfig();
    if (!config.databaseUrl) {
      this.render(
        webview,
        "Set kotonoha.databaseUrl (or DATABASE_URL) before registering.",
        true
      );
      return;
    }
    if (!msg.file) {
      this.render(webview, "Open a file in the workspace first.", true);
      return;
    }

    const obsPath = await writeTempJson(msg.observation);
    try {
      const args = ["delta", "create", msg.file];
      if (msg.lineStart != null) {
        args.push("--line-start", String(msg.lineStart));
      }
      if (msg.lineEnd != null) {
        args.push("--line-end", String(msg.lineEnd));
      }
      if (Object.keys(msg.observation).length > 0) {
        args.push(obsPath);
      }
      const id = await runCliOrThrow(args);
      session.lastDeltaId = id;
      this.render(webview, `Registered meaning delta: ${id}`);
      vscode.window.showInformationMessage(`Kotonoha: MeaningDelta ${id}`);
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      this.render(webview, text, true);
    } finally {
      await vscode.workspace.fs.delete(vscode.Uri.file(obsPath));
    }
  }
}

async function writeTempJson(data: unknown): Promise<string> {
  const uri = vscode.Uri.file(
    `${vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "/tmp"}/.kotonoha-obs-${Date.now()}.json`
  );
  await vscode.workspace.fs.writeFile(
    uri,
    Buffer.from(JSON.stringify(data, null, 2), "utf8")
  );
  return uri.fsPath;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
