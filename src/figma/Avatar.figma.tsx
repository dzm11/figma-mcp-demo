import figma from '@figma/code-connect';
import { Avatar } from '../components/Avatar/Avatar';

figma.connect(
  Avatar,
  'https://www.figma.com/design/H3scHHO8gzcKecmO2Sa9aN/Demo-Design-System?node-id=72997-312072',
  {
    props: {
      size: figma.enum('Size', {
        XS: 'xs',
        S: 's',
        M: 'm',
        L: 'l',
        XL: 'xl',
      }),
      type: figma.enum('Type', {
        Initials: 'initials',
        Inverse: 'inverse',
        Company: 'company',
        Image: 'image',
      }),
      state: figma.enum('State', {
        Default: 'default',
        Hover: 'hover',
      }),
      showText: figma.boolean('isText'),
      showSubtext: figma.boolean('isSubtext'),
    },
    example: ({ showSubtext, showText, size, state, type }) => (
      <Avatar
        showSubtext={showSubtext}
        showText={showText}
        size={size}
        state={state}
        type={type}
      />
    ),
  },
);
