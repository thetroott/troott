import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    type ReactNode,
} from 'react';

import { getToken, storage } from '@/api/services/mmkv-storage';

import AuthContext from './authContext';
import authReducer, { initialAuthState } from './authReducer';
import {
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
import type {
    ForgotPasswordAuthValue,
    ForgotPasswordStep,
    IAuthContextValue,
    PasswordStrength,
    RegisterAuthValue,
    RegisterTouchedState,
} from './types';
import type { RegisterUserDTO } from '@/api/dtos/auth.dto';

export function AuthState({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, undefined, initialAuthState);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const token = await getToken();
            if (token || state.register.email?.trim()) {
                return;
            }
            const pending = await storage.getUserEmail();
            if (cancelled || !pending) return;
            dispatch({ type: REGISTER_SET_EMAIL, payload: pending });
            dispatch({
                type: REGISTER_SET_FIELD,
                payload: { field: 'email', value: pending },
            });
        })();

        return () => {
            cancelled = true;
        };
    }, [state.register.email]);

    const setEmail = useCallback((email: string) => {
        dispatch({ type: REGISTER_SET_EMAIL, payload: email });
    }, []);

    const setUserEmail = useCallback((isUserEmail: boolean) => {
        dispatch({ type: REGISTER_SET_USER_EMAIL, payload: isUserEmail });
    }, []);

    const setField = useCallback(
        (field: keyof RegisterUserDTO, value: string) => {
            dispatch({ type: REGISTER_SET_FIELD, payload: { field, value } });
        },
        [],
    );

    const setRegisterTouched = useCallback(
        (field: keyof RegisterTouchedState, touched = true) => {
            dispatch({
                type: REGISTER_SET_TOUCHED,
                payload: { field, touched },
            });
        },
        [],
    );

    const togglePassword = useCallback(() => {
        dispatch({ type: REGISTER_TOGGLE_PASSWORD });
    }, []);

    const setPasswordStrength = useCallback((strength: PasswordStrength) => {
        dispatch({ type: REGISTER_SET_PASSWORD_STRENGTH, payload: strength });
    }, []);

    const resetRegister = useCallback(() => {
        dispatch({ type: REGISTER_RESET });
    }, []);

    const setStep = useCallback((step: ForgotPasswordStep) => {
        dispatch({ type: FORGOT_SET_STEP, payload: step });
    }, []);

    const setFormData = useCallback(
        (data: Partial<{ email: string; otp: string[] }>) => {
            dispatch({ type: FORGOT_SET_FORM_DATA, payload: data });
        },
        [],
    );

    const setErrors = useCallback(
        (errors: Partial<{ email?: string; otp?: string }>) => {
            dispatch({ type: FORGOT_SET_ERRORS, payload: errors });
        },
        [],
    );

    const setForgotTouched = useCallback(
        (touched: Partial<{ email: boolean; otp: boolean }>) => {
            dispatch({ type: FORGOT_SET_TOUCHED, payload: touched });
        },
        [],
    );

    const setResendCountdown = useCallback((count: number) => {
        dispatch({ type: FORGOT_SET_RESEND_COUNTDOWN, payload: count });
    }, []);

    const resetForgotPassword = useCallback(() => {
        dispatch({ type: FORGOT_RESET });
    }, []);

    const register = useMemo<RegisterAuthValue>(
        () => ({
            ...state.register,
            setEmail,
            setUserEmail,
            setField,
            setTouched: setRegisterTouched,
            togglePassword,
            setPasswordStrength,
            reset: resetRegister,
        }),
        [
            state.register,
            setEmail,
            setUserEmail,
            setField,
            setRegisterTouched,
            togglePassword,
            setPasswordStrength,
            resetRegister,
        ],
    );

    const forgotPassword = useMemo<ForgotPasswordAuthValue>(
        () => ({
            ...state.forgotPassword,
            setStep,
            setFormData,
            setErrors,
            setTouched: setForgotTouched,
            setResendCountdown,
        }),
        [
            state.forgotPassword,
            setStep,
            setFormData,
            setErrors,
            setForgotTouched,
            setResendCountdown,
        ],
    );

    const value = useMemo<IAuthContextValue>(
        () => ({ register, forgotPassword }),
        [register, forgotPassword],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuthContext(): IAuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error(
            'useAuthContext must be used within TroottProviders (AuthState)',
        );
    }
    return ctx;
}

export function useRegisterAuth(): RegisterAuthValue {
    return useAuthContext().register;
}

export function useForgotPasswordAuth(): ForgotPasswordAuthValue {
    return useAuthContext().forgotPassword;
}
