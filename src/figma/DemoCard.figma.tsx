import figma from '@figma/code-connect';
import { DemoCard } from '../components/DemoCard/DemoCard';

figma.connect(
  DemoCard,
  'https://www.figma.com/design/H3scHHO8gzcKecmO2Sa9aN/Demo-Design-System?node-id=111503-1984',
  {
    example: () => <DemoCard />,
  },
);
