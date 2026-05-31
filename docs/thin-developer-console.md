# Kotonoha VSCode Thin Developer Console

## Goal

Kotonoha VSCode should be a thin Developer Console over `kotonoha-cli` and `kotonoha-core`.

It should not become an autonomous AI coding agent.

Japanese companion: [`thin-developer-console.ja.md`](thin-developer-console.ja.md).

## Responsibilities

Kotonoha VSCode may:

- configure CLI binary path
- pass `KOTONOHA_PRINCIPAL_ID` and `KOTONOHA_PROJECT_ID` to CLI commands
- display CLI status
- invoke context export
- invoke RDE/audit/validation commands
- capture development context
- summarize Git diff information
- help prepare development handoff bundles
- expose explicit, copyable errors

## Non-responsibilities

Kotonoha VSCode must not:

- become an autonomous code generation agent
- replace Cursor, Copilot, Claude Code, Codex, or similar tools
- implement a custom agent loop
- maintain a separate canonical context model
- define sidecar formats outside `kotonoha-spec`
- silently modify project files without explicit user action

## Expected Settings

- `kotonoha.cliPath`
- `kotonoha.principalId`
- `kotonoha.projectId`
- `kotonoha.projectRoot`
- `kotonoha.enableGitDiffCapture`
- `kotonoha.auditMode`

## Expected Commands

- `Kotonoha: Show Status`
- `Kotonoha: Export Context`
- `Kotonoha: Capture Git Diff`
- `Kotonoha: Create Dev RDE Audit`
- `Kotonoha: Open Handoff Bundle`
- `Kotonoha: Validate Project Context`

## Acceptance Criteria

- [ ] CLI binary path can be configured.
- [ ] Principal/project settings are passed to CLI env.
- [ ] CLI status can be displayed.
- [ ] Context export can be invoked.
- [ ] RDE/audit command can be invoked or stubbed.
- [ ] Git diff capture is explicit.
- [ ] Errors are explicit and copyable.
- [ ] No autonomous code modification is performed.

## Architecture placement

```text
kotonoha-spec → kotonoha-core → kotonoha-cli → kotonoha-vscode (thin UI)
                              ↘ obsidian-kotonoha-console (first usable UI)
```

Normative overview: [`kotonoha-spec` `docs/current-official-architecture.md`](https://github.com/zyx-corporation/kotonoha-spec/blob/main/docs/current-official-architecture.md).

## RDE Check

### Preserved Elements

VSCode remains part of Kotonoha's context portability and semantic audit system.

### Authorized Transformations

The VSCode extension is reframed from a general UI into a developer-focused CLI/Core adapter.

### Inferred Extensions

Development context, Git diff capture, and project identity become the natural focus of the VSCode surface.

### Unresolved Elements

- exact CLI command names
- sidecar schema version handling
- test fixture layout
- integration with Cursor-specific workflows

### Drift Risks

- Becoming an AI coding agent.
- Duplicating CLI/Core logic.
- Creating sidecar schemas outside `kotonoha-spec`.
- Silently modifying files.

### Next Revision Policy

Revise this document after the CLI command contract and `kotonoha-spec` sidecar schema are stabilized.

## Related docs

- M3 acceptance: [`m3_acceptance.md`](m3_acceptance.md)
