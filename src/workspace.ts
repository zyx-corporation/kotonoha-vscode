import * as vscode from "vscode";
import type { MessageKey } from "./i18n/messages";
import { relativeRepoFile } from "./workspacePath";

export { relativeRepoFile } from "./workspacePath";

/** Git repo root for CLI `--path` / spawn cwd (multi-root aware). */
export function getProjectRoot(editor?: vscode.TextEditor): string {
  const cfg = vscode.workspace.getConfiguration("kotonoha");
  const explicit = cfg.get<string>("projectPath", "").trim();
  if (explicit) {
    return explicit;
  }
  if (editor) {
    const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
    if (folder) {
      return folder.uri.fsPath;
    }
  }
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";
}

/** Repo-relative path for the active editor file, or "" if unavailable. */
export function getEditorRelFile(editor?: vscode.TextEditor): string {
  if (!editor) {
    return "";
  }
  const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
  if (!folder) {
    return "";
  }
  return relativeRepoFile(folder.uri.fsPath, editor.document.uri.fsPath);
}

export function requireWorkspaceIssue(): MessageKey | null {
  if (!vscode.workspace.workspaceFolders?.length) {
    return "preflight.workspaceRequired";
  }
  return null;
}
