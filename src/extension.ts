import * as vscode from "vscode";
import { ContextPanelProvider } from "./panels/contextPanel";
import { MeaningDeltaPanelProvider } from "./panels/meaningDeltaPanel";
import { RdeReviewPanelProvider } from "./panels/rdeReviewPanel";

export function activate(context: vscode.ExtensionContext): void {
  const contextPanel = new ContextPanelProvider(context.extensionUri);
  const meaningDeltaPanel = new MeaningDeltaPanelProvider(context.extensionUri);
  const rdeReviewPanel = new RdeReviewPanelProvider();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ContextPanelProvider.viewType,
      contextPanel,
      { webviewOptions: { retainContextWhenHidden: true } }
    ),
    vscode.window.registerWebviewViewProvider(
      MeaningDeltaPanelProvider.viewType,
      meaningDeltaPanel,
      { webviewOptions: { retainContextWhenHidden: true } }
    ),
    vscode.window.registerWebviewViewProvider(
      RdeReviewPanelProvider.viewType,
      rdeReviewPanel,
      { webviewOptions: { retainContextWhenHidden: true } }
    ),
    vscode.commands.registerCommand("kotonoha.refreshContext", () => {
      contextPanel.refresh();
    }),
    vscode.commands.registerCommand("kotonoha.registerMeaningDelta", () => {
      void vscode.commands.executeCommand("kotonoha.meaningDelta.focus");
    }),
    vscode.commands.registerCommand("kotonoha.attachRde", () => {
      void vscode.commands.executeCommand("kotonoha.rdeReview.focus");
    }),
    vscode.commands.registerCommand("kotonoha.copyExport", () => {
      rdeReviewPanel.copyExport();
    }),
    vscode.window.onDidChangeActiveTextEditor(() => {
      contextPanel.refresh();
    })
  );
}

export function deactivate(): void {}
