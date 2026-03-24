import { fetchLocalVariables, fetchLocalStyles, fetchNodeDetails } from "./lib/figma.mjs";
import {
  transformFigmaVariablesToSource,
  transformFigmaStylesToSource,
  transformFigmaTextStylesToSource
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

  // Extract style-backed artifacts: collect EFFECT + TEXT style node IDs,
  // fetch details once, then derive shadows and typography styles.
  const allStyles = stylesPayload?.meta?.styles || [];
  const effectNodeIds = allStyles
    .filter((style) => style.style_type === "EFFECT")
    .map((style) => style.node_id);

  const textNodeIds = allStyles
    .filter((style) => style.style_type === "TEXT")
    .map((style) => style.node_id);

  const uniqueNodeIds = [...new Set([...effectNodeIds, ...textNodeIds])];

  let nodesPayload = null;
  if (uniqueNodeIds.length > 0) {
    logStep(`Fetching details for ${uniqueNodeIds.length} style node(s)`);
    nodesPayload = await fetchNodeDetails(uniqueNodeIds);
  }

  logStep("Extracting shadow styles");

  if (effectNodeIds.length > 0) {
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

  logStep("Extracting typography styles");
  const textStyles = transformFigmaTextStylesToSource(
    stylesPayload,
    nodesPayload
  );
  sourceJson.textStyles = textStyles;
  logSuccess(`Found ${textStyles.length} typography style(s)`);

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
