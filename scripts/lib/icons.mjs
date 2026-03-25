/**
 * scripts/lib/icons.mjs
 *
 * Figma REST API helpers and name-normalisation utilities specific to the
 * icon sync pipeline. All functions follow the same conventions as the
 * existing figma.mjs / utils.mjs lib modules.
 */
import fs from "node:fs";
import path from "node:path";

// ── Figma REST API helpers ────────────────────────────────────────────────

/**
 * Fetch all COMPONENT nodes that live on a specific Figma page by recursively
 * walking the page document returned by GET /v1/files/:key/nodes.
 *
 * @param {string} fileKey
 * @param {string} token      Figma personal access token
 * @param {string} pageNodeId Figma node ID of the icons page  (e.g. "73065:972095")
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
export async function fetchIconComponents(fileKey, token, pageNodeId) {
  const encodedId = encodeURIComponent(pageNodeId);
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodedId}`;

  const res = await fetch(url, {
    headers: { "X-Figma-Token": token }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const pageDocument = data?.nodes?.[pageNodeId]?.document;

  if (!pageDocument) {
    throw new Error(
      `Could not find page node "${pageNodeId}" in Figma response. ` +
        `Keys returned: ${Object.keys(data?.nodes ?? {}).join(", ")}`
    );
  }

  const components = [];
  collectComponents(pageDocument, components);
  return components;
}

/** Recursively collect all nodes with type === "COMPONENT". */
function collectComponents(node, acc) {
  if (node.type === "COMPONENT") {
    acc.push({ id: node.id, name: node.name });
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectComponents(child, acc);
    }
  }
}

/**
 * Request SVG export URLs for an array of node IDs from the Figma Images API.
 * Batches requests in groups of 50 to stay within URL-length limits.
 *
 * @param {string}   fileKey
 * @param {string}   token
 * @param {string[]} nodeIds  Array of Figma node IDs  (e.g. ["2165:1035", ...])
 * @returns {Promise<Map<string, string>>}  nodeId → presigned SVG URL
 */
export async function fetchSvgUrls(fileKey, token, nodeIds) {
  const BATCH_SIZE = 50;
  const result = new Map();

  for (let i = 0; i < nodeIds.length; i += BATCH_SIZE) {
    const batch = nodeIds.slice(i, i + BATCH_SIZE);
    const ids = batch.map(encodeURIComponent).join(",");
    const url =
      `https://api.figma.com/v1/images/${fileKey}` +
      `?ids=${ids}&format=svg&svg_outline_text=false&svg_include_id=false`;

    const res = await fetch(url, {
      headers: { "X-Figma-Token": token }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Figma Images API error ${res.status}: ${text}`);
    }

    const data = await res.json();

    if (data.err) {
      throw new Error(`Figma Images API returned error: ${data.err}`);
    }

    for (const [id, svgUrl] of Object.entries(data.images ?? {})) {
      if (svgUrl) result.set(id, svgUrl);
    }
  }

  return result;
}

/**
 * Download the SVG content from a presigned S3 URL.
 * No auth header required — the URL is already signed by Figma.
 *
 * @param {string} url
 * @returns {Promise<string>} Raw SVG markup
 */
export async function downloadSvg(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`SVG download failed (${res.status}): ${url}`);
  }
  return res.text();
}

// ── SVG post-processing ───────────────────────────────────────────────────

/**
 * Replace any hardcoded fill/stroke colour with `currentColor` so that icon
 * components inherit the surrounding text colour automatically.
 *
 * Replaces ALL hex colours, named blacks, and rgb(...) values. Intentionally
 * leaves `none`, `white`/`#fff`/`#ffffff`, and `url(...)` untouched — those
 * are used for clip-path shapes and transparent fills.
 *
 * @param {string} svg
 * @returns {string}
 */
export function replaceSolidColorsWithCurrentColor(svg) {
  return svg
    // Any hex color that is NOT a white variant (case-insensitive)
    .replace(
      /(fill|stroke)="#(?!(?:fff|ffffff)")[0-9a-fA-F]{3,8}"/gi,
      '$1="currentColor"'
    )
    // Named colour keywords (black, etc.)
    .replace(/(fill|stroke)="(?:black)"/gi, '$1="currentColor"')
    // rgb(0,0,0) style values
    .replace(/(fill|stroke)="rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)"/gi, '$1="currentColor"')
    // Inline style: fill:#xxxxxx (not white)
    .replace(
      /(fill|stroke):\s*#(?!(?:fff|ffffff)\b)[0-9a-fA-F]{3,8}\b/gi,
      "$1:currentColor"
    );
}

// ── Name normalisation ────────────────────────────────────────────────────

/**
 * Convert a Figma icon name (after category stripping in Figma) to a
 * lowercase kebab-case string suitable for file names.
 *
 * e.g.  "Add Create Include Select" → "add-create-include-select"
 *       "API Check"                 → "api-check"
 *       "Look-a-like Audience"      → "look-a-like-audience"
 *
 * @param {string} name
 * @returns {string}
 */
export function figmaNameToKebab(name) {
  return name
    .trim()
    .replace(/[,&]/g, " ")          // remove punctuation
    .replace(/\s+/g, "-")           // spaces → hyphens
    .replace(/-+/g, "-")            // collapse consecutive hyphens
    .replace(/^-|-$/g, "")          // trim leading/trailing hyphens
    .toLowerCase();
}

/**
 * Convert a Figma icon name to a PascalCase component name, prefixed with
 * `Icon`.
 *
 * e.g.  "Add Create Include Select" → "IconAddCreateIncludeSelect"
 *       "API Check"                 → "IconApiCheck"
 *       "Look-a-like Audience"      → "IconLookALikeAudience"
 *
 * @param {string} name
 * @returns {string}
 */
export function figmaNameToComponentName(name) {
  const kebab = figmaNameToKebab(name);
  const pascal = kebab
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join("");
  return `Icon${pascal}`;
}

// ── Codebase scanner ─────────────────────────────────────────────────────

/**
 * Scan an existing SVGR output directory and return a Map of
 * componentName → absolute file path for all `.tsx` files found.
 *
 * @param {string} svgrDir  e.g. "src/assets/icons/SVGR"
 * @returns {Map<string, string>}
 */
export function scanExistingIcons(svgrDir) {
  const result = new Map();

  if (!fs.existsSync(svgrDir)) return result;

  for (const entry of fs.readdirSync(svgrDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".tsx")) {
      const componentName = path.basename(entry.name, ".tsx");
      result.set(componentName, path.join(svgrDir, entry.name));
    }
  }

  return result;
}

// ── Figma node-ID URL conversion ─────────────────────────────────────────

/**
 * Convert a Figma node ID from API format ("73065:972095") to URL format
 * ("73065-972095") as used in Figma design URLs.
 *
 * @param {string} nodeId
 * @returns {string}
 */
export function nodeIdToUrlFormat(nodeId) {
  return nodeId.replace(":", "-");
}
