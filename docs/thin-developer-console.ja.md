# Kotonoha VSCode Thin Developer Console

**状態:** 現フェーズの製品方針（2026-05）。  
**目的:** Kotonoha VSCode は `kotonoha-cli` と `kotonoha-core` 上の **薄い Developer Console** である。**AI コーディングエージェントではない。**

English: [`thin-developer-console.md`](thin-developer-console.md)。

## 責務

- `KOTONOHA_PRINCIPAL_ID` / `KOTONOHA_PROJECT_ID` を CLI コマンドへ渡す。
- CLI からプロジェクト状態を表示する。
- context export / audit / validation コマンドを起動する。
- 開発コンテキストと Git diff 要約の取得を支援する。
- UI を最小限かつ監査可能に保つ。

## 非責務

- 自律的コード生成。
- カスタムエージェントループ。
- Cursor / Copilot / Claude Code / Codex の代替。
- 独自の canonical context モデル（正本は `kotonoha-spec`）。

## 受け入れ基準

- [ ] CLI バイナリパスを設定できる。
- [ ] principal / project 設定が CLI 環境変数に渡る。
- [ ] CLI status を表示できる。
- [ ] context export を起動できる。
- [ ] RDE / audit コマンドを起動、または明示的エラーで stub できる。
- [ ] エラーは明示的でコピー可能。

## 配置

```text
kotonoha-spec → kotonoha-core → kotonoha-cli → kotonoha-vscode（薄い UI）
                              ↘ obsidian-kotonoha-console（最初の usable UI）
```

参照: [`kotonoha-spec` `docs/current-official-architecture.md`](https://github.com/zyx-corporation/kotonoha-spec/blob/main/docs/current-official-architecture.md)。
