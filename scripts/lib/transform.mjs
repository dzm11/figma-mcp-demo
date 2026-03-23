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
      value: rawValue,
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
