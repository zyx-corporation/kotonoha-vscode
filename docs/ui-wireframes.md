# Kotonoha VS Code — UI wireframes (M3)

**Normative behaviour:** [`kotonoha-management` `29_m3_minimal_ui_spec_draft.md`](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/29_m3_minimal_ui_spec_draft.md)

**Visual reference:** [`images/m3-sidebar-wireframe.png`](images/m3-sidebar-wireframe.png)

## Layout

Three stacked **Webview Views** in the Kotonoha activity bar container.

See implementation: `src/panels/*.ts`

## Panel 1 — Context

| Field | Source |
| --- | --- |
| repository | `kotonoha status` |
| branch / commit | `kotonoha status` |
| active file / selection | VS Code editor |
| working tree / DB | `kotonoha status` |

## Panel 2 — Meaning Delta

- Intended change (textarea) — *persistence via `source_context` planned M3-b+*
- Observation fields → `observation` JSON
- **Register ΔM** → `kotonoha delta create`

## Panel 3 — RDE & Review

- Attach RDE JSON file → `kotonoha rde attach --source-kind cli`
- Approve / Hold / Reject → `kotonoha review *`
- Copy export → `kotonoha export --format m2`

**Human responsibility banner:** “RDE does not substitute for human judgment.”

## CLI exit codes (user-facing)

| Code | Meaning |
| --- | --- |
| 1 | Environment / usage |
| 2 | Validation |
| 3 | Database / I/O |
