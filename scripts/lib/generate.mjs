import { figmaColorToCss, safeCommentText } from "./utils.mjs";

// ── Formatting helpers ────────────────────────────────────────────────────

/**
 * Round a float to keep generated CSS values readable and stable across runs.
 */
function round(value, precision = 4) {
  return Number(value.toFixed(precision));
}

/**
 * Convert a px value to rem using the configured base font size.
 * e.g. 14px at 16px base → 0.875rem
 */
function pxToRem(px, baseFontSizePx = 16) {
  return `${round(px / baseFontSizePx)}rem`;
}

/**
 * Linearise a single sRGB channel (0-1) before converting to OKLCH.
 * Uses the standard IEC 61966-2-1 transfer function.
 */
function srgbToLinear(channel) {
  if (channel <= 0.04045) {
    return channel / 12.92;
  }

  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

/**
 * Convert a Figma RGB(A) color object into an oklch() CSS string.
 *
 * Matrix coefficients follow the OKLab / OKLCH specification:
 *   https://bottosson.github.io/posts/oklab/
 *
 * Alpha is omitted when it is exactly 1 (shorter CSS, better diff).
 */
function figmaColorToOklch(color) {
  // Step 1 — linearise sRGB channels.
  const r = srgbToLinear(color.r);
  const g = srgbToLinear(color.g);
  const b = srgbToLinear(color.b);

  // Step 2 — linear RGB → LMS (cone response).
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  // Step 3 — cube-root compression.
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  // Step 4 — LMS' → OKLab (L, a, b).
  const L = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const a = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const b2 = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;

  // Step 5 — OKLab → OKLCH (chroma + hue).
  const C = Math.sqrt(a * a + b2 * b2);
  let h = Math.atan2(b2, a) * (180 / Math.PI);

  if (h < 0) {
    h += 360;
  }

  const alpha = typeof color.a === "number" ? color.a : 1;

  if (alpha < 1) {
    return `oklch(${round(L * 100, 2)}% ${round(C, 4)} ${round(h, 2)} / ${round(alpha, 4)})`;
  }

  return `oklch(${round(L * 100, 2)}% ${round(C, 4)} ${round(h, 2)})`;
}

// ── Literal value formatter ───────────────────────────────────────────────

/**
 * Convert a typed normalised modeValue into its final CSS/SCSS string.
 *
 * This is the single place where output format is decided:
 *  - Colors  → oklch() when colorFormat = "oklch", else #hex / rgba()
 *  - Numbers → rem when dimensionFormat = "rem" and unit is "px"
 *  - Line-height → emitted as-is from tokens (preserve value and unit)
 *  - Booleans / Strings → passed through as-is
 */
function formatLiteralValue(token, modeValue, config) {
  const formatting = config?.valueFormatting || {};
  const baseFontSizePx = formatting.baseFontSizePx || 16;
  const colorFormat = formatting.colorFormat || "hex";
  const dimensionFormat = formatting.dimensionFormat || "px";

  if (!modeValue) {
    return "null";
  }

  if (modeValue.kind === "color") {
    if (colorFormat === "oklch") {
      return figmaColorToOklch(modeValue.value);
    }

    // Fallback: hex / rgba via the shared utility.
    return figmaColorToCss(modeValue.value);
  }

  if (modeValue.kind === "number") {
    const isLineHeight = /^line-height-/.test(token.codeSyntax);
    const isBorderSize = /^border-(radius|weight|width)-/.test(token.codeSyntax);
    const isLetterSpacing = /^letter-spacing-/.test(token.codeSyntax);

    // Keep line-height values as defined in tokens (no rem/percent conversion).
    if (isLineHeight) {
      return `${modeValue.value}${modeValue.unit || ""}`;
    }

    // Keep border size tokens in px to avoid downstream unit math in components.
    if (isBorderSize && modeValue.unit === "px") {
      return `${modeValue.value}px`;
    }

    // Keep letter-spacing in px to match typography token usage in components.
    if (isLetterSpacing && modeValue.unit === "px") {
      return `${modeValue.value}px`;
    }

    // Dimension values (spacing, radius, font-size, …) — convert px → rem.
    if (modeValue.unit === "px" && dimensionFormat === "rem") {
      return pxToRem(modeValue.value, baseFontSizePx);
    }

    // Unitless or other units (opacity, z-index) — pass through as-is.
    return `${modeValue.value}${modeValue.unit || ""}`;
  }

  if (modeValue.kind === "boolean") {
    return modeValue.value ? "true" : "false";
  }

  if (modeValue.kind === "string") {
    return modeValue.value;
  }

  return "null";
}

// ── SCSS alias / literal helpers ──────────────────────────────────────────

/**
 * Render a token value as an SCSS value.
 * Aliases become $variable-name; literals go through formatLiteralValue.
 */
function toScssValue(token, modeValue, config) {
  if (!modeValue) {
    return "null";
  }

  if (modeValue.kind === "alias") {
    return `$${modeValue.targetCodeSyntax}`;
  }

  return formatLiteralValue(token, modeValue, config);
}

/**
 * Render a token value as a CSS custom property value.
 * Aliases become var(--variable-name); literals go through formatLiteralValue.
 */
function toCssValue(token, modeValue, config) {
  if (!modeValue) {
    return "initial";
  }

  if (modeValue.kind === "alias") {
    return `var(--${modeValue.targetCodeSyntax})`;
  }

  return formatLiteralValue(token, modeValue, config);
}

function toShortTypographyName(name) {
  return String(name || "")
    .replace(/^font-size-font-size-/, "font-size-")
    .replace(/^font-weight-weight-/, "font-weight-")
    .replace(/^letter-spacing-spacing-/, "letter-spacing-")
    .replace(/^line-height-height-/, "line-height-");
}

function mapCollectionToShortNames(collection) {
  return {
    ...collection,
    tokens: (collection.tokens || []).map((token) => {
      const nextCodeSyntax = toShortTypographyName(token.codeSyntax);
      const nextValuesByMode = {};

      for (const [modeName, modeValue] of Object.entries(token.valuesByMode || {})) {
        if (modeValue?.kind === "alias") {
          nextValuesByMode[modeName] = {
            ...modeValue,
            targetCodeSyntax: toShortTypographyName(modeValue.targetCodeSyntax)
          };
        } else {
          nextValuesByMode[modeName] = modeValue;
        }
      }

      return {
        ...token,
        codeSyntax: nextCodeSyntax,
        cssVar: `--${nextCodeSyntax}`,
        scssVar: `$${nextCodeSyntax}`,
        valuesByMode: nextValuesByMode
      };
    })
  };
}

/**
 * Emit legacy typography aliases so existing component styles keep working
 * while the project gradually migrates to the new generated token names.
 */
function buildLegacyTypographyAliases(tokenNames) {
  const aliases = [];

  const addAlias = (legacyName, sourceName) => {
    if (legacyName !== sourceName && tokenNames.has(sourceName)) {
      aliases.push(`  --${legacyName}: var(--${sourceName});`);
    }
  };

  const typographyPatterns = [
    {
      short: /^font-size-(?!font-size-)(.+)$/,
      longTemplate: "font-size-font-size-$1"
    },
    {
      short: /^font-weight-(?!weight-)(.+)$/,
      longTemplate: "font-weight-weight-$1"
    },
    {
      short: /^line-height-(?!height-)(.+)$/,
      longTemplate: "line-height-height-$1"
    },
    {
      short: /^letter-spacing-(?!spacing-)(.+)$/,
      longTemplate: "letter-spacing-spacing-$1"
    }
  ];

  for (const tokenName of tokenNames) {
    for (const pattern of typographyPatterns) {
      const shortMatch = tokenName.match(pattern.short);
      if (shortMatch) {
        const longName = pattern.longTemplate.replace("$1", shortMatch[1]);
        addAlias(longName, tokenName);
      }
    }
  }

  return aliases;
}

// ── Topological sort ──────────────────────────────────────────────────────

/**
 * Sort a list of tokens so that if token B is an alias of token A,
 * A appears before B. This is important for SCSS where $var must be
 * declared before it is referenced.
 *
 * Uses iterative DFS to avoid stack overflow on large token sets.
 */
function sortTokensForScss(tokens, modeName) {
  const tokenMap = new Map(tokens.map((t) => [t.codeSyntax, t]));
  const visited = new Set();
  const visiting = new Set();
  const result = [];

  function visit(token) {
    if (visited.has(token.codeSyntax)) {
      return;
    }

    // Guard against circular aliases.
    if (visiting.has(token.codeSyntax)) {
      return;
    }

    visiting.add(token.codeSyntax);

    const modeValue = token.valuesByMode?.[modeName];

    if (modeValue?.kind === "alias" && modeValue.targetCodeSyntax) {
      const target = tokenMap.get(modeValue.targetCodeSyntax);

      if (target) {
        visit(target);
      }
    }

    visiting.delete(token.codeSyntax);
    visited.add(token.codeSyntax);
    result.push(token);
  }

  for (const token of tokens) {
    visit(token);
  }

  return result;
}

// ── Collection mode helpers ───────────────────────────────────────────────

/**
 * Pick the mode name to use when building the SCSS fallback variables.
 * Uses the explicit mapping from config; falls back to the first mode.
 */
function getDefaultModeForCollection(collection, config) {
  const explicit = config?.defaultCollectionMode?.[collection.name];

  if (explicit) {
    return explicit;
  }

  return collection.modes?.[0]?.name || "Default";
}

// ── Public builders ───────────────────────────────────────────────────────

/**
 * Build internal SCSS variables file.
 *
 * This file uses the configured default mode and emits topologically-sorted
 * $variable declarations.  It is an internal artifact — the app consumes
 * src/styles/tokens.css, not this SCSS file.
 */
export function buildScss(sourceJson, config) {
  const lines = [];
  const collections = (sourceJson.collections || []).map(mapCollectionToShortNames);

  lines.push("// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.");
  lines.push("// Source: Figma Variables REST API");
  lines.push("// Run `npm run tokens:build` to regenerate.");
  lines.push("");

  for (const collection of collections) {
    const defaultModeName = getDefaultModeForCollection(collection, config);
    const sortedTokens = sortTokensForScss(collection.tokens, defaultModeName);

    lines.push(`// ── Collection: ${collection.name} (mode: ${defaultModeName}) ──`);
    lines.push("");

    for (const token of sortedTokens) {
      const description = safeCommentText(token.description || "No description");
      const value = toScssValue(token, token.valuesByMode?.[defaultModeName], config);

      lines.push(`// ${token.figmaName}`);
      lines.push(`// ${description}`);
      lines.push(`$${token.codeSyntax}: ${value};`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Build the final application-facing CSS token file.
 *
 * Each Figma collection × mode pair becomes a CSS selector block.
 * The selector is resolved from cssSelectorByModeName in the config,
 * defaulting to [data-theme="<mode>"].
 *
 * Token values go through toCssValue which applies:
 *  - rem conversion for dimensions
 *  - oklch for colors
 *  - passthrough for line-heights
 *  - var(--x) for aliases
 *
 * This output overwrites src/styles/tokens.css (the final app-facing file).
 */
export function buildCss(sourceJson, config) {
  const lines = [];
  const collections = (sourceJson.collections || []).map(mapCollectionToShortNames);

  lines.push("/* AUTO-GENERATED FILE. DO NOT EDIT MANUALLY. */");
  lines.push("/* Source: Figma Variables REST API              */");
  lines.push("/* Run `npm run tokens:build` to regenerate.    */");
  lines.push("");

  for (const collection of collections) {
    // Typography tokens are emitted in typography.css together with
    // typography utility classes to keep all text primitives in one place.
    if (collection.name === "Typography") {
      continue;
    }

    lines.push(`/* ── Collection: ${collection.name} ───────────────────────────── */`);
    lines.push("");

    for (const mode of collection.modes) {
      // Resolve the CSS selector for this mode.
      const selector =
        config?.cssSelectorByModeName?.[mode.name] ||
        `[data-theme="${mode.name.toLowerCase()}"]`;

      lines.push(`${selector} {`);

      // Topological sort ensures aliases are emitted after their targets.
      const sortedTokens = sortTokensForScss(collection.tokens, mode.name);

      for (const token of sortedTokens) {
        if (collection.name === "Tokens") {
          const description = safeCommentText(token.description || "No description");
          lines.push(`  /* ${token.figmaName} — ${description} */`);
        }

        const value = toCssValue(token, token.valuesByMode?.[mode.name], config);
        lines.push(`  --${token.codeSyntax}: ${value};`);
      }

      // Temporary compatibility layer for pre-migration component CSS.
      const tokenNameSet = new Set(sortedTokens.map((token) => token.codeSyntax));
      const legacyAliases = buildLegacyTypographyAliases(tokenNameSet);
      if (legacyAliases.length > 0) {
        lines.push("");
        lines.push("  /* Legacy typography aliases (backward compatibility) */");
        lines.push(...legacyAliases);
      }

      lines.push("}");
      lines.push("");
    }
  }

  return lines.join("\n");
}

function toNumberKey(value) {
  return String(round(Number(value), 4));
}

function normalizeFontFamily(value) {
  return String(value || "")
    .replace(/["']/g, "")
    .trim()
    .toLowerCase();
}

function buildTypographyTokenIndexes(sourceJson, config) {
  const collections = (sourceJson.collections || []).map(mapCollectionToShortNames);
  const tokenMap = new Map();

  for (const collection of collections) {
    for (const token of collection.tokens || []) {
      tokenMap.set(token.codeSyntax, token);
    }
  }

  function resolveModeValue(token, modeName, seen = new Set()) {
    if (!token || seen.has(token.codeSyntax)) {
      return null;
    }

    const modeValue = token.valuesByMode?.[modeName] || null;
    if (!modeValue) {
      return null;
    }

    if (modeValue.kind !== "alias") {
      return modeValue;
    }

    const targetSyntax = modeValue.targetCodeSyntax;
    const target = tokenMap.get(targetSyntax);
    seen.add(token.codeSyntax);
    return resolveModeValue(target, modeName, seen);
  }

  const byFamily = new Map();
  const bySize = new Map();
  const byWeight = new Map();
  const byLineHeight = new Map();
  const byLetterSpacing = new Map();

  for (const collection of collections) {
    const modeName = getDefaultModeForCollection(collection, config);

    for (const token of collection.tokens || []) {
      const resolved = resolveModeValue(token, modeName);
      if (!resolved) {
        continue;
      }

      if (token.codeSyntax.startsWith("font-family-") && resolved.kind === "string") {
        const key = normalizeFontFamily(resolved.value);
        if (!byFamily.has(key)) {
          byFamily.set(key, []);
        }
        byFamily.get(key).push(token.codeSyntax);
      }

      if (token.codeSyntax.startsWith("font-size-") && resolved.kind === "number") {
        bySize.set(toNumberKey(resolved.value), token.codeSyntax);
      }

      if (token.codeSyntax.startsWith("font-weight-") && resolved.kind === "number") {
        byWeight.set(toNumberKey(resolved.value), token.codeSyntax);
      }

      if (token.codeSyntax.startsWith("line-height-") && resolved.kind === "number") {
        byLineHeight.set(toNumberKey(resolved.value), token.codeSyntax);
      }

      if (token.codeSyntax.startsWith("letter-spacing-") && resolved.kind === "number") {
        byLetterSpacing.set(toNumberKey(resolved.value), token.codeSyntax);
      }
    }
  }

  return { byFamily, bySize, byWeight, byLineHeight, byLetterSpacing };
}

function pickFontFamilyToken(figmaStyleName, familyCandidates = []) {
  if (familyCandidates.length === 0) {
    return null;
  }

  const lowerName = String(figmaStyleName || "").toLowerCase();

  if (lowerName.startsWith("body/")) {
    return (
      familyCandidates.find((name) => name === "font-family-body") ||
      familyCandidates[0]
    );
  }

  if (lowerName.startsWith("heading/")) {
    return (
      familyCandidates.find((name) => name === "font-family-heading") ||
      familyCandidates[0]
    );
  }

  return familyCandidates[0];
}

function buildTypographyCollectionCss(sourceJson, config) {
  const lines = [];
  const collections = (sourceJson.collections || []).map(mapCollectionToShortNames);
  const typographyCollection = collections.find(
    (collection) => collection.name === "Typography"
  );

  if (!typographyCollection) {
    return lines;
  }

  lines.push("/* ── Collection: Typography ───────────────────────────── */");
  lines.push("");

  for (const mode of typographyCollection.modes || []) {
    const selector =
      config?.cssSelectorByModeName?.[mode.name] ||
      `[data-theme="${mode.name.toLowerCase()}"]`;

    lines.push(`${selector} {`);

    const sortedTokens = sortTokensForScss(typographyCollection.tokens, mode.name);

    for (const token of sortedTokens) {
      const value = toCssValue(token, token.valuesByMode?.[mode.name], config);
      lines.push(`  --${token.codeSyntax}: ${value};`);
    }

    const tokenNameSet = new Set(sortedTokens.map((token) => token.codeSyntax));
    const legacyAliases = buildLegacyTypographyAliases(tokenNameSet);
    if (legacyAliases.length > 0) {
      lines.push("");
      lines.push("  /* Legacy typography aliases (backward compatibility) */");
      lines.push(...legacyAliases);
    }

    lines.push("}");
    lines.push("");
  }

  return lines;
}

function buildTextSizingUtilityCss() {
  const lines = [];

  lines.push("/* Shared text-adjacent sizing utilities */");
  lines.push(".text-inline-center {");
  lines.push("  display: inline-flex;");
  lines.push("  align-items: center;");
  lines.push("  justify-content: center;");
  lines.push("  flex-shrink: 0;");
  lines.push("}");
  lines.push("");

  lines.push(".text-size-16 {");
  lines.push("  width: var(--w-16);");
  lines.push("  height: var(--h-16);");
  lines.push("}");
  lines.push("");

  lines.push(".text-size-20 {");
  lines.push("  width: var(--w-20);");
  lines.push("  height: var(--h-20);");
  lines.push("}");
  lines.push("");

  lines.push(".text-slot-16 {");
  lines.push("  display: inline-flex;");
  lines.push("  align-items: center;");
  lines.push("  justify-content: center;");
  lines.push("  flex-shrink: 0;");
  lines.push("  width: var(--w-16);");
  lines.push("  height: var(--h-16);");
  lines.push("}");
  lines.push("");

  lines.push(".text-slot-20 {");
  lines.push("  display: inline-flex;");
  lines.push("  align-items: center;");
  lines.push("  justify-content: center;");
  lines.push("  flex-shrink: 0;");
  lines.push("  width: var(--w-20);");
  lines.push("  height: var(--h-20);");
  lines.push("}");
  lines.push("");

  return lines;
}

/**
 * Build reusable typography utility classes generated from Figma TEXT styles.
 *
 * Classes use token variables when a matching token exists. If no token matches
 * a value, a literal fallback is emitted to keep class coverage complete.
 */
export function buildTypographyCss(sourceJson, config) {
  const lines = [];
  const textStyles = sourceJson.textStyles || [];
  const indexes = buildTypographyTokenIndexes(sourceJson, config);

  lines.push("/* AUTO-GENERATED FILE. DO NOT EDIT MANUALLY. */");
  lines.push("/* Source: Figma Typography + Text Styles REST API */");
  lines.push("/* Run `npm run tokens:build` to regenerate.      */");
  lines.push("");

  lines.push(...buildTypographyCollectionCss(sourceJson, config));
  lines.push(...buildTextSizingUtilityCss());

  if (textStyles.length === 0) {
    lines.push("/* No typography styles found in source JSON. */");
    lines.push("");
    return lines.join("\n");
  }

  for (const style of textStyles) {
    const values = style.values || {};
    const familyToken = pickFontFamilyToken(
      style.figmaName,
      indexes.byFamily.get(normalizeFontFamily(values.fontFamily)) || []
    );
    const sizeToken = indexes.bySize.get(toNumberKey(values.fontSize));
    const weightToken = indexes.byWeight.get(toNumberKey(values.fontWeight));
    const lineHeightToken = indexes.byLineHeight.get(toNumberKey(values.lineHeight));
    const letterSpacingToken = indexes.byLetterSpacing.get(toNumberKey(values.letterSpacing));

    lines.push(`/* ${style.figmaName} */`);
    lines.push(`.${style.className} {`);

    if (familyToken) {
      lines.push(`  font-family: var(--${familyToken});`);
    } else {
      lines.push(`  font-family: ${values.fontFamily};`);
    }

    if (sizeToken) {
      lines.push(`  font-size: var(--${sizeToken});`);
    } else {
      lines.push(`  font-size: ${values.fontSize}px;`);
    }

    if (weightToken) {
      lines.push(`  font-weight: var(--${weightToken});`);
    } else {
      lines.push(`  font-weight: ${values.fontWeight};`);
    }

    if (lineHeightToken) {
      lines.push(`  line-height: var(--${lineHeightToken});`);
    } else {
      lines.push(`  line-height: ${values.lineHeight}px;`);
    }

    if (letterSpacingToken) {
      lines.push(`  letter-spacing: var(--${letterSpacingToken});`);
    } else {
      lines.push(`  letter-spacing: ${values.letterSpacing}px;`);
    }

    lines.push("}");
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Return a small summary for logging and PR descriptions.
 */
export function buildSummary(sourceJson) {
  const tokenCount = sourceJson.collections.reduce(
    (sum, collection) => sum + collection.tokens.length,
    0
  );

  return {
    collectionCount: sourceJson.collections.length,
    tokenCount
  };
}
