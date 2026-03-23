import React from 'react';
import styles from './Tooltip.module.css';
import type { TooltipProps } from './Tooltip.types.ts';

const DEFAULT_DESCRIPTION =
  'Legend says a complete profile attracts unicorns. Start yours and see if the legend is true!';

export const Tooltip: React.FC<TooltipProps> = ({
  title = 'Tooltip Text',
  description = DEFAULT_DESCRIPTION,
  showDescription = true,
  tone = 'inverse',
  arrow = 'bottom',
  className,
}) => {
  const rootClassName = [
    styles.root,
    styles[`tone-${tone}`],
    styles[`arrow-${arrow}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <div className={styles.surface}>
      <p className={styles.title}>{title}</p>
      {showDescription && description ? (
        <p className={styles.description}>{description}</p>
      ) : null}
    </div>
  );

  return (
    <div className={rootClassName} role="tooltip">
      {arrow === 'top' ? (
        <>
          <span aria-hidden="true" className={styles.arrowSlot}>
            <span className={styles.arrow} />
          </span>
          {content}
        </>
      ) : (
        <>
          {content}
          <span aria-hidden="true" className={styles.arrowSlot}>
            <span className={styles.arrow} />
          </span>
        </>
      )}
    </div>
  );
};
