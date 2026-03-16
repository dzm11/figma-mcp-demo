import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { userEvent, within } from 'storybook/test';
import { Avatar } from '../components/Avatar/Avatar';
import type { AvatarSize, AvatarState, AvatarType } from '../components/Avatar/Avatar.types';

const SIZES: AvatarSize[] = ['xl', 'l', 'm', 's', 'xs'];
const TYPES: AvatarType[] = ['initials', 'inverse', 'company', 'image'];
const STATES: AvatarState[] = ['default', 'hover'];

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

export const Playground: Story = {};

export const WithText: Story = {
  args: {
    showText: true,
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[class*="root"]')!;
    await userEvent.hover(root);
  },
};

export const WithSubtext: Story = {
  args: {
    showText: true,
    showSubtext: true,
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[class*="root"]')!;
    await userEvent.hover(root);
  },
};

export const HoveredAllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(['initials', 'inverse', 'company', 'image'] as const).map((type) => (
        <Avatar key={type} type={type} size="xl" showText text="Text" />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const roots = canvasElement.querySelectorAll<HTMLElement>('[class*="root"]');
    for (const root of roots) {
      await userEvent.hover(root);
    }
  },
};

export const FigmaSelection: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {STATES.map((state) => (
        <div key={state} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#7e8ca9' }}>
            {state}
          </div>
          {/* 8 columns: 4 icon-only types then 4 with-text types, one row per size */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content) 24px repeat(4, max-content)', gap: '12px 0', alignItems: 'center' }}>
            {SIZES.map((size) => (
              <React.Fragment key={`${state}-${size}`}>
                {TYPES.map((type) => (
                  <div key={`${state}-${type}-${size}-icon`} style={{ paddingRight: 20 }}>
                    <Avatar size={size} state={state} type={type} />
                  </div>
                ))}
                {/* spacer column */}
                <div />
                {TYPES.map((type) => (
                  <div key={`${state}-${type}-${size}-text`} style={{ paddingRight: 20 }}>
                    <Avatar size={size} state={state} type={type} showText text="Text" />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
