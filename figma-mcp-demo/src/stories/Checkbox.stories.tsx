import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Checkbox } from '../components/Checkbox/Checkbox';
import { userEvent } from 'storybook/test';

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

/* ── Interactive stories ── */

export const Unselected: Story = {
  args: { defaultChecked: false },
};

export const Selected: Story = {
  args: { defaultChecked: true },
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
};

/* ── Disabled ── */

export const DisabledUnselected: Story = {
  args: { disabled: true, defaultChecked: false },
};

export const DisabledSelected: Story = {
  args: { disabled: true, defaultChecked: true },
};

export const DisabledIndeterminate: Story = {
  args: { disabled: true, indeterminate: true },
};

/* ── Critical ── */

export const CriticalUnselected: Story = {
  args: { critical: true, defaultChecked: false },
};

export const CriticalSelected: Story = {
  args: { critical: true, defaultChecked: true },
};

export const CriticalIndeterminate: Story = {
  args: { critical: true, indeterminate: true },
};

export const CriticalWithError: Story = {
  args: {
    critical: true,
    defaultChecked: false,
    errorMessage: 'This field is required',
  },
};

/* ── No label ── */

export const NoLabel: Story = {
  args: { label: undefined },
};

/* ── Focus states ── */

export const FocusedUnselected: Story = {
  args: { defaultChecked: false },
  play: async () => { await userEvent.tab(); },
};

export const FocusedSelected: Story = {
  args: { defaultChecked: true },
  play: async () => { await userEvent.tab(); },
};

export const FocusedIndeterminate: Story = {
  args: { indeterminate: true },
  play: async () => { await userEvent.tab(); },
};

/* ── All states grid (matches Figma overview) ── */

export const AllStates: Story = {
  render: () => {
    type Row = { label: string; props: object };
    const rows: Row[] = [
      { label: 'Default',  props: {} },
      { label: 'Disabled', props: { disabled: true } },
      { label: 'Critical', props: { critical: true } },
    ];
    const columns = [
      { label: 'Unselected',    extra: {} },
      { label: 'Indeterminate', extra: { indeterminate: true } },
      { label: 'Selected',      extra: { defaultChecked: true } },
    ];

    // Build flat cell array to avoid Fragment-with-key in map
    const cells: ReactNode[] = [];
    cells.push(<div key="h0" />);
    columns.forEach(c =>
      cells.push(
        <span key={`h-${c.label}`} style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
          {c.label}
        </span>,
      ),
    );
    rows.forEach(row => {
      cells.push(
        <span key={`r-${row.label}`} style={{ fontSize: 11, color: '#6b7280' }}>
          {row.label}
        </span>,
      );
      columns.forEach(col =>
        cells.push(
          <div key={`${row.label}-${col.label}`} style={{ display: 'flex', justifyContent: 'center' }}>
            <Checkbox label="Label" {...row.props} {...col.extra} />
          </div>,
        ),
      );
    });

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(3, 120px)', gap: 12, alignItems: 'center' }}>
        {cells}
      </div>
    );
  },
};
