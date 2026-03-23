import type React from 'react';

export type ButtonSize = 'l' | 'm' | 's';
export type ButtonType = 'primary' | 'outlined' | 'secondary' | 'tertiary';

/**
 * Button state
 * - 'default': Normal interactive state (hover/active/focus handled by CSS)
 * - 'disabled': Non-interactive, visually muted
 * - 'loading': Shows spinner, non-interactive
 * - 'critical': Destructive action styling
 */
export type ButtonState = 'default' | 'disabled' | 'loading' | 'critical';

export interface ButtonProps {
  /**
   * Button type/variant
   * @default 'primary'
   */
  type?: ButtonType;
  /**
   * Button size — L: 12px padding, M: 8px, S: 4px (vertical)
   * @default 'm'
   */
  size?: ButtonSize;
  /**
   * Button state
   * @default 'default'
   */
  state?: ButtonState;
  /**
   * Show dropdown chevron after label
   * @default false
   */
  disclosure?: boolean;
  /**
   * Icon element shown before the label (20×20px slot)
   */
  icon?: React.ReactNode;
  /**
   * Button content
   */
  children: React.ReactNode;
  /**
   * Click handler
   */
  onClick?: () => void;
}