# Figma Design System Rules for figma-mcp-demo

This document outlines the design system structure and integration guidelines for the figma-mcp-demo repository, which uses React and TypeScript with Vite.

> **Figma file key:** `H3scHHO8gzcKecmO2Sa9aN`

---

## 1. Token Definitions

> **RULE: Never use hardcoded color, spacing, radius or typography values in CSS. You MUST use only the CSS custom properties listed below.**

All design tokens are sourced from the Figma file `H3scHHO8gzcKecmO2Sa9aN` and defined as CSS custom properties in `src/styles/tokens.css`. This file is imported globally via `src/index.css` and in `.storybook/preview.ts`.

### Colors — Main

| CSS Custom Property        | Value     | Figma Variable         |
|----------------------------|-----------|------------------------|
| `--color-surface-white`    | `#ffffff` | `surfaces/surface`     |
| `--color-main-primary`     | `#3d67ff` | `main/primary`         |
| `--color-main-on-primary`  | `#ffffff` | `main/on-primary`      |

### Colors — State (interactive)

| CSS Custom Property                | Value     | Figma Variable               |
|------------------------------------|-----------|------------------------------|
| `--color-state-primary-hover`      | `#3255d4` | `state/primary-hover`        |
| `--color-state-primary-active`     | `#2844aa` | `state/primary-active`       |
| `--color-state-primary-disabled`   | `#9eb3ff` | `state/primary-disabled`     |
| `--color-state-on-surface-hover`   | `#4d5a75` | `state/on-surface-hover`     |
| `--color-state-on-surface-active`  | `#252b37` | `state/on-surface-active`    |
| `--color-state-on-surface-disabled`| `#a3adc2` | `state/on-surface-disabled`  |

### Colors — Surfaces

| CSS Custom Property              | Value     | Figma Variable                      |
|----------------------------------|-----------|-------------------------------------|
| `--color-surface-container-low`  | `#f6f7f9` | `elevation/surface-container-low`   |
| `--color-surface-container`      | `#edeff2` | `elevation/surface-container`       |
| `--color-surface-container-high` | `#e2e4e9` | `elevation/surface-container-high`  |
| `--color-surface-on-surface-weak`| `#4d5a75` | `surfaces/on-surface-weak`          |

### Colors — Outline

| CSS Custom Property              | Value     | Figma Variable                  |
|----------------------------------|-----------|---------------------------------|
| `--color-outline`                | `#4d5a75` | `outline/outline`               |
| `--color-outline-hover`          | `#252b37` | `outline/outline-hover`         |
| `--color-outline-variant`        | `#d7dae1` | `outline/outline-variant`       |
| `--color-outline-variant-hover`  | `#b1bacb` | `outline/outline-variant-hover` |
| `--color-outline-variant-active` | `#a3adc2` | `outline/outline-variant-active`|
| `--color-outline-variant-disabled`| `#d7dae1`| `outline/outline-variant-disabled`|
| `--color-outline-focused`        | `#3255d4` | `outline/outline-focused`       |

### Colors — Status

| CSS Custom Property         | Value     | Figma Variable             |
|-----------------------------|-----------|----------------------------|
| `--color-critical`          | `#e5484d` | `system/critical`          |
| `--color-on-critical`       | `#fff0f0` | `system/on-critical`       |
| `--color-critical-container`| `#ffd6d6` | `system/critical-container`|

### Spacing

| CSS Custom Property | Value  | Figma Variable     |
|---------------------|--------|--------------------|
| `--spacing-0`       | `0px`  | `spacing/space-0`  |
| `--spacing-4`       | `4px`  | `spacing/space-4`  |
| `--spacing-6`       | `6px`  | `spacing/space-6`  |
| `--spacing-8`       | `8px`  | `spacing/space-8`  |
| `--spacing-12`      | `12px` | `spacing/space-12` |

### Border Radius

