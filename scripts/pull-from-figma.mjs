import { fetchLocalVariables, fetchLocalStyles, fetchNodeDetails } from "./lib/figma.mjs";
import {
  transformFigmaVariablesToSource,
  transformFigmaStylesToSource
} from "./lib/transform.mjs";
import { readJsonFile, writeJsonFile, logStep, logSuccess } from "./lib/utils.mjs";

const config = readJsonFile("config/tokens.config.json");

async function main() {
  logStep("Fetching variables from Figma REST API");
  const variablesPayload = await fetchLocalVariables();

  logStep("Fetching styles (shadows) from Figma REST API");
  const stylesPayload = await fetchLocalStyles();

  logStep("Transforming API payload into source JSON");
  const sourceJson = transformFigmaVariablesToSource(variablesPayload, config);

  // Extract shadow tokens: first collect EFFECT style node IDs, then fetch node details
  logStep("Extracting shadow styles");
  const effectNodeIds = (stylesPayload?.meta?.styles || [])
    .filter((style) => style.style_type === "EFFECT")
    .map((style) => style.node_id);

  if (effectNodeIds.length > 0) {
    logStep(`Fetching details for ${effectNodeIds.length} shadow effect node(s)`);
    const nodesPayload = await fetchNodeDetails(effectNodeIds);

    const shadowsCollection = transformFigmaStylesToSource(
      stylesPayload,
      nodesPayload
    );

    if (shadowsCollection) {
      sourceJson.collections.push(shadowsCollection);
      logSuccess(`Found ${shadowsCollection.tokens.length} shadow token(s)`);
    }
  } else {
    logStep(
      "No shadow styles found in Figma file (no EFFECT style types detected)"
    );
  }

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
