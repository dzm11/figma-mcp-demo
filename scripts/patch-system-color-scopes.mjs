/**
 * One-time script: patch all COLOR variables in the "System/" group
 * inside the "Primitives" collection in Figma.
 *
 * Changes applied to every matching variable:
 *   - hiddenFromPublishing → true   ("Hide from publishing")
 *   - scopes              → ["ALL_SCOPES"]  ("Show in all supported properties")
 *
 * Usage:
 *   node scripts/patch-system-color-scopes.mjs
 *
 * Requires FIGMA_TOKEN and FIGMA_FILE_KEY in .env.local (or .env).
 */

import dotenv from "dotenv";
import { getFigmaEnv } from "./lib/figma.mjs";
import { logStep, logSuccess, logInfo } from "./lib/utils.mjs";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function fetchLocalVariables() {
  const { token, fileKey } = getFigmaEnv();
  const url = `https://api.figma.com/v1/files/${fileKey}/variables/local`;
  logInfo(`GET ${url}`);
  const res = await fetch(url, {
    headers: { "X-Figma-Token": token, "Content-Type": "application/json" },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Figma GET error ${res.status}: ${body?.message ?? JSON.stringify(body)}`);
  return body;
}

async function updateVariables(variableUpdates) {
  const { token, fileKey } = getFigmaEnv();
  const url = `https://api.figma.com/v1/files/${fileKey}/variables`;
  logInfo(`POST ${url}  (${variableUpdates.length} variable updates)`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "X-Figma-Token": token, "Content-Type": "application/json" },
    body: JSON.stringify({ variables: variableUpdates }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Figma POST error ${res.status}: ${body?.message ?? JSON.stringify(body)}`);
  return body;
}

async function main() {
  logStep('Fetching local variables from Figma');
  const payload = await fetchLocalVariables();

  const collections = Object.values(payload.meta?.variableCollections ?? {});
  const variables   = Object.values(payload.meta?.variables ?? {});

  // Find the "Primitives" collection
  const primitivesCol = collections.find((c) => c.name === "Primitives");
  if (!primitivesCol) {
    const names = collections.map((c) => `"${c.name}"`).join(", ");
    throw new Error(`Collection "Primitives" not found. Available: ${names}`);
  }

  logInfo(`Found collection "Primitives" (id: ${primitivesCol.id})`);

  // Target: COLOR variables in "Primitives" whose name starts with "System/"
  const targets = variables.filter(
    (v) =>
      v.variableCollectionId === primitivesCol.id &&
      v.name.startsWith("System/") &&
      v.resolvedType === "COLOR"
  );

  if (targets.length === 0) {
    console.log('No COLOR variables with prefix "System/" found in "Primitives". Exiting.');
    return;
  }

  logInfo(`Found ${targets.length} variable(s) to patch:`);
  targets.forEach((v) => console.log(`  - ${v.name}`));

  const variableUpdates = targets.map((v) => ({
    action: "UPDATE",
    id: v.id,
    hiddenFromPublishing: true,
    scopes: ["ALL_SCOPES"],
  }));

  // Figma accepts up to 100 updates per request
  const BATCH_SIZE = 100;
  let updated = 0;
  for (let i = 0; i < variableUpdates.length; i += BATCH_SIZE) {
    const batch = variableUpdates.slice(i, i + BATCH_SIZE);
    logStep(`Patching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(variableUpdates.length / BATCH_SIZE)} (${batch.length} variables)`);
    await updateVariables(batch);
    updated += batch.length;
  }

  logSuccess(`Done — ${updated} variable(s) updated:`);
  console.log("  • hiddenFromPublishing → true");
  console.log("  • scopes              → [ALL_SCOPES]");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
