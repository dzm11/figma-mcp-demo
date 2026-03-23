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
 * Fetch local variables (collections + variables) for the configured Figma file.
 * Uses the Figma Variables REST API endpoint.
 */
export async function fetchLocalVariables() {
  const { fileKey } = getFigmaEnv();
  return figmaGet(`/v1/files/${fileKey}/variables/local`);
}
