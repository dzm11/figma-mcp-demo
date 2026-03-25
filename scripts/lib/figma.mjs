import dotenv from "dotenv";
import { logInfo } from "./utils.mjs";

// Load from .env.local first (project convention), then fall back to .env.
// This is consistent with how the existing figma:publish script works.
dotenv.config({ path: ".env.local" });
dotenv.config(); // no-op if vars were already loaded; fallback for plain .env

/**
 * Read and validate the required Figma environment variables.
 *
 * FIGMA_TOKEN  — Figma personal access token (same value you use for
 *                FIGMA_ACCESS_TOKEN in figma:publish; add FIGMA_TOKEN= to
 *                .env.local to reuse it here).
 * FIGMA_FILE_KEY — the key from your Figma file URL, e.g.
 *                  https://www.figma.com/design/<FILE_KEY>/...
 */
export function getFigmaEnv() {
  const token = process.env.FIGMA_TOKEN;
  const fileKey = process.env.FIGMA_FILE_KEY;

  if (!token) {
    throw new Error(
      "Missing FIGMA_TOKEN in .env.local (or .env).\n" +
        "Add: FIGMA_TOKEN=your_personal_access_token"
    );
  }

  if (!fileKey) {
    throw new Error(
      "Missing FIGMA_FILE_KEY in .env.local (or .env).\n" +
        "Add: FIGMA_FILE_KEY=H3scHHO8gzcKecmO2Sa9aN"
    );
  }

  return { token, fileKey };
}

/**
 * Internal: perform an authenticated GET request to the Figma REST API.
 */
async function figmaGet(pathname) {
  const { token } = getFigmaEnv();
  const url = `https://api.figma.com${pathname}`;

  logInfo(`Fetching: ${url}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Figma-Token": token,
      "Content-Type": "application/json"
    }
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Figma returned a non-JSON response:\n${text}`);
  }

  if (!response.ok) {
    throw new Error(
      `Figma API error ${response.status}: ${data?.message ?? "Unknown error"}`
    );
  }

  return data;
}

/**
 * Internal: perform an authenticated POST request to the Figma REST API.
 */
async function figmaPost(pathname, body) {
  const { token } = getFigmaEnv();
  const url = `https://api.figma.com${pathname}`;

  logInfo(`Posting: ${url}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-Figma-Token": token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Figma returned a non-JSON response:\n${text}`);
  }

  if (!response.ok) {
    throw new Error(
      `Figma API error ${response.status}: ${data?.message ?? "Unknown error"}`
    );
  }

  return data;
}

/**
 * Fetch local variables (collections + variables) for the configured Figma file.
 * Uses the Figma Variables REST API endpoint.
 */
export async function fetchLocalVariables() {
  const { fileKey } = getFigmaEnv();
  return figmaGet(`/v1/files/${fileKey}/variables/local`);
}

/**
 * Fetch local styles (colors, effects, etc.) for the configured Figma file.
 * Uses the Figma Styles REST API endpoint.
 * Includes shadow/effect styles which can be converted to CSS box-shadow tokens.
 */
export async function fetchLocalStyles() {
  const { fileKey } = getFigmaEnv();
  return figmaGet(`/v1/files/${fileKey}/styles`);
}

/**
 * Fetch node details for one or more node IDs in the Figma file.
 * Used to retrieve full effect/shadow definitions after fetching style metadata.
 *
 * @param {string|string[]} nodeIds - single node ID or array of node IDs (format: "75:242")
 * @returns {Promise<Object>} node data with effects, properties, etc.
 */
export async function fetchNodeDetails(nodeIds) {
  const { fileKey } = getFigmaEnv();
  
  const idsParam = Array.isArray(nodeIds)
    ? nodeIds.join(",")
    : nodeIds;

  return figmaGet(`/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(idsParam)}`);
}

/**
 * Bulk create, update, and delete variables in the configured Figma file.
 */
export async function postVariables(body) {
  const { fileKey } = getFigmaEnv();
  return figmaPost(`/v1/files/${fileKey}/variables`, body);
}
