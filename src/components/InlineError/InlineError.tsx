import React from 'react';
import { IconViewError } from '../../assets/icons/SVGR/index';
import styles from './InlineError.module.css';
import type { InlineErrorProps } from './InlineError.types.ts';

export const InlineError: React.FC<InlineErrorProps> = ({ message }) => (
  <div className={styles.wrapper} role="alert">
    <span aria-hidden="true" className={[styles.iconSlot, 'text-slot-20'].join(' ')}>
      <IconViewError height={16} width={16} />
    </span>
    <p className={[styles.message, 'body-md-14-regular'].join(' ')}>{message}</p>
  </div>
);
