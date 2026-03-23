import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../components/Label/Label';

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
