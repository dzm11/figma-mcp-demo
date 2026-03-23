import figma from '@figma/code-connect';
import { Tooltip } from '../components/Tooltip/Tooltip';

figma.connect(
  Tooltip,
  'https://www.figma.com/design/H3scHHO8gzcKecmO2Sa9aN/Demo-Design-System?node-id=73063-971943',
  {
    props: {
      arrow: figma.enum('Arrow', {
        Top: 'top',
        Bottom: 'bottom',
      }),
      tone: figma.enum('Color', {
        Default: 'default',
        Inverse: 'inverse',
      }),
      showDescription: figma.boolean('secondLine'),
    },
    example: ({ arrow, tone, showDescription }) => (
      <Tooltip
        arrow={arrow}
        tone={tone}
        showDescription={showDescription}
      />
    ),
  },
);
