import { execSync, spawnSync } from "node:child_process";
import dotenv from "dotenv";
import { getTimestampSlug, logInfo } from "./utils.mjs";

// Load .env.local first (project convention), then .env as fallback.
dotenv.config({ path: ".env.local" });
dotenv.config();

/**
 * Run a shell command synchronously and return trimmed stdout.
 */
function run(command) {
  return execSync(command, {
    stdio: "pipe",
    encoding: "utf8"
  }).trim();
}

/**
 * Return true if any of the given paths have uncommitted changes.
 * Used before creating a branch to avoid empty PRs.
 */
export function hasDiffForPaths(paths) {
  const quoted = paths.map((p) => `"${p}"`).join(" ");
  const output = run(`git diff --name-only -- ${quoted}`);
  return output.length > 0;
}

/**
 * Create and check out a fresh sync branch.
 * Branch name format: <prefix>-<YYYYMMDD-HHMMSS>
 */
export function createSyncBranch() {
  const prefix = process.env.TOKENS_BRANCH_PREFIX || "chore/tokens-sync";
  const branchName = `${prefix}-${getTimestampSlug()}`;

  logInfo(`Creating branch: ${branchName}`);
  run(`git checkout -b "${branchName}"`);

  return branchName;
}

/**
 * Stage the given paths, create a commit, and push to origin.
 */
export function commitAndPush(paths, commitMessage) {
  const quoted = paths.map((p) => `"${p}"`).join(" ");
  run(`git add ${quoted}`);
  run(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
  run(`git push --set-upstream origin HEAD`);
}

/**
 * Open a pull request using the GitHub CLI (`gh`).
 * Requires `gh` to be installed and authenticated.
 */
export function createPullRequest({ title, body, baseBranch }) {
  const result = spawnSync(
    "gh",
    ["pr", "create", "--base", baseBranch, "--title", title, "--body", body],
    { encoding: "utf8" }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "gh pr create failed");
  }

  return String(result.stdout || "").trim();
}

/**
 * Return true when GitHub CLI is available in PATH.
 */
export function hasGhCli() {
  const result = spawnSync("gh", ["--version"], { encoding: "utf8" });
  return !result.error && result.status === 0;
}
