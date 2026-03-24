import React from 'react';
import styles from './Button.module.css';
import type { ButtonProps } from './Button.types.ts';

/** Chevron icon matching Figma "Arrows / normal / down" (20×20) */
const ChevronDown = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

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
          <ChevronDown />
        </span>
      )}
    </button>
  );
};