import React from 'react';
import { IconChevronDown } from '../../assets/icons/SVGR/IconChevronDown';
import styles from './Button.module.css';
import type { ButtonProps } from './Button.types.ts';

export const Button: React.FC<ButtonProps> = ({
  type = 'primary',
  size = 'm',
  state = 'default',
  disclosure = false,
  icon,
  children,
  onClick,
}) => {
  const isDisabled = state === 'disabled';
  const isLoading = state === 'loading';
  const isCritical = state === 'critical';

  return (
    <button
      aria-busy={isLoading}
      className={[
        styles.button,
        'body-md-14-bold',
        styles[`type-${type}`],
        styles[`size-${size}`],
        isLoading && styles.loading,
        isCritical && styles.critical,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      type="button"
    >
      {/* Icon slot — 20×20px, shown before label */}
      {icon && (
        <span aria-hidden="true" className={[styles.iconSlot, 'text-slot-20'].join(' ')}>
          {icon}
        </span>
      )}

      {/* Text slot — 6px inner horizontal padding per Figma */}
      <span className={styles.textSlot}>{children}</span>

      {/* Disclosure slot — chevron shown after label */}
      {disclosure && (
        <span aria-hidden="true" className={[styles.disclosureSlot, 'text-slot-20'].join(' ')}>
          <IconChevronDown height={20} width={20} />
        </span>
      )}
    </button>
  );
};