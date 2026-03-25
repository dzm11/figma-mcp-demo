---
applyTo: "src/components/**"
---

# React Component Best Practices

Apply these rules to every component created or edited in `src/components/`.

---

## 0. Figma MCP workflow (required steps — do not skip)

Every time a component is implemented from a Figma selection, follow this exact sequence:

1. **`get_design_context`** — fetch the structured representation for the node
2. If the response is too large or truncated, run **`get_metadata`** first to get the high-level node map, then re-fetch only the required node(s) with `get_design_context`
3. **`get_screenshot`** — get a visual reference of the exact variant being implemented
4. Only after steps 1–3: download any assets and start implementation
5. Translate the output (React + Tailwind) into this project's CSS Modules + token conventions — never ship Tailwind classes
6. **Validate 1:1** against the Figma screenshot for look and behaviour before marking complete

### Asset handling rules

- If the Figma MCP server returns a `localhost` source for an image or SVG, **use that source directly** — do not re-export or recreate it
- **Never** install or import new icon packages
- **Always** use existing icon components from `src/assets/icons/SVGR` when an icon already exists in the repo
- If an icon is missing, add its source SVG to `src/assets/icons/raw` and create a matching React icon component in `src/assets/icons/SVGR` instead of defining SVG markup inside a component file
- **Never** create local inline icon components inside files under `src/components`
- **Never** use placeholder images or colours when a real asset source is provided

### Selection size

- Implement one component at a time — do not select entire screens
- If a selection feels slow or produces incomplete output, reduce it to a single component or logical section

---

---

## 1. File structure

Each component is split across **three dedicated top-level folders**:

```
src/
  components/ComponentName/          ← component source only
    ComponentName.tsx
    ComponentName.types.ts
    ComponentName.module.css

  stories/                           ← all Storybook stories
    ComponentName.stories.tsx

  figma/                             ← all Figma Code Connect files
    ComponentName.figma.tsx
```

- **`src/components/`** — component implementation, types, and CSS Modules. No stories, no Code Connect.
- **`src/stories/`** — one `.stories.tsx` file per component. Import components via relative path `'../components/ComponentName/ComponentName'`.
- **`src/figma/`** — one `.figma.tsx` file per component using `@figma/code-connect`. Publish with `npx figma connect publish`.

Never put multiple components in one file. Never put types inline in `.tsx`.

### Primitives vs. compositions

- **Primitives** (`Button`, `Checkbox`, `InlineError`) — cannot be broken down into smaller design-system components; implement in `src/components/`
- **Compositions** — arrangements of primitives into larger patterns (e.g. form groups, cards); import and reuse existing primitives rather than duplicating their markup or styles
- Always check whether an existing component covers the need before creating a new one

---

## 2. Component authoring

```tsx
// ✅ Correct pattern
import React from 'react';
import styles from './ComponentName.module.css';
import type { ComponentNameProps } from './ComponentName.types.ts';

export const ComponentName: React.FC<ComponentNameProps> = ({ prop, children }) => {
  return <div className={styles.wrapper}>{children}</div>;
};
```

- Use `React.FC<Props>` with named exports (no default exports)
- Destructure props in the function signature
- Never use `any` — type everything explicitly
- Keep components focused; extract sub-components into separate files if they grow complex
- No business logic in components — derive values from props at the top of the function body

---

## 3. Props and types

```ts
// ComponentName.types.ts
export interface ComponentNameProps {
  /** Short JSDoc describing the prop */
  variant?: 'primary' | 'secondary';
  /** Always type children explicitly */
  children: React.ReactNode;
  /** Callback types — never `Function` */
  onClick?: () => void;
}
```

- Use `interface` for props (not `type`)
- Use union string literals for variants instead of enums
- Prefer `React.ReactNode` for renderable children
- Mark optional props with `?` and provide defaults in destructuring
- Never use `React.FC` without a Props interface

---

## 4. State and hooks

```tsx
// ✅ Derive values — don't duplicate state
const isDisabled = state === 'disabled';
const isLoading = state === 'loading';

// ✅ useRef for imperative DOM operations
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  if (inputRef.current) inputRef.current.indeterminate = indeterminate;
}, [indeterminate]);
```

- Derive booleans from props rather than storing redundant state
- Use `useRef` for DOM access, not state
- Keep `useEffect` dependency arrays accurate — never suppress the lint rule
- Name event handlers with the `handle` prefix: `handleClick`, `handleChange`

---

## 5. CSS Modules

```css
/* ✅ Compose conditional class names */
<div
  className={[
    styles.wrapper,
    isActive && styles.active,
    isCritical && styles.critical,
  ].filter(Boolean).join(' ')}
/>
```

