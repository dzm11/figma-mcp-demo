---
applyTo: "src/components/**"
---

# React Component Best Practices

Apply these rules to every component created or edited in `src/components/`.

---

## 1. File structure

Every component lives in its own folder with exactly four files:

```
src/components/ComponentName/
  ComponentName.tsx          ← component implementation
  ComponentName.types.ts     ← TypeScript interfaces / types
  ComponentName.module.css   ← scoped styles (tokens only)
  ComponentName.stories.tsx  ← Storybook stories
```

Never put multiple components in one file. Never put types inline in `.tsx`.

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
- **Never** use hardcoded colours, sizes, or spacing — always `var(--token-name)` from `src/styles/tokens.css`
- Class names in `camelCase`: `.iconSlot`, `.textSlot`, `.sizeL`

---

## 6. Accessibility

- Use semantic HTML elements (`<button>`, `<input>`, `<label>`, `<p>`, etc.)
- Add `aria-busy={true}` for loading states on interactive elements
- Add `role="alert"` on dynamically injected error messages
- Always pair `<input>` with `<label>` (via `htmlFor` / `id`)
- Decorative icons: `aria-hidden="true"` on wrapping `<span>` or `<svg>`
- Focus rings: `box-shadow` with `--color-outline-focused`, never suppress `:focus-visible`
- Disabled: use the HTML `disabled` attribute (not `aria-disabled` alone) so `:disabled` CSS works

---

## 7. Inline SVG icons

```tsx
// ✅ Correct icon pattern
const ChevronDown = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor"
      strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);
```

- Always inline SVGs — no external icon libraries
- `20×20` for action icons, `16×16` for inline/decorative icons
- Always `stroke="currentColor"` or `fill="currentColor"` — never hardcoded colours
- Always `aria-hidden="true"`

---

## 8. Storybook stories

```tsx
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

- One story file per component, title `'Components/ComponentName'`
- Always add `tags: ['autodocs']`
- Export a `Default` story — plus named stories for each meaningful variant
- Use `argTypes` with `control` for every prop that has a finite set of values
- Never import styles or tokens directly in story files — they come from the Storybook preview

---

## 9. What to avoid

| ❌ Don't | ✅ Do instead |
|---|---|
| Default exports | Named exports |
| Inline styles | CSS Modules with token variables |
| `any` type | Explicit TypeScript types |
| Hardcoded hex/px values | `var(--token)` from `tokens.css` |
| `enum` for variants | Union string literals |
| Business logic in JSX | Derive variables above the `return` |
| `outline` for focus | `box-shadow` with `--color-outline-focused` |
| External icon libraries | Inline SVG with `currentColor` |
