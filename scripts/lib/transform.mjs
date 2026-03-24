import {
  isFigmaColor,
  isVariableAlias,
  normalizeCodeSyntax,
  normalizeTokenName,
  resolveFloatUnit
} from "./utils.mjs";

// ── Internal helpers ──────────────────────────────────────────────────────

/**
 * Extract the WEB code syntax from a Figma variable.
 *
 * The Figma REST API can return codeSyntax as:
 *   - a plain string (older variables)
 *   - an object with platform keys like { WEB: "--token-name", iOS: "..." }
 */
function getWebCodeSyntax(variable) {
  if (!variable?.codeSyntax) {
    return null;
  }

  if (typeof variable.codeSyntax === "string") {
    return variable.codeSyntax;
  }

  return (
    variable.codeSyntax.WEB ||
    variable.codeSyntax.web ||
    variable.codeSyntax.Web ||
    null
  );
}

function roundFloatValue(value, precision = 2) {
  if (typeof value !== "number") {
    return value;
  }

  return Number(value.toFixed(precision));
}

// ── normalizeModeValue ────────────────────────────────────────────────────

/**
 * Normalize a single raw Figma variable value into a typed internal object.
 *
 * Design choice: we do NOT convert to the final CSS string here.
 * Keeping values in a strongly-typed intermediate form lets the generator
 * (generate.mjs) decide the output format (rem, %, oklch, …) without
 * having to parse strings back out.
 *
 * Output shapes:
 *
 *   Alias:   { kind: "alias",   targetVariableId: string }
 *   Color:   { kind: "color",   value: { r, g, b, a? } }
 *   Number:  { kind: "number",  value: number, unit: string }
 *   Boolean: { kind: "boolean", value: boolean }
 *   String:  { kind: "string",  value: string }
 */
function normalizeModeValue(rawValue, tokenSyntax, resolvedType, floatUnitRules) {
  // 1. Variable alias — resolved in the second pass below.
  if (isVariableAlias(rawValue)) {
    return {
      kind: "alias",
      targetVariableId: rawValue.id
    };
  }

  // 2. Color — keep raw Figma floats; generator converts to oklch / hex.
  if (isFigmaColor(rawValue)) {
    return {
      kind: "color",
      value: rawValue
    };
  }

  // 3. Float — attach the unit resolved from floatUnitRules.
  //    e.g. spacing-8 → unit "px", line-height-1250 → unit "" (unitless)
  if (resolvedType === "FLOAT" && typeof rawValue === "number") {
    const unit = resolveFloatUnit(tokenSyntax, floatUnitRules);

    return {
      kind: "number",
      value: roundFloatValue(rawValue, 2),
      unit
    };
  }

  // 4. Boolean
  if (resolvedType === "BOOLEAN" && typeof rawValue === "boolean") {
    return {
      kind: "boolean",
      value: rawValue
    };
  }

  // 5. String
  if (resolvedType === "STRING" && typeof rawValue === "string") {
    return {
      kind: "string",
      value: rawValue
    };
  }

  // 6. Fallback — stringify whatever we got.
  return {
    kind: "string",
    value: String(rawValue)
  };
}

// ── Main transform ────────────────────────────────────────────────────────

/**
 * Convert the raw Figma Variables REST API payload into a stable
 * source JSON format suitable for committing to the repository.
 *
 * Goals:
 *  - diff-friendly (sorted, deterministic)
 *  - metadata-rich (figmaName, description, scopes, …)
 *  - alias-safe across collections (ID resolved in second pass)
 *  - value-neutral (no final CSS formatting yet)
 */