| CSS Custom Property | Value   | Figma Variable      |
|---------------------|---------|---------------------|
| `--radius-2`        | `2px`   | `border/radius-2`   |
| `--radius-4`        | `4px`   | `border/radius-4`   |
| `--radius-full`     | `999px` | `border/radius-full`|

### Typography

| CSS Custom Property       | Value              | Figma Variable                   |
|---------------------------|--------------------|----------------------------------|
| `--font-family-body`      | `'Inter', sans-serif` | `font-family/body`            |
| `--font-size-14`          | `14px`             | `font-size/font-size-14`         |
| `--font-weight-regular`   | `400`              | `font-weight/weight-regular`     |
| `--font-weight-bold`      | `700`              | `font-weight/weight-bold`        |
| `--line-height-1250`      | `20px`             | `line-height/height-1250`        |
| `--letter-spacing-normal` | `0px`              | `letter-spacing/spacing-normal`  |

### Composite Typography Scale

| Figma Style              | CSS equivalent                                                                           |
|--------------------------|------------------------------------------------------------------------------------------|
| `Body/body-md-14/regular`| `font-family: var(--font-family-body); font-size: var(--font-size-14); font-weight: var(--font-weight-regular); line-height: var(--line-height-1250); letter-spacing: var(--letter-spacing-normal);` |

---

## 2. Component Library

- **Location**: `src/components/` — one subfolder per component
- **Architecture**: Functional React components (`React.FC`) with TypeScript props interfaces, CSS Modules for styling
- **Documentation**: Storybook stories (`.stories.tsx`) per component

### Component Folder Structure

Each component is split across **three dedicated folders**:

```
src/
  components/
    Button/
      Button.tsx          ← React component
      Button.types.ts     ← TypeScript props interface
      Button.module.css   ← Scoped styles (tokens only, no hardcoded values)
    Checkbox/
      Checkbox.tsx
      Checkbox.types.ts
      Checkbox.module.css

  stories/                ← all Storybook stories (one file per component)
    Button.stories.tsx
    Checkbox.stories.tsx
    InlineError.stories.tsx
    Label.stories.tsx

  figma/                  ← all Figma Code Connect files (one file per component)
    Button.figma.tsx
    Checkbox.figma.tsx
    InlineError.figma.tsx
    Label.figma.tsx
```

- **`stories/`** files import via `'../components/ComponentName/ComponentName'`
- **`figma/`** files use `@figma/code-connect` and are published via `npx figma connect publish`

### Component Pattern (Button example)

```tsx
// src/components/Button/Button.tsx
import React from 'react';
import styles from './Button.module.css';
import type { ButtonProps } from './Button.types.ts';

export const Button: React.FC<ButtonProps> = ({
  type = 'primary',
  size = 'm',
  state = 'default',
  disclosure = false,
  icon,
  children,
  onClick,
}) => {
  const isDisabled = state === 'disabled';
  const isLoading = state === 'loading';
  const isCritical = state === 'critical';

  return (
    <button
      aria-busy={isLoading}
      className={[
        styles.button,
        'body-md-14-bold',
        styles[`type-${type}`],
        styles[`size-${size}`],
        isLoading && styles.loading,
        isCritical && styles.critical,
      ].filter(Boolean).join(' ')}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      type="button"
    >
      {icon && <span aria-hidden="true" className={[styles.iconSlot, 'text-slot-20'].filter(Boolean).join(' ')}>{icon}</span>}
      <span className={styles.textSlot}>{children}</span>
      {disclosure && <span aria-hidden="true" className={[styles.disclosureSlot, 'text-slot-20'].filter(Boolean).join(' ')}><ChevronDown /></span>}
    </button>
  );
};
```

### CSS Module Pattern — tokens only, no hardcoded values

