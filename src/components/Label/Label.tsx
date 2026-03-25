import React from 'react';
import { IconLockOn } from '../../assets/icons/SVGR/index';
import styles from './Label.module.css';
import type { LabelProps } from './Label.types.ts';

export const Label: React.FC<LabelProps> = ({
  children,
  color = 'gray',
  isStrong = false,
  type = 'default',
}) => (
  <span
    className={[styles.label, 'body-xs-10-bold'].join(' ')}
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
      <span className={[styles.iconSlot, 'text-inline-center'].join(' ')}>
        <IconLockOn aria-hidden="true" height={10} width={10} />
      </span>
    )}
    <span className={styles.text}>{children}</span>
  </span>
);
