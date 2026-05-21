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
import { getPanelLocale, translateIssue } from "../i18n";
import { getEditorRelFile, requireWorkspaceIssue } from "../workspace";
import { webviewShell } from "../webview/html";

interface FormState {
  intended?: string;
  preservedCsv?: string;
  lost?: string;
  transformed?: string;
  unresolved?: string;
  drift?: string;
}

export class MeaningDeltaPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "kotonoha.meaningDelta";

  private webview?: vscode.Webview;
  private lastForm: FormState = {};

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly onDeltaRegistered?: () => void
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = { enableScripts: true };
    this.webview = webviewView.webview;
    this.render(this.webview);

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === "register") {
        this.lastForm = {
          intended: msg.intended,
          preservedCsv: msg.preservedCsv,
          lost: msg.lost,
          transformed: msg.transformed,
          unresolved: msg.unresolved,
          drift: msg.drift,
        };
        await this.registerDelta(msg, this.webview!);
      }
    });
  }

  public refresh(): void {
    if (this.webview) {
      this.render(this.webview);
    }
  }

  private render(
    webview: vscode.Webview,
    message?: string,
    isError?: boolean
  ): void {
    const editor = vscode.window.activeTextEditor;
    const relFile = getEditorRelFile(editor);
    const sel = editor?.selection;
    const { lineStart, lineEnd } = computeLineAnchor(
      sel?.start.line ?? null,
      sel?.end.line ?? null,
      Boolean(sel && !sel.isEmpty)
    );
    const f = this.lastForm;

    webview.html = webviewShell(
      "Meaning Delta",
      `
  <h2>Meaning delta (ΔM)</h2>
  <div class="card">
    <label for="intended">Intended change (SHOULD)</label>
    <textarea id="intended" placeholder="What meaning change do you intend?">${escapeHtml(f.intended ?? "")}</textarea>
    <label for="preserved">Preserved (comma-separated, optional)</label>
    <input id="preserved" value="${escapeHtml(f.preservedCsv ?? "")}" placeholder="intent, scope" />
    <label for="lost">Lost (optional)</label>
    <input id="lost" value="${escapeHtml(f.lost ?? "")}" />
    <label for="transformed">Transformed (optional)</label>
    <input id="transformed" value="${escapeHtml(f.transformed ?? "")}" />
    <label for="unresolved">Unresolved (optional)</label>
    <input id="unresolved" value="${escapeHtml(f.unresolved ?? "")}" />
    <label for="drift">Drift (optional)</label>
    <input id="drift" value="${escapeHtml(f.drift ?? "")}" />
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
    const ws = requireWorkspaceIssue();
    const preflight = validateRegisterPreconditions({
      databaseUrl: config.databaseUrl,
      file: msg.file,
      workspaceReady: ws === null,
    });
    if (preflight) {
      this.render(
        webview,
        translateIssue(getPanelLocale(), preflight),
        true
      );
      return;
    }

    const observation = buildObservationFromForm(msg);
    let obsPath: string | undefined;

    try {
      if (observationHasPayload(observation)) {
        obsPath = await writeTempJson(config.projectPath, observation);
      }
      const args = buildDeltaCreateArgs(
        msg.file,
        msg.lineStart,
        msg.lineEnd,
        obsPath
      );
      const id = await runCliOrThrow(args);
      session.lastDeltaId = id;
      this.onDeltaRegistered?.();
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

async function writeTempJson(
  projectRoot: string,
  data: unknown
): Promise<string> {
  const root = projectRoot || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!root) {
    throw new Error("No workspace folder for observation temp file.");
  }
  const uri = vscode.Uri.file(
    `${root}/.kotonoha-obs-${Date.now()}.json`
  );
  await vscode.workspace.fs.writeFile(
    uri,
    Buffer.from(JSON.stringify(data, null, 2), "utf8")
  );
  return uri.fsPath;
}
