import React, { useEffect, useRef, useState } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { Label } from '../Label/Label';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './DemoCard.module.css';
import type { DemoCardProps } from './DemoCard.types.ts';

const UndoIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.333 4.167a6.667 6.667 0 1 1-4.628 11.467"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
    <path
      d="M8.333 1.667 4.167 4.167l4.166 2.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

export const DemoCard: React.FC<DemoCardProps> = ({ resetDelayMs = 2200 }) => {
  const [isResetting, setIsResetting] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleReset = () => {
    if (isResetting) {
      return;
    }

    setIsResetting(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsResetting(false);
      timeoutRef.current = null;
    }, resetDelayMs);
  };

  return (
    <div className={[styles.card, isResetting && styles.isResetting].filter(Boolean).join(' ')}>
      <div className={styles.content}>
        <div className={styles.labelAndTooltip}>
          <Label color="blue" isStrong type="default">
            Demo
          </Label>
          <div className={styles.tooltipSlot}>
            <Tooltip arrow="bottom" showDescription tone="default" />
          </div>
        </div>

        <Avatar
          showSubtext
          showText
          size="m"
          state="default"
          subtext="Created by:"
          text="John Doe"
          type="image"
        />
      </div>

      <Button
        icon={<UndoIcon />}
        size="m"
        state={isResetting ? 'loading' : 'default'}
        type="secondary"
        onClick={handleReset}
      >
        Reset
      </Button>
    </div>
  );
};
