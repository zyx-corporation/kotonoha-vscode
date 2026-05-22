# M4 boundary verification — VS Code extension

**Issues:** [#10](https://github.com/zyx-corporation/kotonoha-vscode/issues/10), [#11](https://github.com/zyx-corporation/kotonoha-vscode/issues/11)

| Check | Result |
| --- | --- |
| All operations via `kotonoha` CLI child process | **Pass** |
| `KOTONOHA_PRINCIPAL_ID` / `KOTONOHA_PROJECT_ID` in `cliEnv()` (M7-c) | **Pass** |
| README requires CLI ≥ 0.2.9 (SLS-9 validation path) | **Pass** |
| Panels remain implementation UX ([`ui-design-review-m7.md`](ui-design-review-m7.md)) | **Pass** |
| Not normative SLS ([SLS-9.11](https://github.com/zyx-corporation/kotonoha-spec/blob/main/docs/phase2-interchange-hardening.md#sls-911-out-of-scope-for-phase-2)) | **Pass** |

**Core revision:** use `kotonoha_core` via CLI dependency pin ≥ **dfeefe9** (or CLI release bundling that core revision).

**Judgment:** **Pass with notes** — #10 satisfied by documented CLI/core minimums; no separate core crate in the extension.
