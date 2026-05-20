# M3 acceptance procedure

**Normative gate:** [kotonoha-management `29_m3_minimal_ui_spec_draft.md` §6](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/29_m3_minimal_ui_spec_draft.md)

**Parent track:** [management#104](https://github.com/zyx-corporation/kotonoha-management/issues/104)

Automated unit tests: `npm test` (CLI contract parsers; no VS Code host required).  
**This document:** manual E2E in Extension Development Host (F5).

---

## Prerequisites

| Item | Version / note |
| --- | --- |
| VS Code or Cursor | 1.85+ |
| [`kotonoha` CLI](https://github.com/zyx-corporation/kotonoha-cli) | **≥ 0.2.4** |
| [`kotonoha-core`](https://github.com/zyx-corporation/kotonoha-core) | **≥ 0.1.9** (via CLI binary) |
| PostgreSQL | Server running; **database + role must exist before migrate** |
| Git repo | workspace with at least one commit recommended |

### Database bootstrap (before `db migrate`)

`kotonoha db migrate` applies DDL **inside** an existing database (from `kotonoha-core/migrations/`). It does **not** create the PostgreSQL cluster, role, or empty database.

**Order:**

1. Start PostgreSQL (Docker, Homebrew, managed service, …).
2. Create role and database (once per environment).
3. Set `DATABASE_URL` / `kotonoha.databaseUrl` to that database.
4. Run `kotonoha db migrate`.
5. Use Extension or CLI (delta / attach / review).

**Docker (all-in-one — DB created on first start):**

```bash
docker run -d --name kotonoha-pg \
  -e POSTGRES_USER=kotonoha \
  -e POSTGRES_PASSWORD=kotonoha \
  -e POSTGRES_DB=kotonoha_test \
  -p 5432:5432 \
  postgres:16-alpine

export DATABASE_URL='postgres://kotonoha:kotonoha@localhost:5432/kotonoha_test'
```

**Existing Postgres server (create DB manually):**

```bash
# as superuser, e.g. psql -U postgres
CREATE USER kotonoha WITH PASSWORD 'kotonoha';
CREATE DATABASE kotonoha_test OWNER kotonoha;

export DATABASE_URL='postgres://kotonoha:kotonoha@localhost:5432/kotonoha_test'
```

Then migrate:

```bash
kotonoha db migrate   # or full path to release binary
```

Optional CLI preflight (same data path as UI):

```bash
export DATABASE_URL='postgres://…'
./scripts/m3_acceptance_cli_preflight.sh
```

---

## Setup (once per machine)

1. Clone / open a **Git** sample repository in VS Code.
2. Build or install `kotonoha` (set `kotonoha.cliPath` if not on `PATH`).
3. **Bootstrap PostgreSQL** (see above): server up → database exists → `DATABASE_URL` set.
4. Run `kotonoha db migrate`.
5. Open **`kotonoha-vscode`** folder → **F5** (Run Extension). Shortcuts: `Cmd+Alt+K` (sidebar), `Cmd+Alt+Shift+M` (Meaning Delta) — see README.
6. In the Extension Development Host, **File → Open Folder** on the sample repo (not the `kotonoha-vscode` extension folder alone).
7. **Settings** (workspace) → `kotonoha.databaseUrl` = same `DATABASE_URL` (do not commit).
8. Optional: `kotonoha.decidedBy` = reviewer identity.

---

## Gate checklist (§6 — 1:1)

Mark each item when verified in the **Extension Development Host**.

| ID | §6 criterion | How to verify | Pass |
| --- | --- | --- | --- |
| `git-context` | VSCode 上で現在の Git 差分（ファイル／選択）を表示できる | Activity Bar **Kotonoha** → **Context**. Open a file, select lines. **Refresh**. See branch, commit, active file, selection. | [ ] |
| `register-delta` | 選択範囲または diff 単位で MeaningDelta を登録できる | **Meaning Delta** → fill *Intended change* (optional) → **Register ΔM**. UUID in panel + toast. | [ ] |
| `show-rde` | 紐づく RDEAssessment を読み取り表示できる | **RDE & Review** → attach RDE (file or clipboard; `kotonoha rde emit` JSON). **Refresh export preview**. See assessment id, `validation_report` warnings if any. | [ ] |
| `record-review` | ReviewDecision を UI から記録できる | **Approve** (or Hold/Reject). Success message. Banner: *RDE does not substitute for human judgment.* | [ ] |
| `cli-errors` | Kotonoha Core（CLI 経由）と通信でき、エラーがユーザーに伝わる | Clear `kotonoha.databaseUrl` → Register ΔM → error text (env / exit 1). Restore URL. Invalid review without ΔM → error. | [ ] |
| `readme` | README にインストール・設定・M1 デモとの関係が書かれている | Skim [README.md](../README.md): install, settings, acceptance link, CLI compatibility. | [ ] |
| `i18n-ja` | UI 多言語化（日本語） | Set VS Code display language to **日本語**. Repeat `git-context` → `register-delta` → `show-rde` → `record-review` in Japanese UI. No missing-key placeholders. | [ ] |
| `i18n-en` | UI 多言語化（英語） | Set display language to **English**. Repeat the same four operations in English UI. | [ ] |
| `design-review` | UI デザイン評価 | Complete D1〜D5 per [management `32` §2.2](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/32_milestone_ui_quality_gates_draft.md). Record in `docs/ui-design-review-m3.md` or [#104](https://github.com/zyx-corporation/kotonoha-management/issues/104). Judgment: Pass or Pass with notes. | [ ] |

Programmatic mirror (drift guard): `src/m3AcceptanceChecklist.ts` + `npm test`.

---

## Suggested E2E flow (single session)

```text
Context (refresh)
  → Meaning Delta (register, note UUID)
  → RDE & Review (paste emit JSON → attach)
  → Refresh export preview
  → Approve
  → Copy export (m2) → paste into editor; confirm format kotonoha.m2_export.v0.1
```

**RDE JSON source:**

```bash
kotonoha rde emit > /tmp/rde.json
# or: pbcopy <(kotonoha rde emit)
```

---

## Relation to M1 / M2 CLI demos

| Milestone | Demo script | What M3 adds |
| --- | --- | --- |
| M1 | [`phase2_acceptance_demo.sh`](https://github.com/zyx-corporation/kotonoha-cli/blob/main/scripts/phase2_acceptance_demo.sh) | Same CLI; IDE panels instead of terminal-only |
| M2 | [`m2_acceptance_demo.sh`](https://github.com/zyx-corporation/kotonoha-cli/blob/main/scripts/m2_acceptance_demo.sh) | m2 export preview + `validation_report` in UI |

M3 does **not** replace CLI acceptance; it adds a **human UI path** over the same commands.

---

## Sign-off

When all **nine** rows are checked:

1. Record date and `kotonoha --version` in a PR or #104 comment.
2. Close [management#112](https://github.com/zyx-corporation/kotonoha-management/issues/112).
3. Update [management#104](https://github.com/zyx-corporation/kotonoha-management/issues/104) checklist.

---

## Revision

| Date | Change |
| --- | --- |
| 2026-05-20 | Initial M3-d procedure |
| 2026-05-20 | Gate rows `i18n-ja`, `i18n-en`, `design-review`（[`32`](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/32_milestone_ui_quality_gates_draft.md)） |
