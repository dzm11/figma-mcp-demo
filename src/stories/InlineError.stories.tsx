import { InlineError } from '../components/InlineError/InlineError';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof InlineError> = {
  title: 'Components/InlineError',
  component: InlineError,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Inline error message with a 16×16 warning icon. Renders with role="alert" for screen readers. Used beneath form fields (e.g. Checkbox) in the critical state.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'The error message text to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof InlineError>;

export const Default: Story = {
  args: {
    message: 'Error message',
  },
};
