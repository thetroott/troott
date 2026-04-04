import type { ChangeEvent } from "react";

export interface IPasswordField {
  label?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  autoComplete?: string;
  placeholder?: string;
  autoFocus?: boolean;
  fullWidth?: boolean;
  borderRadius?: string | number;
  color?: string;
  [key: string]: any;
}

export interface IEmailField {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  fullWidth?: boolean;
  borderRadius?: string | number;
  color?: string;
  [key: string]: any; // allows extension
}

export interface ITextInputField {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  fullWidth?: boolean;
  borderRadius?: string;
  color?: string;
  sx?: object;
}

export interface ITextAreaField {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  fullWidth?: boolean;
  borderRadius?: string;
  color?: string;
  rows?: number;
  sx?: object;
}

export interface IVCheckbox {
  label: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
}

export interface IRadioField {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  options: { label: string; value: string }[];
  error?: boolean;
  helperText?: string;
  row?: boolean;
}

export interface IOTPField {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  helperText?: string;
  borderRadius?: string;
  color?: string;
  disabled?: boolean;
}

export interface ISelectField {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: { value: string | number; label: string }[];
  error?: boolean;
  helperText?: string;
  autoFocus?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  borderRadius?: string | number;
  color?: string;
  disabled?: boolean;
}

export interface IMultiSelectField
  extends Omit<ISelectField, "value" | "onChange"> {
  value: (string | number)[];
  onChange: (e: React.ChangeEvent<{ value: unknown }>) => void;
  renderOption?: (option: { value: string; label: string }) => React.ReactNode;
}