- One `.module.css` per component — no global class names
- Use the `[styles.base, condition && styles.modifier].filter(Boolean).join(' ')` pattern for conditionals
- **Never** use hardcoded colours, sizes, or spacing — always `var(--token-name)` from `src/styles/tokens.css` or `src/styles/typography.css`
- **Never** write font properties in `.module.css` — apply the matching text-style global class in JSX instead (e.g. `'body-md-14-bold'`)
- **Never** hardcode icon slot `width`/`height` — use global sizing utility classes in JSX (e.g. `'text-slot-20'`, `'text-slot-16'`)
- Compose local + global classes: `[styles.localClass, 'global-utility'].filter(Boolean).join(' ')`
- Class names in `camelCase`: `.iconSlot`, `.textSlot`, `.sizeL`

---

## 6. Accessibility

Follow WCAG 2.1 AA as a minimum baseline.

- Use semantic HTML elements (`<button>`, `<input>`, `<label>`, `<p>`, etc.)
- Add `aria-busy={true}` for loading states on interactive elements
- Add `role="alert"` on dynamically injected error messages
- Always pair `<input>` with `<label>` (via `htmlFor` / `id`)
- Decorative icons: `aria-hidden="true"` on wrapping `<span>` or `<svg>`
- Focus rings: `box-shadow` with `--color-outline-focused`, never suppress `:focus-visible`
- Disabled: use the HTML `disabled` attribute (not `aria-disabled` alone) so `:disabled` CSS works
- Colour contrast: text and interactive elements must meet 4.5:1 (normal text) / 3:1 (large text) ratio
- Never rely on colour alone to communicate state — pair with text, icon, or shape changes

---

## 7. Icon components

```tsx
// ✅ Correct icon usage
import { IconReset } from '../../assets/icons/SVGR/index';

<span aria-hidden="true" className={[styles.iconSlot, 'text-slot-20'].join(' ')}>
  <IconReset height={20} width={20} />
</span>
```

- Always import icons from `src/assets/icons/SVGR`
- Prefer importing from the generated barrel when the icon is part of the synced set
- For repo-local icons that are not part of the synced barrel yet, import the component directly from its file in `src/assets/icons/SVGR`
- `20×20` for action icons, `16×16` for inline/decorative icons unless the design requires otherwise
- Decorative icons must remain `aria-hidden="true"`
- Never define new icon JSX directly inside a file in `src/components`

---

## 8. Storybook stories

Story files live in **`src/stories/`** (not inside the component folder).

```tsx
// src/stories/ComponentName.stories.tsx
import { ComponentName } from '../components/ComponentName/ComponentName';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['primary', 'secondary'] },
  },
};
export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = { args: { children: 'Label' } };
```

- One story file per component in `src/stories/`, title `'Components/ComponentName'`
- Always add `tags: ['autodocs']`
- Export a `Default` story — plus named stories for each meaningful variant
- Use `argTypes` with `control` for every prop that has a finite set of values
- Never import styles or tokens directly in story files — they come from the Storybook preview

---

## 9a. Figma Code Connect

Code Connect files live in **`src/figma/`** (not inside the component folder).

```tsx
// src/figma/ComponentName.figma.tsx
import figma from '@figma/code-connect';
import { ComponentName } from '../components/ComponentName/ComponentName';

figma.connect(
  ComponentName,
  'https://www.figma.com/design/<FILE_KEY>?node-id=<NODE_ID>',
  {
    props: {
      variant: figma.enum('Variant', {
        Primary: 'primary',
        Secondary: 'secondary',
      }),
      label: figma.string('Label'),
      isDisabled: figma.boolean('Disabled'),
    },
    example: ({ variant, label, isDisabled }) => (
      <ComponentName variant={variant} disabled={isDisabled}>
        {label}
      </ComponentName>
    ),
  }
);
```

- One `.figma.tsx` file per component in `src/figma/`
- Map Figma prop names exactly (case-sensitive) to React prop values
- `figma.enum('FigmaPropName', { FigmaValue: reactValue })` for variant/enum props
- `figma.boolean('FigmaPropName')` for boolean Figma properties
- `figma.string('FigmaPropName')` for text content
- Publish all connections with `npx figma connect publish --token <FIGMA_TOKEN>`
- The Button node ID is TODO — obtain via Figma right-click → "Copy link" → extract `node-id` param

---

## 9. What to avoid

| ❌ Don't | ✅ Do instead |
|---|---|
| Default exports | Named exports |
| Inline styles | CSS Modules with token variables |
| `any` type | Explicit TypeScript types |
| Hardcoded hex/px values | `var(--token)` from `tokens.css` / `typography.css` |
| `font-*` in `.module.css` | Global text-style class in JSX: `'body-md-14-bold'` |
| `width`/`height` for icon slots in `.module.css` | Global sizing class in JSX: `'text-slot-20'` |
| `enum` for variants | Union string literals |
| Business logic in JSX | Derive variables above the `return` |
| `outline` for focus | `box-shadow` with `--color-outline-focused` |
| External icon libraries | Inline SVG with `currentColor` |
| Tailwind classes from MCP output | Translate to CSS Module + token variables |
| Duplicating existing component markup | Import and reuse existing primitives |
| Placeholder assets when MCP returns a source | Use the MCP-provided localhost source directly |
| Shipping without visual check | Validate against Figma screenshot before done |
