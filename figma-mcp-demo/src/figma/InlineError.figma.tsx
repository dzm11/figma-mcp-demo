/**
 * Figma Code Connect — InlineError
 *
 * Figma file: H3scHHO8gzcKecmO2Sa9aN
 * Node: 73501-3733
 *
 * Publish with: npx figma connect publish
 */
import figma from '@figma/code-connect';
import { InlineError } from '../components/InlineError/InlineError';

// InlineError has no editable component properties in Figma —
// the message text is a fixed text layer, not a component property.
figma.connect(
  InlineError,
  'https://www.figma.com/design/H3scHHO8gzcKecmO2Sa9aN?node-id=73501-3733',
  {
    example: () => <InlineError message="Error message" />,
  }
);
