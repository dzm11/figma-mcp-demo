/**
 * scripts/sync-icons.mjs
 *
 * Fetches all icon components from the Figma Icons page, diffs against the
 * existing codebase, and for every new or changed icon:
 *
 *   1. Downloads the raw SVG from Figma
 *   2. Post-processes colours → currentColor
 *   3. Writes the raw SVG to  src/assets/icons/raw/{kebab-name}.svg
 *   4. Transforms to TypeScript React via SVGR
 *   5. Writes the TSX to      src/assets/icons/SVGR/{ComponentName}.tsx
 *
 * After processing all icons it regenerates two derived files:
 *   • src/assets/icons/SVGR/index.ts        — barrel re-export of all icons
 *   • src/figma/Icons.figma.tsx             — Code Connect for every icon
 *
 * Usage:
 *   npm run icons:sync
 */
import path from "node:path";
import { transform } from "@svgr/core";
import { getFigmaEnv } from "./lib/figma.mjs";
import {
  fetchIconComponents,
  fetchSvgUrls,
  downloadSvg,
  replaceSolidColorsWithCurrentColor,
  figmaNameToKebab,
  figmaNameToComponentName,
  scanExistingIcons,
  nodeIdToUrlFormat
} from "./lib/icons.mjs";
import { writeTextFile, logStep, logInfo, logWarn, logSuccess } from "./lib/utils.mjs";

// ── Configuration ─────────────────────────────────────────────────────────

const FILE_KEY = "H3scHHO8gzcKecmO2Sa9aN";
const ICONS_PAGE_NODE_ID = "73065:972095";
const SVGR_DIR = "src/assets/icons/SVGR";
const RAW_DIR = "src/assets/icons/raw";
const CODE_CONNECT_FILE = "src/figma/Icons.figma.tsx";
const BARREL_FILE = `${SVGR_DIR}/index.ts`;

// ── SVGR custom template ──────────────────────────────────────────────────

/**
 * Generates a named-export React component accepting SVGProps<SVGSVGElement>.
 * React 19 JSX transform — no `import React` needed.
 */
function svgrTemplate({ componentName, jsx }, { tpl }) {
  return tpl`
import type { SVGProps } from 'react';

export const ${componentName} = (props: SVGProps<SVGSVGElement>) => (
  ${jsx}
);
`;
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const { token, fileKey: envFileKey } = getFigmaEnv();
  const fileKey = envFileKey || FILE_KEY;

  // 1. Fetch all icon components from Figma
  logStep("Fetching icon components from Figma");
  const figmaIcons = await fetchIconComponents(fileKey, token, ICONS_PAGE_NODE_ID);
  logInfo(`Found ${figmaIcons.length} icon components on Figma Icons page`);

  // 2. Scan existing icons in codebase
  logStep("Scanning existing icons in codebase");
  const existingIcons = scanExistingIcons(SVGR_DIR);
  logInfo(`Found ${existingIcons.size} existing icon TSX files`);

  // 3. Compute diff
  const figmaComponentNames = new Set(
    figmaIcons.map((ic) => figmaNameToComponentName(ic.name))
  );

  // Warn about icons removed from Figma (never delete codebase files automatically)
  for (const existingName of existingIcons.keys()) {
    if (existingName !== "index" && !figmaComponentNames.has(existingName)) {
      logWarn(
        `Icon "${existingName}" exists in codebase but was NOT found on the Figma Icons page. ` +
          `File kept — remove manually if intentional.`
      );
    }
  }

  // Icons to process: those not yet in the codebase
  const toProcess = figmaIcons.filter(
    (ic) => !existingIcons.has(figmaNameToComponentName(ic.name))
  );

  logInfo(`Icons to add: ${toProcess.length}`);

  if (toProcess.length === 0) {
    logSuccess("Codebase is already up-to-date with Figma. Nothing to do.");
  } else {
    // 4. Fetch SVG export URLs for new icons
    logStep(`Fetching SVG export URLs for ${toProcess.length} icons`);
    const nodeIds = toProcess.map((ic) => ic.id);
    const svgUrlMap = await fetchSvgUrls(fileKey, token, nodeIds);
    logInfo(`Received ${svgUrlMap.size} export URLs`);

    // 5. Download, transform, and write each new icon
    logStep("Downloading and transforming icons");
    let done = 0;

    for (const icon of toProcess) {
      const componentName = figmaNameToComponentName(icon.name);
      const kebab = figmaNameToKebab(icon.name);
      const svgUrl = svgUrlMap.get(icon.id);

      if (!svgUrl) {
        logWarn(`No SVG URL returned for "${icon.name}" (${icon.id}) — skipping`);
        continue;
      }

      // Download raw SVG
      const rawSvg = await downloadSvg(svgUrl);

      // Post-process: replace solid blacks with currentColor
      const patchedSvg = replaceSolidColorsWithCurrentColor(rawSvg);

      // Write raw SVG
      const rawPath = path.join(RAW_DIR, `${kebab}.svg`);
      writeTextFile(rawPath, patchedSvg);

      // SVGR transform → TypeScript React component
      const tsxCode = await transform(
        patchedSvg,
        {
          plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
          typescript: true,
          jsxRuntime: "automatic",
          svgProps: { "aria-hidden": "{true}" },
          svgoConfig: {
            plugins: [
              { name: "removeViewBox", active: false },
              { name: "removeDimensions" }
            ]
          },
          template: svgrTemplate
        },
        { componentName }
      );

      // Write TSX (flat — no subfolder per icon)
      const tsxPath = path.join(SVGR_DIR, `${componentName}.tsx`);
      writeTextFile(tsxPath, tsxCode);

      done++;
      logInfo(`  [${done}/${toProcess.length}] ${componentName}`);
    }

    logSuccess(`Written ${done} icon components`);
  }

  // 6. Regenerate barrel index
  logStep("Regenerating barrel index");
  writeBarrelIndex(figmaIcons);

  // 7. Regenerate Code Connect file
  logStep("Regenerating Figma Code Connect file");
  writeCodeConnect(figmaIcons, fileKey);

  logSuccess("Icon sync complete");
}

