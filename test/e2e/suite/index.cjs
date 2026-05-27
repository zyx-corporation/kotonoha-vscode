const assert = require("assert");
const vscode = require("vscode");

/** @type {import('@vscode/test-electron').TestRunner} */
exports.run = async function run() {
  const ext = vscode.extensions.getExtension("zyx-corporation.kotonoha");
  assert.ok(ext, "kotonoha extension must load in Extension Development Host");

  await ext.activate();
  assert.strictEqual(ext.isActive, true);

  const cmds = await vscode.commands.getCommands(true);
  for (const id of [
    "kotonoha.registerMeaningDelta",
    "kotonoha.reviewApprove",
    "kotonoha.focusRdeReview",
  ]) {
    assert.ok(cmds.includes(id), `missing command: ${id}`);
  }

  const emptyDb = "";
  const blocked = require("../../../dist/meaningDeltaForm.js")
    .validateRegisterPreconditions({
      databaseUrl: emptyDb,
      file: "readme.md",
      workspaceReady: true,
    });
  assert.strictEqual(
    blocked,
    "preflight.databaseUrlRegister",
    "empty databaseUrl must block register preflight"
  );
};
