import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../components/Checkbox/Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    critical: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    errorMessage: { control: 'text' },
  },
  args: {
    label: 'Label',
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};
