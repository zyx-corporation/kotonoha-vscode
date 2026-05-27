/** Panel / webview copy — add locales here (en + ja). */

export type Locale = "en" | "ja";

export const messages = {
  en: {
    "context.pageTitle": "Kotonoha Context",
    "context.heading": "Current context",
    "context.activeFile": "active file",
    "context.selection": "selection",
    "context.status.repository": "repository",
    "context.status.branch": "branch",
    "context.status.commit": "commit",
    "context.status.workingTree": "working tree",
    "context.status.database": "database",
    "context.status.meaningDeltas": "meaning_deltas",
    "context.status.projectId": "project_id",
    "context.status.kotonohaInit": "kotonoha init",
    "context.refresh": "Refresh",
    "context.gitDiffNote":
      "Git diff: use VS Code Source Control or kotonoha diff.",
    "context.statusExit": "status exited {code}",

    "meaningDelta.pageTitle": "Meaning Delta",
    "meaningDelta.heading": "Meaning delta (ΔM)",
    "meaningDelta.intendedLabel": "Intended change (SHOULD)",
    "meaningDelta.intendedPlaceholder": "What meaning change do you intend?",
    "meaningDelta.preservedLabel": "Preserved (comma-separated, optional)",
    "meaningDelta.preservedPlaceholder": "intent, scope",
    "meaningDelta.lostLabel": "Lost (optional)",
    "meaningDelta.transformedLabel": "Transformed (optional)",
    "meaningDelta.unresolvedLabel": "Unresolved (optional)",
    "meaningDelta.driftLabel": "Drift (optional)",
    "meaningDelta.anchor":
      "Anchor: {file} · lines {lineStart}–{lineEnd}",
    "meaningDelta.register": "Register ΔM",
    "meaningDelta.lastDelta": "Last ΔM: {id}",
    "meaningDelta.registered": "Registered meaning delta: {id}",

    "rde.pageTitle": "RDE & Review",
    "rde.headingAssessment": "RDE assessment",
    "rde.headingReview": "Review",
    "rde.headingExportPreview": "Export preview",
    "rde.deltaLabel": "ΔM: {id}",
    "rde.deltaNone": "— (register ΔM first)",
    "rde.attachFile": "Attach RDE (pick JSON file)",
    "rde.pasteClipboard": "Paste RDE from clipboard",
    "rde.refreshExport": "Refresh export preview",
    "rde.lastAssessment": "Last assessment: {id}",
    "rde.validationWarnings":
      "Strict / validation: {warnings}",
    "rde.humanReviewRequiredPanel":
      "Human review required — no ReviewDecision yet.",
    "rde.humanJudgmentBanner":
      "RDE does not substitute for human judgment.",
    "rde.approve": "Approve",
    "rde.hold": "Hold",
    "rde.reject": "Reject",
    "rde.copyExport": "Copy export (m2)",
    "rde.attached": "Attached RDE: {id}",
    "rde.reviewRecorded": "Review recorded: {id}",
    "rde.clipboardEmpty": "Clipboard is empty.",
    "rde.invalidJson":
      "Attach input is not valid JSON. Run `kotonoha rde emit` and paste that output (not note.md or other text).",

    "export.previewSummary": "Summary: {text}",
    "export.previewHumanReview":
      "⚠ Human review required (no ReviewDecision recorded).",
    "export.previewValidationWarnings":
      "Validation warnings ({count}): {warnings}",
    "export.previewLatestRde":
      "Latest RDE: {id} · source_kind={kind}",

    "preflight.workspaceRequired":
      "Open a folder workspace (Git repository) before using Kotonoha.",
    "preflight.databaseUrlRegister":
      "Set kotonoha.databaseUrl (or DATABASE_URL) before registering.",
    "preflight.databaseUrlAttach":
      "Set kotonoha.databaseUrl (or DATABASE_URL) before attaching RDE.",
    "preflight.databaseUrlReview":
      "Set kotonoha.databaseUrl (or DATABASE_URL) before recording review.",
    "preflight.fileRequired":
      "Open a file inside the workspace folder (not an out-of-workspace path).",
    "preflight.deltaRequired": "Register a MeaningDelta first.",
    "preflight.unknownDecision": "Unknown review decision.",

    "notify.meaningDeltaRegistered": "Kotonoha: MeaningDelta {id}",
    "notify.openRdePanelFirst":
      "Kotonoha: open the RDE & Review panel first.",
    "notify.registerDeltaFirst": "Kotonoha: register a MeaningDelta first.",
    "notify.exportCopied": "Kotonoha: m2 export copied to clipboard.",

    "error.noWorkspaceForObs":
      "No workspace folder for observation temp file.",
    "error.rbacNeedAgentRunner":
      "RBAC: switch DB role to agent_runner before Register ΔM / RDE attach (see m3_acceptance_ja.md).",
    "error.rbacNeedReviewer":
      "RBAC: switch DB role to reviewer before Approve (see m3_acceptance_ja.md). CLI failed; ReviewDecision was not saved.",

  },
  ja: {
    "context.pageTitle": "Kotonoha コンテキスト",
    "context.heading": "現在のコンテキスト",
    "context.activeFile": "アクティブファイル",
    "context.selection": "選択範囲",
    "context.status.repository": "リポジトリ",
    "context.status.branch": "ブランチ",
    "context.status.commit": "コミット",
    "context.status.workingTree": "作業ツリー",
    "context.status.database": "データベース",
    "context.status.meaningDeltas": "meaning_deltas",
    "context.status.projectId": "project_id",
    "context.status.kotonohaInit": "kotonoha init",
    "context.refresh": "更新",
    "context.gitDiffNote":
      "Git diff: VS Code のソース管理、または kotonoha diff を使用してください。",
    "context.statusExit": "status が終了コード {code} で終了しました",

    "meaningDelta.pageTitle": "Meaning Delta",
    "meaningDelta.heading": "意味デルタ (ΔM)",
    "meaningDelta.intendedLabel": "意図した変更 (SHOULD)",
    "meaningDelta.intendedPlaceholder": "どのような意味の変化を意図しますか？",
    "meaningDelta.preservedLabel": "保持 (カンマ区切り・任意)",
    "meaningDelta.preservedPlaceholder": "intent, scope",
    "meaningDelta.lostLabel": "失われたもの (任意)",
    "meaningDelta.transformedLabel": "変換 (任意)",
    "meaningDelta.unresolvedLabel": "未解決 (任意)",
    "meaningDelta.driftLabel": "ドリフト (任意)",
    "meaningDelta.anchor":
      "アンカー: {file} · 行 {lineStart}–{lineEnd}",
    "meaningDelta.register": "ΔM を登録",
    "meaningDelta.lastDelta": "直近の ΔM: {id}",
    "meaningDelta.registered": "意味デルタを登録しました: {id}",

    "rde.pageTitle": "RDE とレビュー",
    "rde.headingAssessment": "RDE 評価",
    "rde.headingReview": "レビュー",
    "rde.headingExportPreview": "エクスポートプレビュー",
    "rde.deltaLabel": "ΔM: {id}",
    "rde.deltaNone": "— (先に ΔM を登録)",
    "rde.attachFile": "RDE を添付 (JSON ファイル)",
    "rde.pasteClipboard": "クリップボードから RDE を貼り付け",
    "rde.refreshExport": "エクスポートプレビューを更新",
    "rde.lastAssessment": "直近の評価: {id}",
    "rde.validationWarnings": "Strict / 検証: {warnings}",
    "rde.humanReviewRequiredPanel":
      "人によるレビューが必要です — ReviewDecision がありません。",
    "rde.humanJudgmentBanner":
      "RDE は人の判断に代わるものではありません。",
    "rde.approve": "承認",
    "rde.hold": "保留",
    "rde.reject": "却下",
    "rde.copyExport": "エクスポート (m2) をコピー",
    "rde.attached": "RDE を添付しました: {id}",
    "rde.reviewRecorded": "レビューを記録しました: {id}",
    "rde.clipboardEmpty": "クリップボードが空です。",
    "rde.invalidJson":
      "添付内容が有効な JSON ではありません。`kotonoha rde emit` の出力を貼り付けてください（note.md などの本文は不可）。",

    "export.previewSummary": "要約: {text}",
    "export.previewHumanReview":
      "⚠ 人によるレビューが必要です (ReviewDecision 未記録)。",
    "export.previewValidationWarnings":
      "検証警告 ({count} 件): {warnings}",
    "export.previewLatestRde":
      "直近の RDE: {id} · source_kind={kind}",

    "preflight.workspaceRequired":
      "Kotonoha を使う前に、フォルダワークスペース (Git リポジトリ) を開いてください。",
    "preflight.databaseUrlRegister":
      "登録前に kotonoha.databaseUrl (または DATABASE_URL) を設定してください。",
    "preflight.databaseUrlAttach":
      "RDE 添付前に kotonoha.databaseUrl (または DATABASE_URL) を設定してください。",
    "preflight.databaseUrlReview":
      "レビュー記録前に kotonoha.databaseUrl (または DATABASE_URL) を設定してください。",
    "preflight.fileRequired":
      "ワークスペース内のファイルを開いてください (ワークスペース外のパスは不可)。",
    "preflight.deltaRequired": "先に MeaningDelta を登録してください。",
    "preflight.unknownDecision": "不明なレビュー判定です。",

    "notify.meaningDeltaRegistered": "Kotonoha: MeaningDelta {id}",
    "notify.openRdePanelFirst":
      "Kotonoha: 先に RDE & Review パネルを開いてください。",
    "notify.registerDeltaFirst":
      "Kotonoha: 先に MeaningDelta を登録してください。",
    "notify.exportCopied":
      "Kotonoha: m2 エクスポートをクリップボードにコピーしました。",

    "error.noWorkspaceForObs":
      "観測用一時ファイルのワークスペースフォルダがありません。",
    "error.rbacNeedAgentRunner":
      "RBAC: Register ΔM / RDE attach の前に DB ロールを agent_runner に切り替えてください（m3_acceptance_ja.md 参照）。",
    "error.rbacNeedReviewer":
      "RBAC: Approve の前に DB ロールを reviewer に切り替えてください。失敗したため ReviewDecision は保存されていません。",
  },
} as const;

export type MessageKey = keyof (typeof messages)["en"];
