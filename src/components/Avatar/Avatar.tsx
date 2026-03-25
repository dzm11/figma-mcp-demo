import React from 'react';
import companyPlaceholder from '../../assets/Company Logo.svg';
import defaultAvatarImage from '../../assets/image-placeholder.png';
import styles from './Avatar.module.css';
import type { AvatarProps, AvatarSize } from './Avatar.types.ts';

const DEFAULT_INITIALS_BY_SIZE: Record<AvatarSize, string> = {
  xs: 'XS',
  s: 'SM',
  m: 'MD',
  l: 'LG',
  xl: 'XL',
};

export const Avatar: React.FC<AvatarProps> = ({
  alt = '',
  className,
  companyLogoSrc = companyPlaceholder,
  imageSrc = defaultAvatarImage,
  initials,
  showSubtext = false,
  showText = false,
  size = 'xl',
  state = 'default',
  subtext = 'Label:',
  text = 'Text',
  type = 'initials',
}) => {
  const resolvedInitials = initials ?? DEFAULT_INITIALS_BY_SIZE[size];

  const rootClassName = [
    styles.root,
    styles[`size-${size}`],
    state === 'hover' && styles['state-hover'],
    showText ? styles.withText : styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const avatarClassName = [styles.avatar, styles[`avatar-${type}`]].join(' ');
  const initialsTypographyClassName = {
    xs: 'body-xs-10-bold',
    s: 'body-sm-12-bold',
    m: 'body-md-14-semibold',
    l: 'body-md-14-semibold',
    xl: 'body-lg-16-semibold',
  }[size];

  const initialsClassName = [styles.initials, 'text-inline-center', initialsTypographyClassName].join(' ');

  return (
    <div className={rootClassName}>
      <span className={avatarClassName}>
        {(type === 'initials' || type === 'inverse') && (
          <span aria-hidden="true" className={initialsClassName}>
            {resolvedInitials}
          </span>
        )}
        {type === 'company' && (
          <img alt="" className={styles.companyLogo} src={companyLogoSrc} />
        )}
        {type === 'image' && <img alt={alt} className={styles.image} src={imageSrc} />}
      </span>

      {showText && (
          <span className={[styles.textGroup, 'body-md-14-regular'].join(' ')}>
          {showSubtext && <span className={styles.subtext}>{subtext}</span>}
          <span className={styles.text}>{text}</span>
        </span>
      )}
    </div>
  );
};
