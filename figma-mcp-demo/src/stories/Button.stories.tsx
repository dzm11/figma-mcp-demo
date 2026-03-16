import { Button } from '../components/Button/Button';
import type { Meta, StoryObj } from '@storybook/react';

// Plus icon matching Figma "Adding / add, create, include, select" (20×20)
const PlusIcon = () => (
  <svg
    fill="none"
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 4V16M4 10H16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
);

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Button component built from Figma design tokens. Hover, click, and Tab/focus to see all interactive states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['primary', 'outlined', 'secondary', 'tertiary'],
      description: 'Visual style variant from Figma',
    },
    size: {
      control: { type: 'select' },
      options: ['l', 'm', 's'],
      description: 'L = 12px padding · M = 8px · S = 4px (vertical)',
    },
    state: {
      control: { type: 'select' },
      options: ['default', 'disabled', 'loading', 'critical'],
      description: 'hover / active / focus are native CSS pseudo-states',
    },
    disclosure: {
      control: { type: 'boolean' },
      description: 'Show chevron after label',
    },
    icon: {
      control: false,
      description: 'ReactNode shown in 20×20 icon slot before label',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => <Button {...args} icon={<PlusIcon />}>Button</Button>,
  args: { type: 'primary', size: 'm', state: 'default', disclosure: false },
};

export const Outlined: Story = {
  render: (args) => <Button {...args} icon={<PlusIcon />}>Button</Button>,
  args: { type: 'outlined', size: 'm', state: 'default', disclosure: false },
};

export const Secondary: Story = {
  render: (args) => <Button {...args} icon={<PlusIcon />}>Button</Button>,
  args: { type: 'secondary', size: 'm', state: 'default', disclosure: false },
};

export const Tertiary: Story = {
  render: (args) => <Button {...args} icon={<PlusIcon />}>Button</Button>,
  args: { type: 'tertiary', size: 'm', state: 'default', disclosure: false },
};
