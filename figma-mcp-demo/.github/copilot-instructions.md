# Figma Design System Rules for figma-mcp-demo

This document outlines the design system structure and integration guidelines for the figma-mcp-demo repository, which uses React and TypeScript with Vite.

## Design System Structure

### 1. Token Definitions

> **RULE: Never use hardcoded color, spacing, radius or typography values in CSS. You MUST use only the CSS custom properties listed below.**

All design tokens are sourced from the Figma file `H3scHHO8gzcKecmO2Sa9aN` and defined as CSS custom properties in [`src/styles/tokens.css`](../src/styles/tokens.css). This file is imported globally via `src/index.css` and in `.storybook/preview.ts`.

#### Colors — Main
| CSS Custom Property | Value | Figma Variable |
|---|---|---|
| `--color-surface-white` | `#ffffff` | `surfaces/surface` |
| `--color-main-primary` | `#3d67ff` | `main/primary` |
| `--color-main-on-primary` | `#ffffff` | `main/on-primary` |

#### Colors — State (interactive)
| CSS Custom Property | Value | Figma Variable |
|---|---|---|
| `--color-state-primary-hover` | `#3255d4` | `state/primary-hover` |
| `--color-state-primary-active` | `#2844aa` | `state/primary-active` |
| `--color-state-primary-disabled` | `#9eb3ff` | `state/primary-disabled` |
| `--color-state-on-surface-hover` | `#4d5a75` | `state/on-surface-hover` |
| `--color-state-on-surface-active` | `#252b37` | `state/on-surface-active` |
| `--color-state-on-surface-disabled` | `#a3adc2` | `state/on-surface-disabled` |

#### Colors — Surfaces
| CSS Custom Property | Value | Figma Variable |
|---|---|---|
| `--color-surface-container-low` | `#f6f7f9` | `elevation/surface-container-low` |
| `--color-surface-container` | `#edeff2` | `elevation/surface-container` |
| `--color-surface-container-high` | `#e2e4e9` | `elevation/surface-container-high` |
| `--color-surface-on-surface-weak` | `#4d5a75` | `surfaces/on-surface-weak` |

#### Colors — Outline
| CSS Custom Property | Value | Figma Variable |
|---|---|---|
| `--color-outline` | `#4d5a75` | `outline/outline` |
| `--color-outline-hover` | `#252b37` | `outline/outline-hover` |
| `--color-outline-variant` | `#d7dae1` | `outline/outline-variant` |
| `--color-outline-variant-hover` | `#b1bacb` | `outline/outline-variant-hover` |
| `--color-outline-variant-active` | `#a3adc2` | `outline/outline-variant-active` |
| `--color-outline-variant-disabled` | `#d7dae1` | `outline/outline-variant-disabled` |
| `--color-outline-focused` | `#3255d4` | `outline/outline-focused` |

#### Colors — Status
| CSS Custom Property | Value | Figma Variable |
|---|---|---|
| `--color-critical` | `#e5484d` | `status/critical` |
| `--color-critical-container` | `#ffd6d6` | `system/critical-container` |

#### Spacing
| CSS Custom Property | Value | Figma Variable |
|---|---|---|
| `--spacing-0` | `0px` | `spacing/space-0` |
| `--spacing-4` | `4px` | `spacing/space-4` |
| `--spacing-6` | `6px` | `spacing/space-6` |
| `--spacing-8` | `8px` | `spacing/space-8` |
| `--spacing-12` | `12px` | `spacing/space-12` |

#### Border Radius
| CSS Custom Property | Value | Figma Variable |
|---|---|---|
| `--radius-2` | `2px` | `border/radius-2` |
| `--radius-4` | `4px` | `border/radius-4` |
| `--radius-full` | `999px` | `border/radius-full` |

#### Typography
| CSS Custom Property | Value | Figma Variable |
|---|---|---|
| `--font-family-body` | `'Inter', sans-serif` | `font-family/body` |
| `--font-size-14` | `14px` | `font-size/font-size-14` |
| `--font-weight-regular` | `400` | `font-weight/weight-regular` |
| `--font-weight-bold` | `700` | `font-weight/weight-bold` |
| `--line-height-1250` | `20px` | `line-height/height-1250` |
| `--letter-spacing-normal` | `0px` | `letter-spacing/spacing-normal` |

