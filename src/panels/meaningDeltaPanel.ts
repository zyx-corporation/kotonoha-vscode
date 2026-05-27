import * as vscode from "vscode";
import { runCliOrThrow } from "../cli";
import { getConfig } from "../config";
import { buildDeltaCreateArgs } from "../deltaCreateArgs";
import { getPanelLocale, t, translateIssue } from "../i18n";
import {
  buildObservationFromForm,
  computeLineAnchor,
  observationHasPayload,
  validateRegisterPreconditions,
} from "../meaningDeltaForm";
import { escapeHtml } from "../util/escapeHtml";
import { session } from "../state";
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
    const locale = getPanelLocale();
    const editor = vscode.window.activeTextEditor;
    const relFile = getEditorRelFile(editor);
    const sel = editor?.selection;
    const { lineStart, lineEnd } = computeLineAnchor(
      sel?.start.line ?? null,
      sel?.end.line ?? null,
      Boolean(sel && !sel.isEmpty)
    );
    const f = this.lastForm;
    const anchor = t(locale, "meaningDelta.anchor", {
      file: relFile || "—",
      lineStart: lineStart ?? "?",
      lineEnd: lineEnd ?? "?",
    });
    const lastDeltaBlock = session.lastDeltaId
      ? `<p class="ok">${escapeHtml(t(locale, "meaningDelta.lastDelta", { id: session.lastDeltaId }))}</p>`
      : "";
    const statusBlock = message
      ? `<p class="${isError ? "error" : "ok"}">${escapeHtml(message)}</p>`
      : "";

    webview.html = webviewShell(
      t(locale, "meaningDelta.pageTitle"),
      `
  <h2>${escapeHtml(t(locale, "meaningDelta.heading"))}</h2>
  <div class="card">
    <label for="intended">${escapeHtml(t(locale, "meaningDelta.intendedLabel"))}</label>
    <textarea id="intended" placeholder="${escapeHtml(t(locale, "meaningDelta.intendedPlaceholder"))}">${escapeHtml(f.intended ?? "")}</textarea>
    <label for="preserved">${escapeHtml(t(locale, "meaningDelta.preservedLabel"))}</label>
    <input id="preserved" value="${escapeHtml(f.preservedCsv ?? "")}" placeholder="${escapeHtml(t(locale, "meaningDelta.preservedPlaceholder"))}" />
    <label for="lost">${escapeHtml(t(locale, "meaningDelta.lostLabel"))}</label>
    <input id="lost" value="${escapeHtml(f.lost ?? "")}" />
    <label for="transformed">${escapeHtml(t(locale, "meaningDelta.transformedLabel"))}</label>
    <input id="transformed" value="${escapeHtml(f.transformed ?? "")}" />
    <label for="unresolved">${escapeHtml(t(locale, "meaningDelta.unresolvedLabel"))}</label>
    <input id="unresolved" value="${escapeHtml(f.unresolved ?? "")}" />
    <label for="drift">${escapeHtml(t(locale, "meaningDelta.driftLabel"))}</label>
    <input id="drift" value="${escapeHtml(f.drift ?? "")}" />
    <p class="note">${escapeHtml(anchor)}</p>
    <button onclick="register()">${escapeHtml(t(locale, "meaningDelta.register"))}</button>
    ${lastDeltaBlock}
    ${statusBlock}
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
  </script>`,
      locale === "ja" ? "ja" : "en"
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
    const locale = getPanelLocale();
    const config = getConfig();
    const ws = requireWorkspaceIssue();
    const preflight = validateRegisterPreconditions({
      databaseUrl: config.databaseUrl,
      file: msg.file,
      workspaceReady: ws === null,
    });
    if (preflight) {
      this.render(webview, translateIssue(locale, preflight), true);
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
      const okMsg = t(locale, "meaningDelta.registered", { id });
      this.render(webview, okMsg);
      vscode.window.showInformationMessage(
        t(locale, "notify.meaningDeltaRegistered", { id })
      );
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      this.render(webview, translateIssue(locale, text), true);
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
