export type TooltipArrow = 'top' | 'bottom';
export type TooltipTone = 'default' | 'inverse';

export interface TooltipProps {
  /** Main heading shown on the first line. */
  title?: string;
  /** Optional supporting copy shown on the second line. */
  description?: string;
  /** Controls whether the second line is rendered. */
  showDescription?: boolean;
  /** Color variant from Figma. */
  tone?: TooltipTone;
  /** Which side the pointer appears on. */
  arrow?: TooltipArrow;
  className?: string;
}
