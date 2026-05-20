import * as vscode from "vscode";
import { ContextPanelProvider } from "./panels/contextPanel";
import { MeaningDeltaPanelProvider } from "./panels/meaningDeltaPanel";
import { RdeReviewPanelProvider } from "./panels/rdeReviewPanel";
import { parseReviewDecision } from "./rdeReviewContract";

export function activate(context: vscode.ExtensionContext): void {
  const contextPanel = new ContextPanelProvider(context.extensionUri);
  const meaningDeltaPanel = new MeaningDeltaPanelProvider(context.extensionUri);
  const rdeReviewPanel = new RdeReviewPanelProvider();

  const refreshEditorContext = (): void => {
    contextPanel.refresh();
    meaningDeltaPanel.refresh();
  };

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
    vscode.commands.registerCommand("kotonoha.reviewApprove", () => {
      void runReviewCommand(rdeReviewPanel, "approve");
    }),
    vscode.commands.registerCommand("kotonoha.reviewHold", () => {
      void runReviewCommand(rdeReviewPanel, "hold");
    }),
    vscode.commands.registerCommand("kotonoha.reviewReject", () => {
      void runReviewCommand(rdeReviewPanel, "reject");
    }),
    vscode.window.onDidChangeActiveTextEditor(() => {
      refreshEditorContext();
    }),
    vscode.window.onDidChangeTextEditorSelection(() => {
      refreshEditorContext();
    })
  );
}

async function runReviewCommand(
  panel: RdeReviewPanelProvider,
  decision: string
): Promise<void> {
  if (!parseReviewDecision(decision)) {
    return;
  }
  await vscode.commands.executeCommand("kotonoha.rdeReview.focus");
  await panel.runReviewFromCommand(decision);
}

export function deactivate(): void {}
