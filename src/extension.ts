import * as vscode from "vscode";
import { ContextPanelProvider } from "./panels/contextPanel";
import { MeaningDeltaPanelProvider } from "./panels/meaningDeltaPanel";
import { RdeReviewPanelProvider } from "./panels/rdeReviewPanel";
import { parseReviewDecision } from "./rdeReviewContract";

async function openKotonohaActivity(): Promise<void> {
  await vscode.commands.executeCommand("workbench.view.extension.kotonoha");
}

async function focusKotonohaView(viewId: string): Promise<void> {
  await openKotonohaActivity();
  await vscode.commands.executeCommand(`${viewId}.focus`);
}

export function activate(context: vscode.ExtensionContext): void {
  const contextPanel = new ContextPanelProvider(context.extensionUri);
  const rdeReviewPanel = new RdeReviewPanelProvider();
  const meaningDeltaPanel = new MeaningDeltaPanelProvider(
    context.extensionUri,
    () => rdeReviewPanel.refresh()
  );

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
    vscode.commands.registerCommand("kotonoha.openActivity", () => {
      void openKotonohaActivity();
    }),
    vscode.commands.registerCommand("kotonoha.focusContext", () => {
      void focusKotonohaView(ContextPanelProvider.viewType);
    }),
    vscode.commands.registerCommand("kotonoha.focusMeaningDelta", () => {
      void focusKotonohaView(MeaningDeltaPanelProvider.viewType);
    }),
    vscode.commands.registerCommand("kotonoha.focusRdeReview", () => {
      void focusKotonohaView(RdeReviewPanelProvider.viewType);
    }),
    vscode.commands.registerCommand("kotonoha.refreshContext", () => {
      contextPanel.refresh();
    }),
    vscode.commands.registerCommand("kotonoha.registerMeaningDelta", () => {
      void focusKotonohaView(MeaningDeltaPanelProvider.viewType);
    }),
    vscode.commands.registerCommand("kotonoha.attachRde", () => {
      void focusKotonohaView(RdeReviewPanelProvider.viewType);
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
  await focusKotonohaView(RdeReviewPanelProvider.viewType);
  await panel.runReviewFromCommand(decision);
}

export function deactivate(): void {}
