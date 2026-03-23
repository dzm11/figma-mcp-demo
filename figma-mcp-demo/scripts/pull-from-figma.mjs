/**
 * scripts/pull-from-figma.mjs
 *
 * Step 1 of the token pipeline.
 *
 * Connects to the Figma REST API, fetches all local variables for the
 * configured file, normalises them via transform.mjs, and writes the result
 * to tokens/tokens.source.json — the code source of truth for token metadata.
 *
 * Usage:
 *   npm run tokens:pull
 *
 * Required env vars (in .env.local):
 *   FIGMA_TOKEN     — Figma personal access token
 *   FIGMA_FILE_KEY  — File key from the Figma file URL
 */
import { fetchLocalVariables } from "./lib/figma.mjs";
import { transformFigmaVariablesToSource } from "./lib/transform.mjs";
import { readJsonFile, writeJsonFile, logStep, logSuccess } from "./lib/utils.mjs";

const config = readJsonFile("config/tokens.config.json");

async function main() {
  logStep("Fetching variables from Figma REST API");
  const payload = await fetchLocalVariables();

  logStep("Transforming API payload into source JSON");
  const sourceJson = transformFigmaVariablesToSource(payload, config);

  logStep(`Writing source JSON to ${config.output.sourceJson}`);
  writeJsonFile(config.output.sourceJson, sourceJson);

  logSuccess(
    `Pulled ${sourceJson.collections.length} collection(s) → ${config.output.sourceJson}`
  );
}

main().catch((error) => {
  console.error("\n[ERROR] pull-from-figma failed");
  console.error(error.message ?? error);
  process.exit(1);
});