```css
/* src/components/Button/Button.module.css */
/* Typography is NOT declared here — apply 'body-md-14-bold' global class in JSX */
.button {
  border-radius: var(--border-radius-full);
}

.type-primary {
  background-color: var(--main-primary);
  color: var(--main-on-primary);
}

.type-primary:hover:not(:disabled) { background-color: var(--state-primary-hover); }
.type-primary:active:not(:disabled) { background-color: var(--state-primary-active); }
.type-primary:focus-visible:not(:disabled) {
  box-shadow: 0 0 0 var(--border-weight-2) var(--main-on-primary), 0 0 0 var(--border-weight-4) var(--outline-outline-focused);
}
.type-primary:disabled { background-color: var(--state-primary-disabled); cursor: not-allowed; }
```

---

## 3. Frameworks & Libraries

| Concern               | Technology                        | Version     |
|-----------------------|-----------------------------------|-------------|
| UI Framework          | React                             | 19.2.0      |
| Language              | TypeScript                        | 5.9.3       |
| Build / Dev Server    | Vite + `@vitejs/plugin-react`     | 7.3.1       |
| Styling               | CSS Modules (`.module.css`)       | —           |
| Component Docs        | Storybook (`@storybook/react-vite`)| 10.2.16    |
| Unit / Browser Tests  | Vitest + Playwright               | 4.0.18      |
| Visual Regression     | Chromatic (`@chromatic-com/storybook`) | 5.0.1  |
| Accessibility Audit   | `@storybook/addon-a11y`           | 10.2.16     |

---

## Storybook Convention (Permanent)

Use this convention for all current and future component stories in `src/stories/`:

- Left sidebar should contain only **main component types** (for example: `Primary`, `Outlined`, `Secondary`, `Tertiary`).
- Do **not** add separate stories for states or combinations (for example: `Disabled`, `Loading`, `Focused`, `Critical`, `AllStates`, `WithSubtext`).
- States and additional props must be explored through **Controls** inside each type story.
- If a component has no `type` prop, keep a single `Default` story and expose variants through Controls.

This rule is required to keep Storybook navigation compact and consistent.
| Linting               | ESLint 9 + `typescript-eslint`    | 9.39.1      |

---

## 4. Asset Management

- **Static assets** (images, fonts) used in components: `src/assets/` — imported with `import logo from './assets/logo.svg'`
- **Public assets** (favicons, OG images): `public/` — referenced as `/filename.ext`
- No CDN configuration; assets are bundled by Vite

---

## 5. Icon System

- **Format**: Inline SVG in JSX — no icon library, no sprite sheets
- **Size**: `20×20px` for action icons (matches Figma icon slot); `16×16px` for inline/decorative icons inside components (e.g. Checkbox tick)
- **Color**: Always use `stroke="currentColor"` or `fill="currentColor"` so icons inherit the component's text color automatically
- **Naming**: Descriptive PascalCase inline components, e.g. `ChevronDown`, `CheckIcon`, `ErrorIcon`
- **Accessibility**: Always add `aria-hidden="true"` on the wrapping `<span>` or directly on the `<svg>` when decorative

```tsx
/** Inline icon pattern */
const ChevronDown = () => (
  <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor"
      strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);
```

---

## 6. Styling Approach

- **Methodology**: CSS Modules — one `.module.css` file per component, scoped class names
- **Token files** (auto-generated by `npm run tokens:build` — never edit manually):
  - `src/styles/tokens.css` — colors, spacing, border, shadows
  - `src/styles/typography.css` — typography tokens, text-style utility classes, sizing utility classes
- **Global styles**: `src/index.css` — imports both token files and base body reset
- **Storybook**: `.storybook/preview.ts` imports both token files so tokens are available in stories
- **Typography**: Apply text styles as global CSS class names in JSX (e.g. `'body-md-14-bold'`) — **never** write font properties in `.module.css`
- **Icon slot sizing**: Use `.text-slot-20` / `.text-slot-16` global classes in JSX — **never** hardcode `width`/`height` in `.module.css`
- **Interactive states**: Implemented with native CSS pseudo-classes — `:hover:not(:disabled)`, `:active:not(:disabled)`, `:focus-visible:not(:disabled)`, `:disabled`
- **Focus ring**: Always `box-shadow` with `--outline-outline-focused`; never use the `outline` property
- **Disabled cursor**: Set `cursor: not-allowed` in CSS; use the HTML `disabled` attribute on the element

