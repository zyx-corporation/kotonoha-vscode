# M3 受け入れ手順

**English:** [m3_acceptance.md](m3_acceptance.md)

**規範ゲート:** [kotonoha-management `29_m3_minimal_ui_spec_draft.md` §6](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/29_m3_minimal_ui_spec_draft.md)

**親トラック:** [management#104](https://github.com/zyx-corporation/kotonoha-management/issues/104)

自動単体テスト: `npm test`（CLI 契約パーサー。VS Code ホスト不要）。  
E2E スモーク: `npm run test:e2e`（拡張ホスト起動・preflight 契約）。  
**本書:** Extension Development Host（F5）での手動 E2E。

**T-RDE v1.0（意味監査）:** [`trde.config.json`](../trde.config.json) · L1 trace_map [`docs/trace_maps/m3-minimal-ui-l1.yaml`](trace_maps/m3-minimal-ui-l1.yaml) · 理論 [kotonoha-spec `T-RDE_v1.0.md`](https://github.com/zyx-corporation/kotonoha-spec/blob/main/docs/T-RDE_v1.0.md) · 実行プロンプト [kotonoha-spec `t_rde_実行プロンプト_v_1_論文準拠.md`](https://github.com/zyx-corporation/kotonoha-spec/blob/main/docs/t_rde_%E5%AE%9F%E8%A1%8C%E3%83%97%E3%83%AD%E3%83%B3%E3%83%97%E3%83%88_v_1_%E8%AB%96%E6%96%87%E6%BA%96%E6%8B%A0.md)

---

## テスト計画（M3）

M3 は **自動テスト + 手動ゲート** の二層で判定する。実行順は次のとおり。

1. `npm test`（契約・パーサ・preflight）
2. `npm run test:e2e`（拡張ホストのスモーク）
3. 本書の 9 ゲート手動確認（F5）

| レイヤー | コマンド / 手順 | 目的 | 合格条件 |
| --- | --- | --- | --- |
| Unit/Contract | `npm test` | CLI 契約、メッセージ、preflight の退行防止 | 全テスト green |
| E2E Smoke | `npm run test:e2e` | 拡張起動・コマンド登録・最低限 preflight の保証 | ジョブ成功（exit 0） |
| Manual Gate | 本書チェックリスト（9項目） | UI 経路・RBAC・i18n・設計レビューの最終受け入れ | 9 行すべて [✓] |
| T-RDE L2（任意） | [実行プロンプト §9/§10](https://github.com/zyx-corporation/kotonoha-spec/blob/main/docs/t_rde_%E5%AE%9F%E8%A1%8C%E3%83%97%E3%83%AD%E3%83%B3%E3%83%97%E3%83%88_v_1_%E8%AB%96%E6%96%87%E6%BA%96%E6%8B%A0.md) + M3 差分 | 意味監査（intent / implicit / ΔU）の記録 | `semantic_map` または trace_map 更新・人間判断箇所の明示 |

**T-RDE 対応:** `trace_map` / `trde.config.json` は正本（`T-RDE_v1.0.md` + 実行プロンプト）を参照し、手動ゲート結果で更新する。

---

## 前提条件


| 項目                                                                                                                   | バージョン / 備考                         |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| VS Code または Cursor                                                                                                   | 1.85 以降                            |
| [`kotonoha` CLI](https://github.com/zyx-corporation/kotonoha-cli) | **≥ 0.2.4** |
| [`kotonoha-core`](https://github.com/zyx-corporation/kotonoha-core) | **≥ 0.1.9**（CLI バイナリ経由） |
| PostgreSQL                                                                                                           | サーバー起動済み。**migrate 前に DB とロールを作成** |
| Git リポジトリ                                                                                                            | ワークスペースに 1 コミット以上あることを推奨           |


### データベース準備（`db migrate` の前）

`kotonoha db migrate` は**既存データベース内**に DDL を適用する（`kotonoha-core/migrations/`）。PostgreSQL クラスタ・ロール・空 DB の作成は行わない。

**手順:**

1. PostgreSQL を起動（Docker、Homebrew、マネージドサービスなど）。
2. ロールとデータベースを作成（環境ごとに 1 回）。
3. `DATABASE_URL` / `kotonoha.databaseUrl` をその DB に設定。
4. `kotonoha db migrate` を実行。
5. 拡張機能または CLI で delta / attach / review を利用。

**Docker（初回起動で DB 作成）:**

```bash
docker run -d --name kotonoha-pg \
  -e POSTGRES_USER=kotonoha \
  -e POSTGRES_PASSWORD=kotonoha \
  -e POSTGRES_DB=kotonoha_test \
  -p 5432:5432 \
  postgres:16-alpine

export DATABASE_URL='postgres://kotonoha:kotonoha@localhost:5432/kotonoha_test'
```

**既存 Postgres サーバー（手動で DB 作成）:**

```bash
# スーパーユーザーで実行（例: psql -U postgres）
CREATE USER kotonoha WITH PASSWORD 'kotonoha';
CREATE DATABASE kotonoha_test OWNER kotonoha;

export DATABASE_URL='postgres://kotonoha:kotonoha@localhost:5432/kotonoha_test'
```

続けて migrate:

```bash
kotonoha db migrate   # またはリリースバイナリのフルパス
```

任意: CLI 事前確認（UI と同じデータ経路）:

```bash
export DATABASE_URL='postgres://…'
./scripts/m3_acceptance_cli_preflight.sh
```

---

## セットアップ（マシンごとに 1 回）

1. VS Code で **Git** のサンプルリポジトリをクローン / 開く。
2. `kotonoha` をビルドまたはインストール。release 例:
  ```bash
   cd kotonoha-cli && cargo build --release
   which kotonoha   # …/kotonoha-cli/target/release/kotonoha
  ```
   VS Code 設定（ワークスペース）: `kotonoha.cliPath` に上記フルパス。雛形は `[.vscode/settings.json.example](../.vscode/settings.json.example)` を `.vscode/settings.json` にコピー。
3. **PostgreSQL を準備**（上記）: サーバー起動 → DB 存在 → `DATABASE_URL` 設定。
4. `kotonoha db migrate` を実行。
5. `**kotonoha-vscode`** フォルダを開く → **F5**（拡張機能の実行）。ショートカット: `Cmd+Alt+K`（サイドバー）、`Cmd+Alt+Shift+M`（Meaning Delta）— README 参照。
6. Extension Development Host で **ファイル → フォルダーを開く** によりサンプル repo を開く（`kotonoha-vscode` 拡張フォルダだけではない）。
7. **設定**（ワークスペース）→ `kotonoha.databaseUrl` = 上記と同じ `DATABASE_URL`（コミットしない）。
8. 任意: `kotonoha.decidedBy` = レビュアー識別子。

---

## ゲートチェックリスト（§6 — 1:1）

**Extension Development Host** で確認したら各項目にチェックを入れる。


| ID               | §6 基準                                   | 確認方法                                                                                                                                                                                                                                                                                             | 合格  |
| ---------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| `git-context`    | VSCode 上で現在の Git 差分（ファイル／選択）を表示できる      | アクティビティバー **Kotonoha** → **Context**。ファイルを開き行を選択。**Refresh**。ブランチ、コミット、アクティブファイル、選択範囲を確認。                                                                                                                                                                                                        | [✓] |
| `register-delta` | 選択範囲または diff 単位で MeaningDelta を登録できる    | **Meaning Delta** → *Intended change* を入力（任意）→ **Register ΔM**。パネルとトーストに UUID。                                                                                                                                                                                                                   | [✓] |
| `show-rde`       | 紐づく RDEAssessment を読み取り表示できる            | **RDE & Review** → RDE を attach（ファイルまたはクリップボード; `kotonoha rde emit` の JSON）。**Refresh export preview**。assessment id、`validation_report` の警告があれば表示。                                                                                                                                              | [✓] |
| `record-review`  | ReviewDecision を UI から記録できる             | **Approve**（または Hold / Reject）。成功メッセージ。バナー: *RDE does not substitute for human judgment.*                                                                                                                                                                                                        | [ ] |
| `cli-errors`     | Kotonoha Core（CLI 経由）と通信でき、エラーがユーザーに伝わる | 下記 **cli-errors 手順** の ①② を実施。                                                                                                                                                                                               | [ ] |
| `readme`         | README にインストール・設定・M1 デモとの関係が書かれている      | [README.md](../README.md) を確認: インストール、設定、受け入れリンク、CLI 互換表。                                                                                                                                                                                                                                        | [ ] |
| `i18n-ja`        | UI 多言語化（日本語）                            | VS Code 表示言語を **日本語** に設定。`git-context` → `register-delta` → `show-rde` → `record-review` を日本語 UI で繰り返す。欠落キーのプレースホルダーがないこと。                                                                                                                                                                      | [ ] |
| `i18n-en`        | UI 多言語化（英語）                             | 表示言語を **English** に設定。同じ 4 操作を英語 UI で繰り返す。                                                                                                                                                                                                                                                       | [ ] |
| `design-review`  | UI デザイン評価                               | [management `32` §2.2](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/32_milestone_ui_quality_gates_draft.md) に従い D1〜D5 を実施。`docs/ui-design-review-m3.md` または [#104](https://github.com/zyx-corporation/kotonoha-management/issues/104) に記録。判定: Pass または Pass with notes。 | [ ] |


プログラム上のミラー（ドリフト防止）: `src/m3AcceptanceChecklist.ts` + `npm test`。

---

## 推奨 E2E フロー（1 セッション）

```text
Context（refresh）
  → Meaning Delta（登録、UUID をメモ）
  → RDE & Review（emit JSON を貼り付け → attach）
  → Refresh export preview
  → Approve
  → Copy export（m2）→ エディタに貼り付け; format が kotonoha.m2_export.v0.1 であることを確認
```

**RDE JSON の取得:**

```bash
kotonoha rde emit > /tmp/rde.json
# または: pbcopy <(kotonoha rde emit)
```

`show-rde` で `invalid JSON: expected value at line 1` が出る場合、**note.md や空のクリップボードを attach している**ことが多いです。必ず `kotonoha rde emit` の JSON（`{ "rde_review_output": … }` で始まる）を **Paste RDE from clipboard** または `/tmp/rde.json` をファイル選択してください。

**RBAC（`lacks role 'agent_runner'` / exit 2）:** M6 では 1 principal に 1 ロールのみ。ΔM 登録・RDE attach には `**agent_runner`**、Approve には `**reviewer**` が必要です。Approve 後に再度 attach する場合はロールを戻してください。

```bash
# attach / Register ΔM の前
docker exec kotonoha-pg psql "$DATABASE_URL" -c \
  "UPDATE project_members SET role = 'agent_runner' WHERE principal_id = '00000000-0000-4000-8000-000000000001'::uuid;"

# Approve の前
docker exec kotonoha-pg psql "$DATABASE_URL" -c \
  "UPDATE project_members SET role = 'reviewer' WHERE principal_id = '00000000-0000-4000-8000-000000000001'::uuid;"
```

**「Human review required」が消えない:** 多くは **Approve が DB に保存されていない**状態です（`agent_runner` のまま Approve した等）。パネル下部のエラーを確認し、上記で `reviewer` に切り替えてから **Approve** → **Refresh export preview**。Export の Summary に `latest decision` と出れば成功です。

### cli-errors 手順（ゲート専用）

**① databaseUrl 未設定 → Register ΔM**

1. **設定** → `kotonoha.databaseUrl` → **ワークスペース** タブで値を**完全削除**（`.vscode/settings.json` の当該キーを削除しても可）。
2. **Meaning Delta** → **Register ΔM**。
3. **期待:** パネル内赤文字（例: `登録前に kotonoha.databaseUrl …`）。**UUID トーストは出ない**。
4. URL を元に戻す。

**補足（B5）:** 親プロセスに `DATABASE_URL` があっても、UI は設定 `kotonoha.databaseUrl` が空なら CLI を呼ばない。ターミナルからの CLI 単体実行は別経路（[`README.md`](../README.md) Settings 参照）。

**② ΔM なしで Review → エラー**

1. **デバッグ停止**（Extension Development Host を閉じる）→ **F5** で再起動（`session.lastDeltaId` をクリア）。
2. サンプル repo を開き、`kotonoha.databaseUrl` を設定。
3. **Meaning Delta で Register しない**。
4. **RDE & Review** → **Approve**（または Hold / Reject）。
5. **期待:** `先に MeaningDelta を登録してください。`（`Review recorded` トーストは出ない）。

同一 EDH セッションで既に ΔM を登録済みの場合、②は**失敗せず成功する**（正常）。必ず再起動してから試す。

---

## M1 / M2 CLI デモとの関係


| マイルストーン | デモスクリプト                                                                                                                    | M3 が追加するもの                                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| M1      | `[phase2_acceptance_demo.sh](https://github.com/zyx-corporation/kotonoha-cli/blob/main/scripts/phase2_acceptance_demo.sh)` | 同一 CLI。ターミナルのみではなく IDE パネル                  |
| M2      | `[m2_acceptance_demo.sh](https://github.com/zyx-corporation/kotonoha-cli/blob/main/scripts/m2_acceptance_demo.sh)`         | m2 export プレビュー + UI 上の `validation_report` |


M3 は CLI 受け入れを**置き換えない**。同一コマンド上の**人間向け UI 経路**を追加する。

---

## サインオフ

**9 行すべて**にチェックが付いたら:

1. PR または #104 コメントに日付と `kotonoha --version` を記録。
2. [management#112](https://github.com/zyx-corporation/kotonoha-management/issues/112) をクローズ。
3. [management#104](https://github.com/zyx-corporation/kotonoha-management/issues/104) のチェックリストを更新。

---

## 改訂履歴


| 日付         | 変更                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-20 | M3-d 手順の初版（英語）                                                                                                                                                   |
| 2026-05-20 | ゲート行 `i18n-ja`, `i18n-en`, `design-review`（`[32](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/32_milestone_ui_quality_gates_draft.md)`） |
| 2026-05-26 | 日本語版 `m3_acceptance_ja.md` 追加。英文版と相互リンク                                                                                                                          |
| 2026-05-20 | T-RDE L1 trace_map / cli-errors 手順 / B5 注記（[#13](https://github.com/zyx-corporation/kotonoha-vscode/issues/13)–[#19](https://github.com/zyx-corporation/kotonoha-vscode/issues/19)） |
| 2026-05-27 | ガイド正本 [kotonoha-spec `T-RDE_v1.0.md`](https://github.com/zyx-corporation/kotonoha-spec/blob/main/docs/T-RDE_v1.0.md) に準拠 |
| 2026-05-27 | テスト計画（Unit/Smoke/Manual の三層）を明文化 |
| 2026-05-27 | 実行プロンプト正本 `t_rde_実行プロンプト_v_1_論文準拠.md` をテスト計画 L2 に接続 |


