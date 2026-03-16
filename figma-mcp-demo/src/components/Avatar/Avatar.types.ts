export type AvatarSize = 'xs' | 's' | 'm' | 'l' | 'xl';
export type AvatarType = 'initials' | 'inverse' | 'company' | 'image';
export type AvatarState = 'default' | 'hover';

export interface AvatarProps {
  className?: string;
  size?: AvatarSize;
  type?: AvatarType;
  state?: AvatarState;
  showText?: boolean;
  showSubtext?: boolean;
  text?: string;
  subtext?: string;
  initials?: string;
  imageSrc?: string;
  companyLogoSrc?: string;
  alt?: string;
}
