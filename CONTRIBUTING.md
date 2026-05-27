# Contributing — kotonoha-vscode

## Test First（Red → Green → Refactor）

[`kotonoha-management` 単体テスト指針 §6](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/24_unit_test_guidelines_ja.md) に従う。

1. **契約が変わる PR** では、まず `test/` に失敗するテストを書く（Negative／不変条件は特に先行）。
2. 実装で緑にし、リファクタはテストを維持したまま行う。
3. PR 本文に「**どの逸脱を防ぐテストか**」を一行書く。

## 実行

```bash
npm install
npm test          # compile + node --test (contracts, preflight)
npm run test:e2e  # @vscode/test-electron smoke (Linux CI: xvfb)
npm run lint      # tsc --noEmit
```

## スコープ

- **単体:** `src/` の純粋関数（`parseStatus`, `buildDeltaCreateArgs`, `escapeHtml`, `cliEnv`, preflight, …）
- **E2E スモーク:** `test/e2e/` — 拡張のロード・コマンド登録・`databaseUrl` 空の preflight（[#19](https://github.com/zyx-corporation/kotonoha-vscode/issues/19)）
- **手動:** フル M3 ゲート（Webview・DB・RBAC）は F5 + [`docs/m3_acceptance_ja.md`](docs/m3_acceptance_ja.md)

## T-RDE v1.0

- プロジェクトメタ: [`trde.config.json`](trde.config.json)
- L1 trace map: [`docs/trace_maps/m3-minimal-ui-l1.yaml`](docs/trace_maps/m3-minimal-ui-l1.yaml)
- ガイド（正式版）: [`docs/t_rde_v_1.md`](docs/t_rde_v_1.md)

## 関連

- M3 仕様: [`29_m3_minimal_ui_spec_draft.md`](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/29_m3_minimal_ui_spec_draft.md)
- CLI 終了コード: [`cli-definition.md`](https://github.com/zyx-corporation/kotonoha-cli/blob/main/docs/cli-definition.md)
