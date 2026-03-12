/**
 * Figma Code Connect — Button
 *
 * Figma file: H3scHHO8gzcKecmO2Sa9aN
 * TODO: Replace <BUTTON_NODE_ID> below with the actual Figma node ID
 *       (format: XXXX-YYYY). Right-click the Button component in Figma →
 *       "Copy link" and extract the node-id query parameter.
 *
 * Publish with: npx figma connect publish
 */
import figma from '@figma/code-connect';
import { Button } from '../components/Button/Button';

figma.connect(
  Button,
  'https://www.figma.com/design/H3scHHO8gzcKecmO2Sa9aN?node-id=<BUTTON_NODE_ID>',
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
        Critical: 'critical',
      }),
      disclosure: figma.boolean('Disclosure'),
      children: figma.string('Label'),
    },
    example: ({ type, size, state, disclosure, children }) => (
      <Button type={type} size={size} state={state} disclosure={disclosure}>
        {children}
      </Button>
    ),
  }
);
