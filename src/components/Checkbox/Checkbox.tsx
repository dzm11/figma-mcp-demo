import React, { useRef, useEffect } from 'react';
import dashIcon from '../../assets/dash.svg';
import tickIcon from '../../assets/tick.svg';
import styles from './Checkbox.module.css';
import type { CheckboxProps } from './Checkbox.types.ts';

/** Error icon for critical inline message (16×16) */
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

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked,
  indeterminate = false,
  critical = false,
  disabled = false,
  label,
  errorMessage,
  onChange,
  id,
  name,
  value,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // The native indeterminate property has no HTML attribute — must set via JS
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const wrapperClass = [
    styles.wrapper,
    critical && styles.critical,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const rowClass = [styles.row, disabled && styles.disabled]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      <label className={rowClass}>
        <input
          ref={inputRef}
          checked={checked}
          className={styles.input}
          defaultChecked={defaultChecked}
          disabled={disabled}
          id={id}
          name={name}
          type="checkbox"
          value={value}
          onChange={(e) => onChange?.(e.target.checked)}
        />

        {/* Custom visual box — styled via CSS using :checked/:indeterminate on the adjacent input */}
        <span aria-hidden="true" className={styles.box}>
          <img
            alt=""
            className={styles.icon}
            src={indeterminate ? dashIcon : tickIcon}
          />
        </span>

        {label && <span className={styles.label}>{label}</span>}
      </label>

      {critical && errorMessage && (
        <div className={styles.errorRow}>
          <span className={styles.errorIcon}>
            <ErrorIcon />
          </span>
          <span className={styles.errorMessage}>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
