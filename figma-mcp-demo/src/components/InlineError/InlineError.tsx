import React from 'react';
import styles from './InlineError.module.css';
import type { InlineErrorProps } from './InlineError.types.ts';

/** Error / warning icon (16×16) matching Figma "States / error, warning" */
const ErrorIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5V9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    <circle cx="8" cy="11.5" fill="currentColor" r="0.75" />
  </svg>
);

export const InlineError: React.FC<InlineErrorProps> = ({ message }) => (
  <div className={styles.wrapper} role="alert">
    <span aria-hidden="true" className={styles.iconSlot}>
      <ErrorIcon />
    </span>
    <p className={styles.message}>{message}</p>
  </div>
);
