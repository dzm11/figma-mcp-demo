import { Button } from './Button';
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

// ─── PRIMARY ────────────────────────────────────────────────────────────────

export const Primary: Story = {
  args: { type: 'primary', size: 'm', children: 'Enabled' },
};

export const PrimaryDisabled: Story = {
  args: { type: 'primary', size: 'm', state: 'disabled', children: 'Disabled' },
};

export const PrimaryLoading: Story = {
  args: { type: 'primary', size: 'm', state: 'loading', children: 'Loading' },
};

export const PrimaryCritical: Story = {
  args: { type: 'primary', size: 'm', state: 'critical', children: 'Delete' },
};

// ─── OUTLINED ───────────────────────────────────────────────────────────────

export const Outlined: Story = {
  args: { type: 'outlined', size: 'm', children: 'Enabled' },
};

export const OutlinedDisabled: Story = {
  args: { type: 'outlined', size: 'm', state: 'disabled', children: 'Disabled' },
};

// ─── SECONDARY ──────────────────────────────────────────────────────────────

export const Secondary: Story = {
  args: { type: 'secondary', size: 'm', children: 'Enabled' },
};

export const SecondaryDisabled: Story = {
  args: { type: 'secondary', size: 'm', state: 'disabled', children: 'Disabled' },
};

// ─── TERTIARY ───────────────────────────────────────────────────────────────

export const Tertiary: Story = {
  args: { type: 'tertiary', size: 'm', children: 'Enabled' },
};

export const TertiaryDisabled: Story = {
  args: { type: 'tertiary', size: 'm', state: 'disabled', children: 'Disabled' },
};

// ─── SIZES ──────────────────────────────────────────────────────────────────

export const SizeLarge: Story = {
  args: { type: 'primary', size: 'l', children: 'Large' },
};

export const SizeMedium: Story = {
  args: { type: 'primary', size: 'm', children: 'Medium' },
};

export const SizeSmall: Story = {
  args: { type: 'primary', size: 's', children: 'Small' },
};

// ─── WITH ICON & DISCLOSURE ─────────────────────────────────────────────────

export const WithIcon: Story = {
  render: (args) => <Button {...args} icon={<PlusIcon />}>Add item</Button>,
  args: { type: 'primary', size: 'm' },
};

export const WithDisclosure: Story = {
  args: { type: 'primary', size: 'm', disclosure: true, children: 'Menu' },
};

export const WithIconAndDisclosure: Story = {
  render: (args) => (
    <Button {...args} icon={<PlusIcon />} disclosure>
      Add item
    </Button>
  ),
  args: { type: 'primary', size: 'm' },
};

// ─── OVERVIEW GRIDS ─────────────────────────────────────────────────────────

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button type="primary" size="m">Primary</Button>
      <Button type="outlined" size="m">Outlined</Button>
      <Button type="secondary" size="m">Secondary</Button>
      <Button type="tertiary" size="m">Tertiary</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'All four types. Hover over each to see interactive states.' },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button type="primary" size="l">Large</Button>
      <Button type="primary" size="m">Medium</Button>
      <Button type="primary" size="s">Small</Button>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button type="primary" size="m">Default</Button>
      <Button type="primary" size="m" state="disabled">Disabled</Button>
      <Button type="primary" size="m" state="loading">Loading</Button>
      <Button type="primary" size="m" state="critical">Critical</Button>
    </div>
  ),
};

export const AllTypesWithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button type="primary" size="m" icon={<PlusIcon />}>Primary</Button>
      <Button type="outlined" size="m" icon={<PlusIcon />}>Outlined</Button>
      <Button type="secondary" size="m" icon={<PlusIcon />}>Secondary</Button>
      <Button type="tertiary" size="m" icon={<PlusIcon />}>Tertiary</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'All types with leading icon slot (20×20px per Figma).' },
    },
  },
};
