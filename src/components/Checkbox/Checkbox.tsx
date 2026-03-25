import React, { useRef, useEffect } from 'react';
import { IconDash } from '../../assets/icons/SVGR/IconDash';
import { IconTick } from '../../assets/icons/SVGR/IconTick';
import { IconViewError } from '../../assets/icons/SVGR/index';
import styles from './Checkbox.module.css';
import type { CheckboxProps } from './Checkbox.types.ts';

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
        <span aria-hidden="true" className={[styles.box, 'text-inline-center', 'text-size-16'].join(' ')}>
          {indeterminate ? (
            <IconDash className={[styles.icon, 'text-size-16'].join(' ')} height={16} width={16} />
          ) : (
            <IconTick className={[styles.icon, 'text-size-16'].join(' ')} height={16} width={16} />
          )}
        </span>

        {label && <span className={[styles.label, 'body-md-14-regular'].join(' ')}>{label}</span>}
      </label>

      {critical && errorMessage && (
        <div className={styles.errorRow}>
          <span className={[styles.errorIcon, 'text-slot-20'].join(' ')}>
            <IconViewError height={16} width={16} />
          </span>
          <span className={[styles.errorMessage, 'body-md-14-regular'].join(' ')}>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