export function transformFigmaVariablesToSource(payload, config) {
  const variablesMap = payload?.meta?.variables || {};
  const collectionsMap = payload?.meta?.variableCollections || {};
  const floatUnitRules = config?.floatUnitRules || [];

  // ── First pass: build collections and normalize token values ─────────

  const collections = Object.values(collectionsMap)
    // Skip collections that come from remote libraries.
    .filter((collection) => !collection.remote)
    .map((collection) => {
      const tokenIds = collection.variableIds || [];
      const modes = collection.modes || [];

      const tokens = tokenIds
        .map((variableId) => variablesMap[variableId])
        .filter(Boolean)
        .filter((variable) => !variable.remote)
        .map((variable) => {
          const fallbackSyntax = normalizeTokenName(variable.name);
          const codeSyntax = normalizeCodeSyntax(
            getWebCodeSyntax(variable),
            fallbackSyntax
          );

          const valuesByMode = {};

          for (const mode of modes) {
            const rawValue = variable.valuesByMode?.[mode.modeId];

            if (rawValue === undefined) {
              continue;
            }

            valuesByMode[mode.name] = normalizeModeValue(
              rawValue,
              codeSyntax,
              variable.resolvedType,
              floatUnitRules
            );
          }

          return {
            id: variable.id,
            figmaName: variable.name,
            codeSyntax,
            cssVar: `--${codeSyntax}`,
            scssVar: `$${codeSyntax}`,
            type: variable.resolvedType,
            description: variable.description || "",
            hiddenFromPublishing: Boolean(variable.hiddenFromPublishing),
            scopes: variable.scopes || [],
            valuesByMode
          };
        })
        // Sort by codeSyntax using natural order (numeric-aware) for stable,
        // human-friendly diffs: e.g. radius-2 comes before radius-12.
        .sort((a, b) =>
          a.codeSyntax.localeCompare(b.codeSyntax, "en", {
            numeric: true,
            sensitivity: "base"
          })
        );

      return {
        id: collection.id,
        name: collection.name,
        defaultModeId: collection.defaultModeId,
        modes: modes.map((mode) => ({
          modeId: mode.modeId,
          name: mode.name
        })),
        tokens
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // ── Second pass: enrich alias entries with targetCodeSyntax ──────────
  //
  // We need a flat index first so aliases that cross collection boundaries
  // can still be resolved.

  const tokenIndexById = new Map();

  for (const collection of collections) {
    for (const token of collection.tokens) {
      tokenIndexById.set(token.id, token);
    }
  }

  for (const collection of collections) {
    for (const token of collection.tokens) {
      for (const [modeName, modeValue] of Object.entries(token.valuesByMode)) {
        if (modeValue.kind !== "alias") {
          continue;
        }

        const target = tokenIndexById.get(modeValue.targetVariableId);

        if (!target) {
          // Unresolvable alias — mark as a string so the generator can
          // emit a visible placeholder rather than crashing.
          token.valuesByMode[modeName] = {
            kind: "string",
            value: "unresolved-alias"
          };
          continue;
        }

        // Enrich with the resolved codeSyntax so generators can output
        // $token-name or var(--token-name) without a second lookup.
        token.valuesByMode[modeName] = {
          kind: "alias",
          targetVariableId: modeValue.targetVariableId,
          targetCodeSyntax: target.codeSyntax
        };
      }
    }
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: "figma-rest-api",
    collections
  };
}

function normalizeTextStyleClassName(styleName) {
  const slug = normalizeTokenName(styleName)
    .replace(/^-+|-+$/g, "")
    .replace(/^body-body-/, "body-")
    .replace(/^heading-heading-/, "heading-");

  return slug;
}

function normalizeLetterSpacing(style) {
  if (typeof style.letterSpacing !== "number") {
    return 0;
  }

  if (style.letterSpacingUnit === "PERCENT") {
    const fontSize = typeof style.fontSize === "number" ? style.fontSize : 0;
    return (fontSize * style.letterSpacing) / 100;
  }

  return style.letterSpacing;
}

function readLineHeight(style) {
  if (style.lineHeightUnit === "PIXELS" && typeof style.lineHeightPx === "number") {
    return style.lineHeightPx;
  }

  if (style.lineHeightUnit === "FONT_SIZE_%" && typeof style.lineHeightPercentFontSize === "number") {
    const fontSize = typeof style.fontSize === "number" ? style.fontSize : 0;
    return (fontSize * style.lineHeightPercentFontSize) / 100;
  }

  if (style.lineHeightUnit === "INTRINSIC_%" && typeof style.lineHeightPercent === "number") {
    const fontSize = typeof style.fontSize === "number" ? style.fontSize : 0;
    return (fontSize * style.lineHeightPercent) / 100;
  }

  return null;
}

/**
 * Transform Figma TEXT styles into normalized typography style definitions.
 *
 * Output entries are later translated into reusable CSS utility classes.
 */
export function transformFigmaTextStylesToSource(stylesPayload, nodesPayload) {
  const styles = stylesPayload?.meta?.styles || [];
  const nodesMap = nodesPayload?.nodes || {};
  const textStyles = [];

  for (const styleMeta of styles) {
    if (styleMeta.style_type !== "TEXT") {
      continue;
    }

    const nodeData = nodesMap[styleMeta.node_id];
    const style = nodeData?.document?.style;

    if (!style) {
      continue;
    }

    const fontFamily = style.fontFamily || "";
    const fontSize = typeof style.fontSize === "number" ? style.fontSize : null;
    const fontWeight = typeof style.fontWeight === "number" ? style.fontWeight : null;
    const lineHeightPx = readLineHeight(style);
    const letterSpacingPx = normalizeLetterSpacing(style);

    if (!fontFamily || fontSize === null || fontWeight === null || lineHeightPx === null) {
      continue;
    }

    textStyles.push({
      id: styleMeta.key || styleMeta.node_id,
      figmaName: styleMeta.name,
      className: normalizeTextStyleClassName(styleMeta.name),
      description: styleMeta.description || "",
      values: {
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight: lineHeightPx,
        letterSpacing: letterSpacingPx
      }
    });
  }

  return textStyles.sort((a, b) =>
    a.figmaName.localeCompare(b.figmaName, "en", {
      numeric: true,
      sensitivity: "base"
    })
  );
}

/**
 * Transform Figma Style metadata + Node details into a "Shadows" collection
 * of shadow tokens compatible with the variables schema.
 *
 * Receives:
 *   - stylesPayload: from /v1/files/{fileKey}/styles endpoint (metadata only)
 *   - nodesPayload: from /v1/files/{fileKey}/nodes endpoint (effect details)
 *
 * Figma effect styles are converted to CSS box-shadow string values.
 * Both DROP_SHADOW and INNER_SHADOW effects are extracted.
 */
export function transformFigmaStylesToSource(stylesPayload, nodesPayload) {
  const roundToTwoDecimals = (value) =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;

  const formatShadowNumber = (value) => {
    const rounded = roundToTwoDecimals(value);
    if (Number.isInteger(rounded)) {
      return String(rounded);
    }

    return rounded.toFixed(2).replace(/\.?0+$/, "");
  };

  const styles = stylesPayload?.meta?.styles || [];
  const nodesMap = nodesPayload?.nodes || {};
  const shadowTokens = [];

  // Process each EFFECT style: fetch its node details and extract shadows
  for (const style of styles) {
    // Filter to EFFECT styles only
    if (style.style_type !== "EFFECT") {
      continue;
    }

    const nodeId = style.node_id;
    const nodeData = nodesMap[nodeId];

    if (!nodeData) {
      console.warn(
        `[warning] No node data found for style: "${style.name}" (node ID: ${nodeId})`
      );
      continue;
    }

    // Effects are stored inside the document property of the node response
    const effects = nodeData?.document?.effects || [];

    // Convert DROP_SHADOW and INNER_SHADOW effects to CSS box-shadow syntax
    const shadows = effects
      .filter((e) => e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW")
      .map((effect) => {
        const offsetX = formatShadowNumber(effect.offset?.x || 0);
        const offsetY = formatShadowNumber(effect.offset?.y || 0);
        const blur = formatShadowNumber(effect.radius || 0);
        const spread = formatShadowNumber(effect.spread || 0);
        const color = effect.color || { r: 0, g: 0, b: 0, a: 1 };

        // Convert Figma color (0-1 float) to RGB (0-255)
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        const a =
          typeof color.a === "number"
            ? formatShadowNumber(color.a)
            : "1";

        const colorStr =
          a < 1
            ? `rgba(${r}, ${g}, ${b}, ${a})`
            : `rgb(${r}, ${g}, ${b})`;
        const inset = effect.type === "INNER_SHADOW" ? "inset " : "";

        return `${inset}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${colorStr}`;
      })
      .join(", ");

    // Only create a token if we found actual shadows
    if (!shadows || shadows.trim() === "") {
      continue;
    }

    // Extract a clean token name from the Figma style name
    // e.g. "Shadow-1" → "shadow-1", "Shadow/Light" → "shadow-light"
    const cleanName = style.name
      .toLowerCase()
      .replace(/[/\s]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    shadowTokens.push({
      figmaName: style.name,
      codeSyntax: cleanName,
      cssVar: `--${cleanName}`,
      scssVar: `$${cleanName}`,
      type: "STRING",
      description: style.description || "",
      hiddenFromPublishing: Boolean(style.hiddenFromPublishing),
      scopes: ["SHADOW"],
      valuesByMode: {
        Default: {
          kind: "string",
          value: shadows
        }
      }
    });
  }

  // Return as a complete collection if any shadows found
  if (shadowTokens.length === 0) {
    return null;
  }

  return {
    id: "ShadowsCollection",
    name: "Shadows",
    defaultModeId: "default",
    modes: [
      {
        modeId: "default",
        name: "Default"
      }
    ],
    tokens: shadowTokens.sort((a, b) =>
      a.codeSyntax.localeCompare(b.codeSyntax, "en", {
        numeric: true,
        sensitivity: "base"
      })
    )
  };
}
