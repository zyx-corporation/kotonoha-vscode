/**
 * M3 gate checklist — must stay 1:1 with
 * kotonoha-management `29_m3_minimal_ui_spec_draft.md` §6.
 */
export interface M3GateItem {
  readonly id: string;
  readonly criterion: string;
  readonly verify: string;
}

export const M3_GATE_CHECKLIST: readonly M3GateItem[] = [
  {
    id: "git-context",
    criterion:
      "VSCode 上で現在の Git 差分（ファイル／選択）を表示できる",
    verify:
      "Context パネル: branch/commit, active file, selection; Refresh で `kotonoha status`",
  },
  {
    id: "register-delta",
    criterion: "選択範囲または diff 単位で MeaningDelta を登録できる",
    verify:
      "Meaning Delta パネル: Register ΔM → delta UUID 表示（`kotonoha delta create`）",
  },
  {
    id: "show-rde",
    criterion: "紐づく RDEAssessment を読み取り表示できる",
    verify:
      "RDE & Review: attach 後 Export preview に assessment / validation_report",
  },
  {
    id: "record-review",
    criterion: "ReviewDecision を UI から記録できる",
    verify:
      "Approve / Hold / Reject → 成功メッセージ; 人間責任バナー表示",
  },
  {
    id: "cli-errors",
    criterion:
      "Kotonoha Core（CLI 経由）と通信でき、エラーがユーザーに伝わる",
    verify:
      "`databaseUrl` 未設定・検証失敗時にパネル/トーストで exit 意味付きメッセージ",
  },
  {
    id: "readme",
    criterion:
      "README にインストール・設定・M1 デモとの関係が書かれている",
    verify: "README.md: Prerequisites, Settings, Acceptance, CLI 互換表",
  },
] as const;

export const M3_GATE_FORMAT = "kotonoha.m3_gate.v0.1";
