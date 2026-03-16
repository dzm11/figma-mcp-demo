import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../components/Avatar/Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Avatar component implemented from the Figma selection. Company avatars intentionally use one shared SVG placeholder so you can replace that asset later without changing component code.',
      },
    },
  },
  args: {
    size: 'xl',
    state: 'default',
    type: 'initials',
    showText: true,
    showSubtext: false,
    text: 'Text',
    subtext: 'Label:',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l', 'xl'],
    },
    state: {
      control: 'radio',
      options: ['default', 'hover'],
    },
    type: {
      control: 'radio',
      options: ['initials', 'inverse', 'company', 'image'],
    },
    showText: { control: 'boolean' },
    showSubtext: { control: 'boolean' },
    text: { control: 'text' },
    subtext: { control: 'text' },
    initials: { control: 'text' },
    companyLogoSrc: { control: false },
    imageSrc: { control: false },
    alt: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  args: {
    type: 'initials',
  },
};

export const Inverse: Story = {
  args: {
    type: 'inverse',
  },
};

export const Company: Story = {
  args: {
    type: 'company',
  },
};

export const Image: Story = {
  args: {
    type: 'image',
  },
};
