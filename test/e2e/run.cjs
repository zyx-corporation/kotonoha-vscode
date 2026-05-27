const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const { runTests } = require("@vscode/test-electron");

function ensureFixture() {
  const ws = path.resolve(__dirname, "../fixtures/minimal-workspace");
  fs.mkdirSync(ws, { recursive: true });
  const readme = path.join(ws, "readme.md");
  if (!fs.existsSync(readme)) {
    fs.writeFileSync(readme, "# kotonoha e2e fixture\n");
  }
  if (!fs.existsSync(path.join(ws, ".git"))) {
    execSync("git init -b main", { cwd: ws, stdio: "inherit" });
    execSync("git config user.email e2e@example.com", { cwd: ws });
    execSync("git config user.name e2e", { cwd: ws });
    execSync("git add readme.md", { cwd: ws });
    execSync('git commit -m "init"', { cwd: ws });
  }
  return ws;
}

async function main() {
  const extensionDevelopmentPath = path.resolve(__dirname, "../..");
  const extensionTestsPath = path.resolve(__dirname, "./suite/index.cjs");
  const testWorkspace = ensureFixture();

  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [testWorkspace, "--disable-extensions"],
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
