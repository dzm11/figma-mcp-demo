/**
 * scripts/build-tokens.mjs
 *
 * Step 2 of the token pipeline.
 *
 * Reads tokens/tokens.source.json and generates:
 *   - src/styles/tokens.css  (final app-facing CSS custom properties)
 *
 * Usage:
 *   npm run tokens:build
 *
 * Run tokens:pull first if you need to sync changes from Figma.
 * This script can also be run locally at any time to rebuild from the
 * existing source JSON without hitting the Figma API.
 */
import { readJsonFile, writeTextFile, logStep, logSuccess } from "./lib/utils.mjs";
import { buildCss, buildSummary, buildTypographyCss } from "./lib/generate.mjs";

const config = readJsonFile("config/tokens.config.json");

function main() {
  logStep(`Reading source JSON from ${config.output.sourceJson}`);
  const sourceJson = readJsonFile(config.output.sourceJson);

  logStep("Generating final CSS token file");
  const css = buildCss(sourceJson, config);
  const typographyCss = buildTypographyCss(sourceJson, config);

  logStep(`Writing CSS  → ${config.output.cssFile}`);
  writeTextFile(config.output.cssFile, css);

  if (config.output.typographyCssFile) {
    logStep(`Writing typography CSS  → ${config.output.typographyCssFile}`);
    writeTextFile(config.output.typographyCssFile, typographyCss);
  }

  const summary = buildSummary(sourceJson);

  logSuccess(
    `Built ${summary.tokenCount} token(s) across ${summary.collectionCount} collection(s)`
  );
}

main();
