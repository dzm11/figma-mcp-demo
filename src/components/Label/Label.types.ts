export type LabelColor =
  | 'red'
  | 'gray'
  | 'yellow'
  | 'green'
  | 'black'
  | 'orange'
  | 'blue'
  | 'purple'
  | 'teal';

export interface LabelProps {
  /** Label text content */
  children: React.ReactNode;
  /** Color variant — controls background and text color */
  color?: LabelColor;
  /** Solid (strong) vs pastel (container) appearance */
  isStrong?: boolean;
  /** Show lock icon before text */
  type?: 'default' | 'icon';
}
