# Kotonoha — VS Code Extension (M3 Minimal UI)

Semantic lineage workspace for **MeaningDelta**, **RDE assessments**, and **human review** in VS Code / Cursor.

**Spec:** [kotonoha-management `29_m3_minimal_ui_spec_draft.md`](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/29_m3_minimal_ui_spec_draft.md)  
**Wireframes:** [`docs/ui-wireframes.md`](docs/ui-wireframes.md) · PNG in [`docs/images/`](docs/images/)

## Prerequisites

- VS Code **1.85+** (or Cursor)
- [`kotonoha` CLI](https://github.com/zyx-corporation/kotonoha-cli) **≥ 0.2.4** on `PATH`
- [`kotonoha-core`](https://github.com/zyx-corporation/kotonoha-core) **≥ 0.1.9** (via CLI)
- PostgreSQL + `DATABASE_URL` for register / attach / review

## Settings

| Key | Description |
| --- | --- |
| `kotonoha.cliPath` | CLI binary (default: `kotonoha`) |
| `kotonoha.projectPath` | Repo root (default: workspace folder) |
| `kotonoha.databaseUrl` | PostgreSQL URL (**do not commit**) |
| `kotonoha.decidedBy` | Default reviewer identity |

## Development

```bash
npm install
npm run compile
# F5 → "Run Extension" (see .vscode/launch.json)
```

Open a Git workspace, set `kotonoha.databaseUrl`, run `Kotonoha: Refresh Context` from the sidebar.

## Panels (M3 scaffold)

1. **Context** — repo / branch / commit / file / selection (`kotonoha status`)
2. **Meaning Delta** — register ΔM (`kotonoha delta create`)
3. **RDE & Review** — attach RDE, approve/hold/reject, copy m2 export

## Status

**M3-a scaffold** — tracks [management#109](https://github.com/zyx-corporation/kotonoha-management/issues/109). Not published to Marketplace.

## License

Apache-2.0
