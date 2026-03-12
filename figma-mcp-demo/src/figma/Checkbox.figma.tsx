/**
 * Figma Code Connect — Checkbox
 *
 * Figma file: H3scHHO8gzcKecmO2Sa9aN
 * Node: 73399-2487
 *
 * Publish with: npx figma connect publish
 */
import figma from '@figma/code-connect';
import { Checkbox } from '../components/Checkbox/Checkbox';

figma.connect(
  Checkbox,
  'https://www.figma.com/design/H3scHHO8gzcKecmO2Sa9aN?node-id=73399-2487',
  {
    props: {
      checked: figma.enum('State', {
        Selected: true,
        Unselected: false,
        Indeterminate: false,
      }),
      indeterminate: figma.enum('State', {
        Indeterminate: true,
        Selected: false,
        Unselected: false,
      }),
      disabled: figma.boolean('Disabled'),
      critical: figma.boolean('Critical'),
      label: figma.string('Label'),
    },
    example: ({ checked, indeterminate, disabled, critical, label }) => (
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        critical={critical}
        label={label}
      />
    ),
  }
);
