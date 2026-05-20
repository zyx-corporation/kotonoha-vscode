# Contributing — kotonoha-vscode

## Test First（Red → Green → Refactor）

[`kotonoha-management` 単体テスト指針 §6](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/24_unit_test_guidelines_ja.md) に従う。

1. **契約が変わる PR** では、まず `test/` に失敗するテストを書く（Negative／不変条件は特に先行）。
2. 実装で緑にし、リファクタはテストを維持したまま行う。
3. PR 本文に「**どの逸脱を防ぐテストか**」を一行書く。

## 実行

```bash
npm install
npm test          # compile + node --test
npm run lint      # tsc --noEmit
```

## スコープ

- **単体:** `src/` の純粋関数（`parseStatus`, `buildDeltaCreateArgs`, `escapeHtml`, `cliEnv`, …）
- **統合:** CLI 子プロセス・VS Code API は将来 `@vscode/test-electron` または手動 F5 で補う

## 関連

- M3 仕様: [`29_m3_minimal_ui_spec_draft.md`](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/29_m3_minimal_ui_spec_draft.md)
- CLI 終了コード: [`cli-definition.md`](https://github.com/zyx-corporation/kotonoha-cli/blob/main/docs/cli-definition.md)
