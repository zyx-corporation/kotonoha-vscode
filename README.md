# Kotonoha — VS Code Extension (M3 Minimal UI)

Semantic lineage workspace for **MeaningDelta**, **RDE assessments**, and **human review** in VS Code / Cursor.

**Spec:** [kotonoha-management `29_m3_minimal_ui_spec_draft.md`](https://github.com/zyx-corporation/kotonoha-management/blob/main/docs/29_m3_minimal_ui_spec_draft.md)  
**Wireframes:** [`docs/ui-wireframes.md`](docs/ui-wireframes.md) · PNG in [`docs/images/`](docs/images/)  
**Acceptance:** [`docs/m3_acceptance.md`](docs/m3_acceptance.md) (M3 gate §6)  
**Operations manual:** [kotonoha-docs `ja/manual/vscode_extension_operations.md`](https://github.com/zyx-corporation/kotonoha-docs/blob/main/ja/manual/vscode_extension_operations.md)

## Prerequisites

- VS Code **1.85+** (or Cursor)
- [`kotonoha` CLI](https://github.com/zyx-corporation/kotonoha-cli) **≥ 0.2.4** on `PATH`
- [`kotonoha-core`](https://github.com/zyx-corporation/kotonoha-core) **≥ 0.1.9** (via CLI)
- PostgreSQL + `DATABASE_URL` for register / attach / review

### CLI compatibility

| Extension | `kotonoha` CLI | `kotonoha-core` |
| --- | --- | --- |
| 0.1.x (M3) | ≥ 0.2.4 | ≥ 0.1.9 |

M2 features (`rde attach --source-kind`, `export --format m2`) require these minimums.

## Settings

| Key | Description |
| --- | --- |
| `kotonoha.cliPath` | CLI binary (default: `kotonoha`) |
| `kotonoha.projectPath` | Repo root (default: workspace folder) |
| `kotonoha.databaseUrl` | PostgreSQL URL (**do not commit**) |
| `kotonoha.decidedBy` | Default identity for review decisions |
| `kotonoha.principalId` | M7: principal UUID → `KOTONOHA_PRINCIPAL_ID` on CLI child processes |
| `kotonoha.projectId` | M7: project UUID → `KOTONOHA_PROJECT_ID` for scoped export / writes |

## Install (development)

```bash
git clone https://github.com/zyx-corporation/kotonoha-vscode.git
cd kotonoha-vscode
npm install
npm test
npm run compile
```

**F5** in this folder → Extension Development Host. Open your Git project, configure `kotonoha.databaseUrl`.

## Keyboard shortcuts (default)

| Action | macOS | Windows / Linux |
| --- | --- | --- |
| Show Kotonoha sidebar | `Cmd+Alt+K` | `Ctrl+Alt+K` |
| Context panel | `Cmd+Alt+Shift+C` | `Ctrl+Alt+Shift+C` |
| Meaning Delta panel | `Cmd+Alt+Shift+M` | `Ctrl+Alt+Shift+M` |
| RDE & Review panel | `Cmd+Alt+Shift+R` | `Ctrl+Alt+Shift+R` |
| Register ΔM (focus + command) | `Cmd+Alt+Shift+D` | `Ctrl+Alt+Shift+D` |

Each panel title bar has a **Kotonoha** icon button (opens the sidebar). Rebind via **Keyboard Shortcuts** (`kotonoha.*`).

## Panels

1. **Context** — repo / branch / commit / file / selection (`kotonoha status`)
2. **Meaning Delta** — register ΔM (`kotonoha delta create` + observation JSON)
3. **RDE & Review** — attach RDE (file or clipboard), review, m2 export preview

## Relation to M1 / M2 CLI demos

The extension calls the same commands as:

- [Phase 2 acceptance demo](https://github.com/zyx-corporation/kotonoha-cli/blob/main/scripts/phase2_acceptance_demo.sh) (M1 path)
- [M2 acceptance demo](https://github.com/zyx-corporation/kotonoha-cli/blob/main/scripts/m2_acceptance_demo.sh)

Optional preflight before F5 UI walkthrough:

```bash
export DATABASE_URL='postgres://…'
./scripts/m3_acceptance_cli_preflight.sh
```

See [`docs/m3_acceptance.md`](docs/m3_acceptance.md) for the full §6 checklist.

## Development

```bash
npm test            # Test First — see CONTRIBUTING.md
npm run compile
```

## Status

**M3 Minimal UI** — tracks [management#104](https://github.com/zyx-corporation/kotonoha-management/issues/104). Not published to Marketplace.

| Sub | Issue | Status |
| --- | --- | --- |
| M3-a | [#109](https://github.com/zyx-corporation/kotonoha-management/issues/109) | done |
| M3-b | [#110](https://github.com/zyx-corporation/kotonoha-management/issues/110) | done |
| M3-c | [#111](https://github.com/zyx-corporation/kotonoha-management/issues/111) | done |
| M3-d | [#112](https://github.com/zyx-corporation/kotonoha-management/issues/112) | acceptance doc |

## License

Apache-2.0
