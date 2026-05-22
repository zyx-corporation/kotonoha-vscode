# M7 UI design review — VS Code (principal / project settings)

**Normative checklist:** [kotonoha-management `32` §2.2](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/32_milestone_ui_quality_gates_draft.md)

**Scope:** **M7-c** only — `kotonoha.principalId` / `kotonoha.projectId` → CLI env (no new panels).

**Parent:** [management#139](https://github.com/zyx-corporation/kotonoha-management/issues/139) · **M7-c:** [#144](https://github.com/zyx-corporation/kotonoha-management/issues/144)

| Field | Value |
| --- | --- |
| **Date** | 2026-05-22 |
| **Reviewer** | M7-c PR walkthrough |
| **Extension version** | 0.1.0 + M7-c |
| **Judgment** | **Pass with notes** |

## D1 — Information design

| Result | Notes |
| --- | --- |
| **Pass with notes** | M7-c adds **Settings** keys only; M3 panels unchanged. Principal/project scope documented in README, not a dedicated panel (by design per [`37`](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/37_m7_team_mode_ui_spec_draft.md)). |

## D2 — Operation flow

| Result | Notes |
| --- | --- |
| **Pass** | M3 E2E unchanged; M7-c is configuration-only. CLI child processes inherit env automatically. |

## D3 — Accountability boundary

| Result | Notes |
| --- | --- |
| **Pass** | M3 human-judgment banners unchanged. `principalId` ties actions to M6 RBAC actor. |

## D4 — Error experience

| Result | Notes |
| --- | --- |
| **Pass** | Invalid UUID in settings is ignored (same as unset). CLI RBAC errors still surface via existing panel error paths. |

## D5 — Wireframe alignment

| Result | Notes |
| --- | --- |
| **Pass with notes** | Settings descriptions are **English-only** in `package.json` (VS Code convention); user-facing panel strings remain i18n via M3 `messages.ts`. |

## Follow-up

- Optional: localized setting descriptions via `package.nls.json` (not M7 gate).
