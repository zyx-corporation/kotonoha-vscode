export function webviewShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    :root {
      --pad: 10px;
      --border: var(--vscode-panel-border, #444);
      --fg: var(--vscode-foreground);
      --muted: var(--vscode-descriptionForeground);
      --btn: var(--vscode-button-background);
      --btn-fg: var(--vscode-button-foreground);
      --input-bg: var(--vscode-input-background);
      --input-fg: var(--vscode-input-foreground);
    }
    body { font-family: var(--vscode-font-family); font-size: 12px; color: var(--fg); margin: 0; padding: var(--pad); }
    h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin: 0 0 8px; font-weight: 600; }
    .card { border: 1px solid var(--border); border-radius: 4px; padding: 8px; margin-bottom: 10px; }
    dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 4px 8px; }
    dt { color: var(--muted); margin: 0; }
    dd { margin: 0; word-break: break-all; }
    label { display: block; margin: 6px 0 2px; color: var(--muted); font-size: 11px; }
    input, textarea { width: 100%; box-sizing: border-box; background: var(--input-bg); color: var(--input-fg); border: 1px solid var(--border); border-radius: 3px; padding: 4px 6px; }
    textarea { min-height: 56px; resize: vertical; }
    button { background: var(--btn); color: var(--btn-fg); border: none; border-radius: 3px; padding: 6px 10px; cursor: pointer; margin: 4px 4px 0 0; font-size: 12px; }
    button.secondary { background: transparent; color: var(--fg); border: 1px solid var(--border); }
    .error { color: var(--vscode-errorForeground); white-space: pre-wrap; font-size: 11px; }
    .ok { color: var(--vscode-testing-iconPassed); font-size: 11px; }
    .warn { color: var(--vscode-editorWarning-foreground); font-size: 11px; }
    .note { font-size: 11px; color: var(--muted); margin: 8px 0; line-height: 1.4; }
    .row { display: flex; gap: 6px; align-items: center; }
    .row input { flex: 1; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}