---

### 2. Component Library
- **Location**: `src/components/` — one subfolder per component
- **Architecture**: Functional React components with TypeScript props interfaces, CSS Modules for styling
- **Documentation**: Storybook stories (`.stories.tsx`) per component

Example component structure:
```tsx
// src/components/Button/Button.tsx
import React from 'react';
import styles from './Button.module.css';
import type { ButtonProps } from './Button.types.ts';

export const Button: React.FC<ButtonProps> = ({
  type = 'primary',
  size = 'm',
  state = 'default',
  children,
  onClick,
}) => (
  <button
    className={`${styles.button} ${styles[`type-${type}`]} ${styles[`size-${size}`]}`}
    disabled={state === 'disabled'}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);
```

Example CSS Modules — **tokens only, no hardcoded values**:
```css
/* src/components/Button/Button.module.css */
.button {
  font-family: var(--font-family-body);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
}

.type-primary {
  background-color: var(--color-main-primary);
  color: var(--color-main-on-primary);
}

.type-primary:hover:not(:disabled) {
  background-color: var(--color-state-primary-hover);
}

.type-primary:active:not(:disabled) {
  background-color: var(--color-state-primary-active);
}
```

---

### 3. Frameworks & Libraries
- **UI Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build System**: Vite 7.3.1
- **Styling**: CSS Modules (`.module.css`) with design tokens from `src/styles/tokens.css`
- **Testing**: Vitest with Playwright for browser testing
- **Component Documentation**: Storybook 10.2.16

---

### 4. Asset Management
- **Storage**: Images in `src/assets/` (imported) or `public/` (direct path)
- **Referencing**: `import logo from './assets/logo.svg'` or `/logo.svg`

---

### 5. Icon System
- Inline SVG markup in JSX components
- Icons sized to 20×20px to match Figma icon slots
- Use `currentColor` for stroke/fill so icons inherit the component's text color

---

### 6. Styling Approach
- **Methodology**: CSS Modules — one `.module.css` per component
- **Tokens file**: `src/styles/tokens.css` — the single source of truth for all values
- **Global styles**: `src/index.css` — imports tokens, sets base body/typography
- **Storybook**: `.storybook/preview.ts` imports `src/styles/tokens.css` so tokens are available in stories
- **FORBIDDEN**: Raw hex codes, pixel values outside of tokens, or magic numbers in component CSS

---

### 7. Project Structure
```
src/
  components/
    Button/
      Button.tsx          ← component
      Button.types.ts     ← TypeScript interfaces
      Button.module.css   ← scoped styles (tokens only)
      Button.stories.tsx  ← Storybook stories
  stories/                ← legacy Storybook examples
  styles/
    tokens.css            ← ALL design tokens (CSS custom properties)
  assets/
  App.tsx
  index.css               ← global reset + @import './styles/tokens.css'
  main.tsx
```

---

## Integration Guidelines for Figma Designs

1. **Tokens first** — before writing any CSS value, check the token table above and use `var(--...)`. If a value isn't in the table, ask whether it should be added as a new token.
2. **Component folder** — create `src/components/ComponentName/` with `.tsx`, `.types.ts`, `.module.css`, `.stories.tsx`.
3. **Interactive states** — implement with native CSS pseudo-classes (`:hover:not(:disabled)`, `:active:not(:disabled)`, `:focus-visible:not(:disabled)`, `:disabled`) using the state tokens.
4. **Disabled state** — use the HTML `disabled` attribute on the element; style via the `:disabled` pseudo-class.
5. **Focus ring** — use `box-shadow` with `--color-outline-focused` (not `outline`).
6. **Accessibility** — semantic HTML, ARIA attributes (`aria-busy`, `aria-label`, etc.), and visible focus styles.
7. **Storybook** — add stories for every variant; import tokens via the Storybook preview (already configured).