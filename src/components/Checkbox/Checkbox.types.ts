export interface CheckboxProps {
  /** Three-state value: true = checked, false = unchecked, undefined = uses defaultChecked */
  checked?: boolean;
  /** Uncontrolled initial value */
  defaultChecked?: boolean;
  /** Shows a dash icon instead of a tick when in the checked visual state */
  indeterminate?: boolean;
  /** Critical/error visual state — shows red border and optional error message */
  critical?: boolean;
  /** Disables interaction */
  disabled?: boolean;
  /** Label text shown beside the checkbox */
  label?: string;
  /** Error text shown below the checkbox in critical state */
  errorMessage?: string;
  onChange?: (checked: boolean) => void;
  id?: string;
  name?: string;
  value?: string;
  className?: string;
}
