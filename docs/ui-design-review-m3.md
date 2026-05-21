# M3 UI design review record

**Normative checklist:** [kotonoha-management `32` §2.2](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/32_milestone_ui_quality_gates_draft.md)

**Wireframes:** [`ui-wireframes.md`](ui-wireframes.md)

**Parent:** [management#104](https://github.com/zyx-corporation/kotonoha-management/issues/104) · **Procedure:** [`m3_acceptance.md`](m3_acceptance.md)

| Field | Value |
| --- | --- |
| **Date** | 2026-05-21 |
| **Reviewer** | F5 walkthrough (local) |
| **Extension version** | 0.1.0 |
| **CLI** | kotonoha 0.2.5 |
| **Judgment** | **Pass with notes** |

## D1 — Information design

| Result | Notes |
| --- | --- |
| **Pass** | Activity Bar **Kotonoha** with three panels: **Context** (Git / DB status), **Meaning Delta** (ΔM registration), **RDE & Review** (attach + review + export preview). Roles are distinguishable by panel title and content. |

## D2 — Operation flow

| Result | Notes |
| --- | --- |
| **Pass** | Recommended E2E completes within three panels: Context (refresh) → Meaning Delta (register) → RDE & Review (paste RDE → refresh preview → approve). No fourth panel required. |

## D3 — Accountability boundary

| Result | Notes |
| --- | --- |
| **Pass** | Human-judgment banner on RDE & Review panel (`rde.humanJudgmentBanner` / en+ja). Export summary states RDE does not replace final judgment. |

## D4 — Error experience

| Result | Notes |
| --- | --- |
| **Pass with notes** | Empty `kotonoha.databaseUrl` shows preflight message in Meaning Delta panel (B5). CLI may still succeed if parent process sets `DATABASE_URL` (documented in acceptance notes). Invalid review without ΔM shows preflight error. |

## D5 — Wireframe alignment

| Result | Notes |
| --- | --- |
| **Pass with notes** | Intentional deltas: (1) Meaning Delta form labels partly English in `ja` locale; (2) RDE panel ΔM line not auto-refreshed after Register — use **Refresh export preview** or re-open panel (fix in progress locally); (3) `kotonoha init: not initialized` shown in Context — informational, not M3 gate. |

## Follow-up issues (if Pass with notes)

- RDE panel: sync `session.lastDeltaId` to webview on Register (local fix drafted).
- RDE panel: clear `humanReviewRequired` banner after Approve when export contains `review_decisions` (local fix drafted).
- `cliEnv`: document or tighten `DATABASE_URL` fallback when `kotonoha.databaseUrl` is empty (B5 / ops).
- Optional: `kotonoha init` stub or hide until M6.
