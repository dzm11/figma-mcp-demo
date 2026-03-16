import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from '../components/Tooltip/Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Presentational tooltip bubble from Figma. This component only renders the bubble and pointer; trigger, hover handling, and absolute positioning can be composed around it later.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    showDescription: { control: 'boolean' },
    tone: {
      control: { type: 'select' },
      options: ['default', 'inverse'],
    },
    arrow: {
      control: { type: 'select' },
      options: ['top', 'bottom'],
    },
  },
  args: {
    title: 'Tooltip Text',
    description:
      'Legend says a complete profile attracts unicorns. Start yours and see if the legend is true!',
    showDescription: true,
    tone: 'inverse',
    arrow: 'bottom',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
