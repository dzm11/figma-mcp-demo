/**
 * scripts/create-pr.mjs
 *
 * Full automated token sync + PR creation.
 *
 * Steps:
 *   1. Run sync-tokens.mjs (pull + build)
 *   2. Check whether any tracked files actually changed
 *   3. If changed: create a sync branch, commit, push, open a PR via GitHub CLI
 *   4. If not changed: exit cleanly with an info message
 *
 * Usage:
 *   npm run tokens:pr
 *
 * Requirements:
 *   - `gh` (GitHub CLI) must be installed and authenticated
 *   - BASE_BRANCH env var (default: "main")
 *   - TOKENS_BRANCH_PREFIX env var (default: "chore/tokens-sync")
 */
import dotenv from "dotenv";
import { execSync } from "node:child_process";
import { readJsonFile, logStep, logInfo, logSuccess } from "./lib/utils.mjs";
import {
  createSyncBranch,
  commitAndPush,
  createPullRequest,
  hasDiffForPaths,
  hasGhCli
} from "./lib/git.mjs";
import { buildSummary } from "./lib/generate.mjs";

// Load .env.local first, then .env as fallback.
dotenv.config({ path: ".env.local" });
dotenv.config();

const config = readJsonFile("config/tokens.config.json");

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function main() {
  // Paths that are diffed and committed — source JSON + generated CSS file.
  const trackedPaths = [
    config.output.sourceJson,
    config.output.cssFile
  ];

  logStep("Running full token sync (pull + build)");
  run("node scripts/sync-tokens.mjs");

  logStep("Checking for generated changes");
  const changed = hasDiffForPaths(trackedPaths);

  if (!changed) {
    logInfo("No token changes detected. Skipping branch creation and PR.");
    return;
  }

  if (!hasGhCli()) {
    throw new Error(
      "GitHub CLI (`gh`) is not installed or not available in PATH. " +
        "Install it and run `npm run tokens:pr` again."
    );
  }

  const sourceJson = readJsonFile(config.output.sourceJson);
  const summary = buildSummary(sourceJson);

  logStep("Creating sync branch");
  createSyncBranch();

  logStep("Committing and pushing generated files");
  commitAndPush(trackedPaths, "chore(tokens): sync design tokens from figma");

  const baseBranch = process.env.BASE_BRANCH || "main";

  const prTitle = "chore(tokens): sync design tokens from Figma";
  const prBody = [
    "This PR updates the generated design token files synced from Figma.",
    "",
    "**Changed files:**",
    `- \`${config.output.sourceJson}\``,
    `- \`${config.output.cssFile}\``,
    "",
    `**Collections:** ${summary.collectionCount}`,
    `**Tokens:** ${summary.tokenCount}`,
    "",
    "Generated automatically by the local token sync CLI.",
    "Source of truth: Figma Variables REST API."
  ].join("\n");

  logStep("Creating Pull Request via GitHub CLI");
  const prUrl = createPullRequest({ title: prTitle, body: prBody, baseBranch });

  logSuccess(`PR created: ${prUrl}`);
}

main();
