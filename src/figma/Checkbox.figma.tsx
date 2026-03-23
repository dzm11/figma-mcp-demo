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
      // Figma 'Checked' variant: Selected | Indetermined | Unselected
      checked: figma.enum('Checked', {
        Selected: true,
        Indetermined: false,
        Unselected: false,
      }),
      indeterminate: figma.enum('Checked', {
        Indetermined: true,
        Selected: false,
        Unselected: false,
      }),
      // Figma 'State' variant: Default | Hover | Active | Focused | Disabled | Critical
      disabled: figma.enum('State', {
        Disabled: true,
        Default: false,
        Hover: false,
        Active: false,
        Focused: false,
        Critical: false,
      }),
      critical: figma.enum('State', {
        Critical: true,
        Default: false,
        Hover: false,
        Active: false,
        Focused: false,
        Disabled: false,
      }),
    },
    example: ({ checked, indeterminate, disabled, critical }) => (
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        critical={critical}
        label="Label"
      />
    ),
  }
);
