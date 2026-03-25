/**
 * scripts/create-icons-pr.mjs
 *
 * Full automated icon sync + PR creation.
 *
 * Steps:
 *   1. Run sync-icons.mjs (fetch, transform, write)
 *   2. Check whether any tracked files actually changed
 *   3. If changed: create a sync branch, commit, push, open a PR via GitHub CLI
 *   4. If not changed: exit cleanly with an info message
 *
 * Usage:
 *   npm run icons:pr
 *
 * Requirements:
 *   - `gh` (GitHub CLI) must be installed and authenticated
 *   - BASE_BRANCH env var (default: "main")
 *   - ICONS_BRANCH_PREFIX env var (default: "chore/icons-sync")
 */
import dotenv from "dotenv";
import { execSync } from "node:child_process";
import { logStep, logInfo, logSuccess } from "./lib/utils.mjs";
import {
  createSyncBranch,
  commitAndPush,
  createPullRequest,
  hasDiffForPaths,
  hasGhCli
} from "./lib/git.mjs";

// Load .env.local first, then .env as fallback.
dotenv.config({ path: ".env.local" });
dotenv.config();

// Patch branch prefix env var so createSyncBranch uses our preferred prefix.
process.env.TOKENS_BRANCH_PREFIX =
  process.env.ICONS_BRANCH_PREFIX || "chore/icons-sync";

const TRACKED_PATHS = [
  "src/assets/icons/SVGR",
  "src/assets/icons/raw",
  "src/figma/Icons.figma.tsx"
];

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function main() {
  logStep("Running icon sync (fetch + transform)");
  run("node scripts/sync-icons.mjs");

  logStep("Checking for generated changes");
  const changed = hasDiffForPaths(TRACKED_PATHS);

  if (!changed) {
    logInfo("No icon changes detected. Skipping branch creation and PR.");
    return;
  }

  if (!hasGhCli()) {
    throw new Error(
      "GitHub CLI (`gh`) is not installed or not available in PATH. " +
        "Install it and run `npm run icons:pr` again."
    );
  }

  logStep("Creating sync branch");
  createSyncBranch();

  logStep("Committing and pushing generated files");
  commitAndPush(TRACKED_PATHS, "chore(icons): sync icon components from figma");

  const baseBranch = process.env.BASE_BRANCH || "main";

  const prTitle = "chore(icons): sync icon components from Figma";
  const prBody = [
    "This PR adds or updates React icon components synced from the Figma design system.",
    "",
    "**Changed paths:**",
    ...TRACKED_PATHS.map((p) => `- \`${p}\``),
    "",
    "**Files generated per icon:**",
    "- `src/assets/icons/raw/{kebab-name}.svg` — raw SVG (colours replaced with currentColor)",
    "- `src/assets/icons/SVGR/{ComponentName}.tsx` — TypeScript React component",
    "",
    "**Also regenerated:**",
    "- `src/assets/icons/SVGR/index.ts` — barrel export of all icons",
    "- `src/figma/Icons.figma.tsx` — Figma Code Connect for all icons",
    "",
    "Generated automatically by `npm run icons:pr`.",
    "Source of truth: Figma Icons page (`73065:972095`)."
  ].join("\n");

  logStep("Creating Pull Request via GitHub CLI");
  const prUrl = createPullRequest({ title: prTitle, body: prBody, baseBranch });

  logSuccess(`PR created: ${prUrl}`);
}

main();
