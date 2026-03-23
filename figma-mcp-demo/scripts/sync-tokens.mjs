/**
 * scripts/sync-tokens.mjs
 *
 * Convenience script that runs the full token pipeline in sequence:
 *   1. pull-from-figma — fetch variables from Figma API
 *   2. build-tokens    — generate SCSS and CSS files from source JSON
 *
 * Usage:
 *   npm run tokens:sync
 *
 * After this completes, review the diff in src/styles/tokens.css and commit.
 * For an automated branch + PR flow, use `npm run tokens:pr` instead.
 */
import { execSync } from "node:child_process";
import { logStep, logSuccess } from "./lib/utils.mjs";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function main() {
  logStep("Pulling tokens from Figma");
  run("node scripts/pull-from-figma.mjs");

  logStep("Building generated token files");
  run("node scripts/build-tokens.mjs");

  logSuccess("Token sync completed — review changes and commit");
}

main();
