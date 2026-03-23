import type { Meta, StoryObj } from '@storybook/react';
import { DemoCard } from '../components/DemoCard/DemoCard';

const meta: Meta<typeof DemoCard> = {
  title: 'Components/DemoCard',
  component: DemoCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Composite demo card from Figma. Tooltip appears only on hover/focus over the Demo label. Clicking Reset triggers loading for ~2.2s and lowers entire card opacity to 0.4 during the reset flow.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    resetDelayMs: {
      control: { type: 'number', min: 2000, max: 3000, step: 100 },
    },
  },
  args: {
    resetDelayMs: 2200,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
