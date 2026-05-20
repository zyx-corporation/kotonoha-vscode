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
| PostgreSQL | `DATABASE_URL` / `kotonoha.databaseUrl` |
| Git repo | workspace with at least one commit recommended |

Optional CLI preflight (same data path as UI):

```bash
export DATABASE_URL='postgres://…'
./scripts/m3_acceptance_cli_preflight.sh
```

---

## Setup (once per machine)

1. Clone / open a **Git** sample repository in VS Code.
2. Build or install `kotonoha` on `PATH` (`which kotonoha`).
3. Run `kotonoha db migrate` with `DATABASE_URL` set.
4. Open **`kotonoha-vscode`** folder → **F5** (Run Extension).
5. In the Extension Development Host, **File → Open Folder** on the sample repo (not the `kotonoha-vscode` extension folder alone).
6. **Settings** (workspace) → `kotonoha.databaseUrl` = your `DATABASE_URL` (do not commit).
7. Optional: `kotonoha.decidedBy` = reviewer identity.

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

When all six rows are checked:

1. Record date and `kotonoha --version` in a PR or #104 comment.
2. Close [management#112](https://github.com/zyx-corporation/kotonoha-management/issues/112).
3. Update [management#104](https://github.com/zyx-corporation/kotonoha-management/issues/104) checklist.

---

## Revision

| Date | Change |
| --- | --- |
| 2026-05-20 | Initial M3-d procedure |
