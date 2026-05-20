import * as vscode from "vscode";
import { runCliOrThrow } from "../cli";
import { getConfig } from "../config";
import { buildDeltaCreateArgs } from "../deltaCreateArgs";
import {
  buildObservationFromForm,
  computeLineAnchor,
  observationHasPayload,
  validateRegisterPreconditions,
} from "../meaningDeltaForm";
import { escapeHtml } from "../util/escapeHtml";
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
    const { lineStart, lineEnd } = computeLineAnchor(
      sel?.start.line ?? null,
      sel?.end.line ?? null,
      Boolean(sel && !sel.isEmpty)
    );

    webview.html = webviewShell(
      "Meaning Delta",
      `
  <h2>Meaning delta (ΔM)</h2>
  <div class="card">
    <label for="intended">Intended change (SHOULD)</label>
    <textarea id="intended" placeholder="What meaning change do you intend?"></textarea>
    <label for="preserved">Preserved (comma-separated, optional)</label>
    <input id="preserved" placeholder="intent, scope" />
    <label for="lost">Lost (optional)</label>
    <input id="lost" />
    <label for="transformed">Transformed (optional)</label>
    <input id="transformed" />
    <label for="unresolved">Unresolved (optional)</label>
    <input id="unresolved" />
    <label for="drift">Drift (optional)</label>
    <input id="drift" />
    <p class="note">Anchor: ${escapeHtml(relFile || "—")} · lines ${lineStart ?? "?"}–${lineEnd ?? "?"}</p>
    <button onclick="register()">Register ΔM</button>
    ${session.lastDeltaId ? `<p class="ok">Last ΔM: ${escapeHtml(session.lastDeltaId)}</p>` : ""}
    ${message ? `<p class="${isError ? "error" : "ok"}">${escapeHtml(message)}</p>` : ""}
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    function register() {
      vscode.postMessage({
        type: 'register',
        intended: document.getElementById('intended').value,
        preservedCsv: document.getElementById('preserved').value,
        lost: document.getElementById('lost').value,
        transformed: document.getElementById('transformed').value,
        unresolved: document.getElementById('unresolved').value,
        drift: document.getElementById('drift').value,
        file: ${JSON.stringify(relFile)},
        lineStart: ${lineStart !== null ? lineStart : "null"},
        lineEnd: ${lineEnd !== null ? lineEnd : "null"},
      });
    }
  </script>`
    );
  }

  private async registerDelta(
    msg: {
      intended?: string;
      preservedCsv?: string;
      lost?: string;
      transformed?: string;
      unresolved?: string;
      drift?: string;
      file: string;
      lineStart: number | null;
      lineEnd: number | null;
    },
    webview: vscode.Webview
  ): Promise<void> {
    const config = getConfig();
    const preflight = validateRegisterPreconditions({
      databaseUrl: config.databaseUrl,
      file: msg.file,
    });
    if (preflight) {
      this.render(webview, preflight, true);
      return;
    }

    const observation = buildObservationFromForm(msg);
    let obsPath: string | undefined;

    try {
      if (observationHasPayload(observation)) {
        obsPath = await writeTempJson(observation);
      }
      const args = buildDeltaCreateArgs(
        msg.file,
        msg.lineStart,
        msg.lineEnd,
        obsPath
      );
      const id = await runCliOrThrow(args);
      session.lastDeltaId = id;
      this.render(webview, `Registered meaning delta: ${id}`);
      vscode.window.showInformationMessage(`Kotonoha: MeaningDelta ${id}`);
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      this.render(webview, text, true);
    } finally {
      if (obsPath) {
        await vscode.workspace.fs.delete(vscode.Uri.file(obsPath));
      }
    }
  }
}

async function writeTempJson(data: unknown): Promise<string> {
  const root =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "/tmp";
  const uri = vscode.Uri.file(
    `${root}/.kotonoha-obs-${Date.now()}.json`
  );
  await vscode.workspace.fs.writeFile(
    uri,
    Buffer.from(JSON.stringify(data, null, 2), "utf8")
  );
  return uri.fsPath;
}
