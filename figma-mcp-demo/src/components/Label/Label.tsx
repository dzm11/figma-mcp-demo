import React from 'react';
import styles from './Label.module.css';
import type { LabelProps } from './Label.types.ts';

/** Lock icon — exact path from Figma "Other / label / locked" (6×9 viewBox) */
const LockIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="9"
    viewBox="0 0 6 9"
    width="6"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4V2C4 1.57707 3.89464 1.35168 3.77148 1.22852C3.64832 1.10536 3.42293 1 3 1C2.57707 1 2.35168 1.10536 2.22852 1.22852C2.10536 1.35168 2 1.57707 2 2V4H4ZM5 4C5.55228 4 6 4.44772 6 5V8C6 8.55228 5.55228 9 5 9H1C0.447715 9 0 8.55228 0 8V5C0 4.44772 0.447715 4 1 4V2C1 1.42293 1.14464 0.898324 1.52148 0.521484C1.89832 0.144645 2.42293 0 3 0C3.57707 0 4.10168 0.144644 4.47852 0.521484C4.85536 0.898324 5 1.42293 5 2V4Z"
      fill="currentColor"
    />
  </svg>
);

export const Label: React.FC<LabelProps> = ({
  children,
  color = 'gray',
  isStrong = false,
  type = 'default',
}) => (
  <span
    className={styles.label}
    style={
      {
        '--_label-bg': isStrong
          ? `var(--label-${color})`
          : `var(--label-${color}-container)`,
        '--_label-color': isStrong
          ? `var(--label-on-${color})`
          : `var(--label-on-${color}-container)`,
      } as React.CSSProperties
    }
  >
    {type === 'icon' && (
      <span className={styles.iconSlot}>
        <LockIcon />
      </span>
    )}
    <span className={styles.text}>{children}</span>
  </span>
);
