import { fetchLocalVariables, postVariables } from "./lib/figma.mjs";
import { logInfo, logStep, logSuccess } from "./lib/utils.mjs";

const DIMENSION_VALUES = [
  0, 1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72,
  80, 96, 112, 128, 144, 176, 192, 208, 224, 256, 288, 320, 394
];

const TOKEN_GROUPS = [
  {
    figmaPrefix: "Height",
    codePrefix: "h",
    scope: "WIDTH_HEIGHT"
  },
  {
    figmaPrefix: "Width",
    codePrefix: "w",
    scope: "WIDTH_HEIGHT"
  }
];

function getWebCodeSyntax(variable) {
  if (!variable?.codeSyntax) {
    return null;
  }

  if (typeof variable.codeSyntax === "string") {
    return variable.codeSyntax;
  }

  return variable.codeSyntax.WEB || variable.codeSyntax.web || null;
}

function buildDesiredTokens() {
  return TOKEN_GROUPS.flatMap(({ figmaPrefix, codePrefix, scope }) =>
    DIMENSION_VALUES.map((value) => ({
      key: `${codePrefix}-${value}`,
      figmaName: `${figmaPrefix}/${codePrefix}-${value}`,
      codeSyntax: { WEB: `${codePrefix}-${value}` },
      value,
      scope
    }))
  );
}

async function main() {
  logStep("Fetching local variables from Figma");
  const payload = await fetchLocalVariables();

  const collections = Object.values(payload.meta?.variableCollections ?? {});
  const variables = Object.values(payload.meta?.variables ?? {});

  const primitivesCollection = collections.find((collection) => collection.name === "Primitives");
  if (!primitivesCollection) {
    throw new Error('Collection "Primitives" was not found in the Figma file.');
  }

  const modeIds = (primitivesCollection.modes ?? []).map((mode) => mode.modeId);
  if (modeIds.length === 0) {
    throw new Error('Collection "Primitives" has no modes, so variable values cannot be assigned.');
  }

  const primitivesVariables = variables.filter(
    (variable) => variable.variableCollectionId === primitivesCollection.id && !variable.remote
  );

  const existingByKey = new Map();
  for (const variable of primitivesVariables) {
    const webCodeSyntax = getWebCodeSyntax(variable);
    if (webCodeSyntax) {
      existingByKey.set(webCodeSyntax, variable);
    }
    existingByKey.set(variable.name, variable);
  }

  const desiredTokens = buildDesiredTokens();
  const variablesToCreate = [];
  const variablesToUpdate = [];
  const variableModeValues = [];

  for (const token of desiredTokens) {
    const existing = existingByKey.get(token.codeSyntax.WEB) || existingByKey.get(token.figmaName);

    if (existing) {
      variablesToUpdate.push({
        action: "UPDATE",
        id: existing.id,
        name: token.figmaName,
        scopes: [token.scope],
        codeSyntax: token.codeSyntax,
        hiddenFromPublishing: false
      });

      for (const modeId of modeIds) {
        variableModeValues.push({
          variableId: existing.id,
          modeId,
          value: token.value
        });
      }

      continue;
    }

    const tempId = `tmp_${token.key}`;
    variablesToCreate.push({
      action: "CREATE",
      id: tempId,
      name: token.figmaName,
      variableCollectionId: primitivesCollection.id,
      resolvedType: "FLOAT",
      scopes: [token.scope],
      codeSyntax: token.codeSyntax,
      hiddenFromPublishing: false
    });

    for (const modeId of modeIds) {
      variableModeValues.push({
        variableId: tempId,
        modeId,
        value: token.value
      });
    }
  }

  logInfo(`Primitives collection id: ${primitivesCollection.id}`);
  logInfo(`Will create ${variablesToCreate.length} token(s) and update ${variablesToUpdate.length} token(s).`);

  if (variablesToCreate.length === 0 && variablesToUpdate.length === 0) {
    logSuccess("Dimension tokens already match the requested state. Nothing to do.");
    return;
  }

  const requestBody = {
    variables: [...variablesToCreate, ...variablesToUpdate],
    variableModeValues
  };

  logStep("Posting variable changes to Figma");
  const result = await postVariables(requestBody);

  const createdCount = Object.keys(result.meta?.tempIdToRealId ?? {}).length;
  logSuccess(
    `Done — created ${createdCount} token(s), updated ${variablesToUpdate.length} token(s), set ${variableModeValues.length} mode value(s).`
  );
}

main().catch((error) => {
  console.error("\n[ERROR] add-dimension-tokens failed");
  console.error(error.message ?? error);
  process.exit(1);
});