import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';
import type { LabelColor } from './Label.types';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
  args: {
    children: 'Demo',
    color: 'gray',
    isStrong: false,
    type: 'default',
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['red', 'gray', 'yellow', 'green', 'black', 'orange', 'blue', 'purple', 'teal'],
    },
    type: { control: 'radio', options: ['default', 'icon'] },
    isStrong: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: { type: 'icon' },
};

export const Strong: Story = {
  args: { isStrong: true },
};

export const StrongWithIcon: Story = {
  args: { isStrong: true, type: 'icon' },
};

const COLORS: LabelColor[] = [
  'red', 'gray', 'yellow', 'green', 'black', 'orange', 'blue', 'purple', 'teal',
];

export const AllColors: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      {COLORS.map((color) => (
        <Label key={color} {...args} color={color}>
          {color}
        </Label>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {(['default', 'icon'] as const).map((type) =>
        ([false, true] as const).map((isStrong) => (
          <div
            key={`${type}-${String(isStrong)}`}
            style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}
          >
            <span style={{ fontSize: '11px', color: '#666', width: '140px', flexShrink: 0 }}>
              {type} / {isStrong ? 'strong' : 'container'}
            </span>
            {COLORS.map((color) => (
              <Label key={color} type={type} color={color} isStrong={isStrong}>
                {color}
              </Label>
            ))}
          </div>
        ))
      )}
    </div>
  ),
};
