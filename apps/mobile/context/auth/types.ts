import type { RegisterUserDTO } from '@/api/dtos/auth.dto';
import type {
    FORGOT_RESET,
    FORGOT_SET_ERRORS,
    FORGOT_SET_FORM_DATA,
    FORGOT_SET_RESEND_COUNTDOWN,
    FORGOT_SET_STEP,
    FORGOT_SET_TOUCHED,
    REGISTER_RESET,
    REGISTER_SET_EMAIL,
    REGISTER_SET_FIELD,
    REGISTER_SET_PASSWORD_STRENGTH,
    REGISTER_SET_TOUCHED,
    REGISTER_SET_USER_EMAIL,
    REGISTER_TOGGLE_PASSWORD,
} from '../types';

export interface PasswordStrength {
    score: number;
    feedback: string[];
    label: string;
}

export interface RegisterTouchedState {
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    password: boolean;
}

export interface RegisterSliceState {
    formData: RegisterUserDTO;
    email: string;
    userEmail: boolean;
    touched: RegisterTouchedState;
    showPassword: boolean;
    passwordStrength: PasswordStrength;
}

export type ForgotPasswordStep = 'email' | 'otp' | 'success';

export interface ForgotPasswordSliceState {
    step: ForgotPasswordStep;
    formData: { email: string; otp: string[] };
    errors: { email?: string; otp?: string };
    touched: { email: boolean; otp: boolean };
    resendCountdown: number;
}

export interface IRegisterAuthActions {
    setEmail: (email: string) => void;
    setUserEmail: (isUserEmail: boolean) => void;
    setField: (field: keyof RegisterUserDTO, value: string) => void;
    setTouched: (field: keyof RegisterTouchedState, touched?: boolean) => void;
    togglePassword: () => void;
    setPasswordStrength: (strength: PasswordStrength) => void;
    reset: () => void;
}

export interface IForgotPasswordAuthActions {
    setStep: (step: ForgotPasswordStep) => void;
    setFormData: (data: Partial<ForgotPasswordSliceState['formData']>) => void;
    setErrors: (errors: Partial<ForgotPasswordSliceState['errors']>) => void;
    setTouched: (touched: Partial<ForgotPasswordSliceState['touched']>) => void;
    setResendCountdown: (count: number) => void;
}

export type RegisterAuthValue = RegisterSliceState & IRegisterAuthActions;

/** @deprecated Use RegisterAuthValue — kept for imports from forgot-password-store migration */
export type IForgotPasswordStore = ForgotPasswordSliceState &
    IForgotPasswordAuthActions;

export type ForgotPasswordAuthValue = ForgotPasswordSliceState &
    IForgotPasswordAuthActions;

export interface AuthReducerState {
    register: RegisterSliceState;
    forgotPassword: ForgotPasswordSliceState;
}

export interface IAuthContextValue {
    register: RegisterAuthValue;
    forgotPassword: ForgotPasswordAuthValue;
}

export type AuthAction =
    | { type: typeof REGISTER_SET_EMAIL; payload: string }
    | { type: typeof REGISTER_SET_USER_EMAIL; payload: boolean }
    | {
          type: typeof REGISTER_SET_FIELD;
          payload: { field: keyof RegisterUserDTO; value: string };
      }
    | {
          type: typeof REGISTER_SET_TOUCHED;
          payload: { field: keyof RegisterTouchedState; touched?: boolean };
      }
    | { type: typeof REGISTER_TOGGLE_PASSWORD }
    | { type: typeof REGISTER_SET_PASSWORD_STRENGTH; payload: PasswordStrength }
    | { type: typeof REGISTER_RESET }
    | { type: typeof FORGOT_SET_STEP; payload: ForgotPasswordStep }
    | {
          type: typeof FORGOT_SET_FORM_DATA;
          payload: Partial<{ email: string; otp: string[] }>;
      }
    | {
          type: typeof FORGOT_SET_ERRORS;
          payload: Partial<{ email?: string; otp?: string }>;
      }
    | {
          type: typeof FORGOT_SET_TOUCHED;
          payload: Partial<{ email: boolean; otp: boolean }>;
      }
    | { type: typeof FORGOT_SET_RESEND_COUNTDOWN; payload: number }
    | { type: typeof FORGOT_RESET };
