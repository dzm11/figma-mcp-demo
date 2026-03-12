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

figma.connect(
  InlineError,
  'https://www.figma.com/design/H3scHHO8gzcKecmO2Sa9aN?node-id=73501-3733',
  {
    props: {
      message: figma.string('Message'),
    },
    example: ({ message }) => <InlineError message={message} />,
  }
);
