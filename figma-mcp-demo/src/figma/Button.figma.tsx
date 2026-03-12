/**
 * Figma Code Connect — Button
 *
 * Figma file: H3scHHO8gzcKecmO2Sa9aN
 * Node: 73211-1131248
 *
 * Publish with: npx figma connect publish
 */
import figma from '@figma/code-connect';
import { Button } from '../components/Button/Button';

figma.connect(
  Button,
  'https://www.figma.com/design/H3scHHO8gzcKecmO2Sa9aN/Demo-Design-System?node-id=73211-1131248',
  {
    props: {
      type: figma.enum('Type', {
        Primary: 'primary',
        Outlined: 'outlined',
        Secondary: 'secondary',
        Tertiary: 'tertiary',
      }),
      size: figma.enum('Size', {
        L: 'l',
        M: 'm',
        S: 's',
      }),
      state: figma.enum('State', {
        Default: 'default',
        Disabled: 'disabled',
        Loading: 'loading',
      }),
      // Note: 'Icon#73332:0' and 'Disclosure#73332:61' are nested-instance BOOLEAN
      // properties. Code Connect 1.4.x validates these against component-level props
      // only — skip them here and hardcode defaults in the example below.
    },
    example: ({ type, size, state }) => (
      <Button type={type} size={size} state={state}>
        Button
      </Button>
    ),
  }
);