### FORBIDDEN patterns

```css
/* ❌ Never do this */
color: #3d67ff;
padding: 12px;
border-radius: 999px;
font-size: 14px;
font-family: Inter;
width: 20px; /* icon slot sizing */
height: 20px;

/* ✅ Always do this */
color: var(--main-primary);
padding: var(--spacing-space-12);
border-radius: var(--border-radius-full);
/* typography → apply global class in JSX: 'body-md-14-bold' */
/* icon slot sizing → apply global class in JSX: 'text-slot-20' */
```

---

## 7. Project Structure

```
.
├── .github/
│   └── copilot-instructions.md   ← this file (design system rules)
├── public/                       ← static assets (served as-is)
├── src/
│   ├── assets/                   ← imported assets (bundled by Vite)
│   ├── components/               ← component source files only (.tsx / .types.ts / .module.css)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── Button.module.css
│   │   ├── Checkbox/
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Checkbox.types.ts
│   │   │   └── Checkbox.module.css
│   │   ├── InlineError/
│   │   └── Label/
│   ├── stories/                  ← Storybook stories (one .stories.tsx per component)
│   │   ├── Configure.mdx
│   │   ├── Button.stories.tsx
│   │   ├── Checkbox.stories.tsx
│   │   ├── InlineError.stories.tsx
│   │   └── Label.stories.tsx
│   ├── figma/                    ← Figma Code Connect files (one .figma.tsx per component)
│   │   ├── Button.figma.tsx
│   │   ├── Checkbox.figma.tsx
│   │   ├── InlineError.figma.tsx
│   │   └── Label.figma.tsx
│   ├── styles/
│   │   ├── tokens.css            ← generated: color, spacing, border, shadow tokens
│   │   └── typography.css        ← generated: typography tokens + text-style/sizing utility classes
│   ├── App.css
│   ├── App.tsx
│   ├── index.css                 ← global reset + @import both token files
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 8. Integration Guidelines for Figma Designs

1. **Tokens first** — before writing any CSS value, use `var(--...)` from `src/styles/tokens.css` or `src/styles/typography.css`. These files are auto-generated — never add tokens manually; re-run `npm run tokens:build` to pick up new Figma tokens.
2. **Component folder** — always create `src/components/ComponentName/` with three files: `.tsx`, `.types.ts`, `.module.css`. Create the corresponding story in `src/stories/ComponentName.stories.tsx` and the Code Connect file in `src/figma/ComponentName.figma.tsx`.
3. **State mapping from Figma** — map Figma component states to CSS pseudo-classes:
   - Figma `Hover` → `:hover:not(:disabled)`
   - Figma `Active` / `Pressed` → `:active:not(:disabled)`
   - Figma `Focused` → `:focus-visible:not(:disabled)`
   - Figma `Disabled` → `:disabled` (with `disabled` attribute on element)
   - Figma `Critical` / `Error` → a `.critical` CSS class (not a pseudo-class)
   - Figma `Loading` → a `.loading` CSS class with `pointer-events: none`
4. **Disabled state** — use the HTML `disabled` boolean attribute so the browser handles `aria-disabled` and `:disabled` natively.
5. **Focus ring** — `box-shadow: 0 0 0 var(--border-weight-2) var(--main-on-primary), 0 0 0 var(--border-weight-4) var(--outline-outline-focused)` (two-ring style).
6. **Accessibility** — semantic HTML elements, ARIA attributes (`aria-busy` for loading, `aria-label` when no visible label, `aria-describedby` for error messages), visible focus styles.
7. **Indeterminate checkbox** — the `indeterminate` property has no HTML attribute; set it via a `useRef` + `useEffect`: `inputRef.current.indeterminate = indeterminate`.
8. **Storybook** — add stories for every Figma variant; the Storybook preview already imports tokens globally.
9. **No hardcoded values** — treat any raw hex, pixel value, or magic number in a `.module.css` as a bug.