import fs from "node:fs";
import path from "node:path";

/**
 * Ensure that the directory for a given file path exists.
 * Called before any write so we never need to pre-create directories manually.
 */
export function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Write a plain-text file, creating parent directories if needed.
 */
export function writeTextFile(filePath, content) {
  ensureDirForFile(filePath);
  fs.writeFileSync(filePath, content, "utf8");
}

/**
 * Write JSON with stable 2-space indentation.
 * The trailing newline makes git diffs cleaner.
 */
export function writeJsonFile(filePath, data) {
  ensureDirForFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/**
 * Read and parse a JSON file from disk.
 */
export function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// ── Terminal output helpers ───────────────────────────────────────────────

export function logStep(message) {
  console.log(`\n[STEP] ${message}`);
}

export function logInfo(message) {
  console.log(`[INFO] ${message}`);
}

export function logWarn(message) {
  console.warn(`[WARN] ${message}`);
}

export function logSuccess(message) {
  console.log(`[OK]   ${message}`);
}

// ── Token name normalization ──────────────────────────────────────────────

/**
 * Turn a Figma variable name into a stable, code-safe slug.
 *
 * "color/background/primary" → "color-background-primary"
 * "Font Size / 14"           → "font-size-14"
 */
export function normalizeTokenName(name) {
  return String(name)
    .trim()
    .replace(/[\/\s_.]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/**
 * Normalize the WEB code syntax coming from a Figma variable.
 *
 * We strip leading "$" and "--" here so that generators can add their own
 * prefix consistently ($var for SCSS, --var for CSS).
 */
export function normalizeCodeSyntax(codeSyntax, fallbackName) {
  const raw = String(codeSyntax || fallbackName || "").trim();

  const normalized = raw
    .replace(/^\$/, "")
    .replace(/^--/, "")
    .replace(/[\/\s_.]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  // Shorten known duplicated typography segments from Figma code syntax,
  // e.g. font-size-font-size-14 -> font-size-14.
  return normalized
    .replace(/^font-size-font-size-/, "font-size-")
    .replace(/^font-weight-weight-/, "font-weight-")
    .replace(/^letter-spacing-spacing-/, "letter-spacing-")
    .replace(/^line-height-height-/, "line-height-");
}

/**
 * Escape text that will be embedded inside a CSS or SCSS comment.
 */
export function safeCommentText(value) {
  return String(value || "").replace(/\*\//g, "* /");
}

// ── Figma value type guards ───────────────────────────────────────────────

/**
 * Return true when value is a Figma color object { r, g, b, a? }.
 */
export function isFigmaColor(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.r === "number" &&
    typeof value.g === "number" &&
    typeof value.b === "number"
  );
}

/**
 * Return true when value is a Figma variable alias { type: "VARIABLE_ALIAS", id }.
 */
export function isVariableAlias(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    value.type === "VARIABLE_ALIAS" &&
    typeof value.id === "string"
  );
}

// ── Color fallback helper (used when oklch is not selected) ──────────────

function channelTo255(value) {
  return Math.round(Math.max(0, Math.min(1, value)) * 255);
}

function formatAlpha(alpha) {
  return Number(Math.max(0, Math.min(1, alpha)).toFixed(4)).toString();
}

/**
 * Convert Figma RGBA (0-1 floats) into a CSS hex or rgba() string.
 * This is the fallback when colorFormat is not "oklch".
 */
export function figmaColorToCss(color) {
  const r = channelTo255(color.r);
  const g = channelTo255(color.g);
  const b = channelTo255(color.b);
  const a = typeof color.a === "number" ? color.a : 1;

  if (a >= 0.9999) {
    const hex = [r, g, b]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("");
    return `#${hex}`;
  }

  return `rgba(${r}, ${g}, ${b}, ${formatAlpha(a)})`;
}

// ── Float unit resolution ─────────────────────────────────────────────────

/**
 * Walk the floatUnitRules array and return the first matching unit.
 * Rules are evaluated in order; the first regex match wins.
 * If no rule matches, returns "" (unitless).
 */
export function resolveFloatUnit(tokenSyntax, rules = []) {
  for (const rule of rules) {
    if (new RegExp(rule.match).test(tokenSyntax)) {
      return rule.unit ?? "";
    }
  }

  return "";
}

// ── Branch naming ─────────────────────────────────────────────────────────

/**
 * Build a YYYYMMDD-HHMMSS slug for use in sync branch names.
 */
export function getTimestampSlug() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join("");
}