// ── File generators ───────────────────────────────────────────────────────

function writeBarrelIndex(figmaIcons) {
  const lines = [
    "// AUTO-GENERATED — do not edit by hand. Run `npm run icons:sync` to update.",
    ""
  ];

  const sorted = [...figmaIcons].sort((a, b) => {
    const ca = figmaNameToComponentName(a.name);
    const cb = figmaNameToComponentName(b.name);
    return ca.localeCompare(cb);
  });

  for (const icon of sorted) {
    const componentName = figmaNameToComponentName(icon.name);
    lines.push(`export { ${componentName} } from './${componentName}';`);
  }

  lines.push("");
  writeTextFile(BARREL_FILE, lines.join("\n"));
  logInfo(`Wrote ${BARREL_FILE} (${figmaIcons.length} exports)`);
}

function writeCodeConnect(figmaIcons, fileKey) {
  const sorted = [...figmaIcons].sort((a, b) => {
    const ca = figmaNameToComponentName(a.name);
    const cb = figmaNameToComponentName(b.name);
    return ca.localeCompare(cb);
  });

  const importNames = sorted.map((ic) => figmaNameToComponentName(ic.name)).join(",\n  ");

  const connections = sorted.map((icon) => {
    const componentName = figmaNameToComponentName(icon.name);
    const urlNodeId = nodeIdToUrlFormat(icon.id);
    return [
      `figma.connect(`,
      `  ${componentName},`,
      `  'https://www.figma.com/design/${fileKey}/Demo-Design-System?node-id=${urlNodeId}',`,
      `  {`,
      `    example: () => <${componentName} />,`,
      `  }`,
      `);`
    ].join("\n");
  });

  const content = [
    "/**",
    " * Figma Code Connect — Icons",
    " *",
    ` * Figma file: ${fileKey}`,
    " * Icons page node: 73065:972095",
    " *",
    " * AUTO-GENERATED — do not edit by hand. Run `npm run icons:sync` to update.",
    " * Publish with: npx figma connect publish",
    " */",
    "import figma from '@figma/code-connect';",
    "import {",
    `  ${importNames}`,
    "} from '../assets/icons/SVGR/index';",
    "",
    connections.join("\n\n"),
    ""
  ].join("\n");

  writeTextFile(CODE_CONNECT_FILE, content);
  logInfo(`Wrote ${CODE_CONNECT_FILE} (${sorted.length} connections)`);
}

// ── Run ───────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error("\n[ERROR]", err.message);
  process.exit(1);
});
