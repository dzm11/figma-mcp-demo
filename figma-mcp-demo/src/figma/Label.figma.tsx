/**
 * Figma Code Connect — Label
 *
 * Figma file: H3scHHO8gzcKecmO2Sa9aN
 * Node: 73204-1085945
 *
 * Publish with: npx figma connect publish
 */
import figma from '@figma/code-connect';
import { Label } from '../components/Label/Label';

figma.connect(
  Label,
  'https://www.figma.com/design/H3scHHO8gzcKecmO2Sa9aN?node-id=73204-1085945',
  {
    props: {
      type: figma.enum('Type', {
        Default: 'default',
        Icon: 'icon',
      }),
      color: figma.enum('Color', {
        Red: 'red',
        Gray: 'gray',
        Yellow: 'yellow',
        Green: 'green',
        Black: 'black',
        Orange: 'orange',
        Blue: 'blue',
        Purple: 'purple',
        Teal: 'teal',
      }),
      isStrong: figma.boolean('isStrong'),
      children: figma.string('Label'),
    },
    example: ({ type, color, isStrong, children }) => (
      <Label type={type} color={color} isStrong={isStrong}>
        {children}
      </Label>
    ),
  }
);
