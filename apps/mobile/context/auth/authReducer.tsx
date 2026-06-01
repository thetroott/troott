import { UserType } from '@/models/User.model';

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
import type { AuthAction, AuthReducerState } from './types';

const defaultPasswordStrength = () => ({
    score: 0,
    feedback: [] as string[],
    label: 'Very Weak',
});

export const initialRegisterState = (): AuthReducerState['register'] => ({
    formData: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        userType: UserType.LISTENER,
    },
    email: '',
    userEmail: false,
    touched: {
        firstName: false,
        lastName: false,
        email: false,
        password: false,
    },
    showPassword: false,
    passwordStrength: defaultPasswordStrength(),
});

export const initialForgotPasswordState =
    (): AuthReducerState['forgotPassword'] => ({
        step: 'email',
        formData: { email: '', otp: Array(6).fill('') },
        errors: {},
        touched: { email: false, otp: false },
        resendCountdown: 0,
    });

export const initialAuthState = (): AuthReducerState => ({
    register: initialRegisterState(),
    forgotPassword: initialForgotPasswordState(),
});

const authReducer = (
    state: AuthReducerState,
    action: AuthAction,
): AuthReducerState => {
    switch (action.type) {
        case REGISTER_SET_EMAIL:
            return {
                ...state,
                register: { ...state.register, email: action.payload },
            };
        case REGISTER_SET_USER_EMAIL:
            return {
                ...state,
                register: { ...state.register, userEmail: action.payload },
            };
        case REGISTER_SET_FIELD:
            return {
                ...state,
                register: {
                    ...state.register,
                    formData: {
                        ...state.register.formData,
                        [action.payload.field]: action.payload.value,
                    },
                },
            };
        case REGISTER_SET_TOUCHED:
            return {
                ...state,
                register: {
                    ...state.register,
                    touched: {
                        ...state.register.touched,
                        [action.payload.field]:
                            action.payload.touched ?? true,
                    },
                },
            };
        case REGISTER_TOGGLE_PASSWORD:
            return {
                ...state,
                register: {
                    ...state.register,
                    showPassword: !state.register.showPassword,
                },
            };
        case REGISTER_SET_PASSWORD_STRENGTH:
            return {
                ...state,
                register: {
                    ...state.register,
                    passwordStrength: action.payload,
                },
            };
        case REGISTER_RESET:
            return { ...state, register: initialRegisterState() };
        case FORGOT_SET_STEP:
            return {
                ...state,
                forgotPassword: { ...state.forgotPassword, step: action.payload },
            };
        case FORGOT_SET_FORM_DATA:
            return {
                ...state,
                forgotPassword: {
                    ...state.forgotPassword,
                    formData: {
                        ...state.forgotPassword.formData,
                        ...action.payload,
                    },
                },
            };
        case FORGOT_SET_ERRORS:
            return {
                ...state,
                forgotPassword: {
                    ...state.forgotPassword,
                    errors: {
                        ...state.forgotPassword.errors,
                        ...action.payload,
                    },
                },
            };
        case FORGOT_SET_TOUCHED:
            return {
                ...state,
                forgotPassword: {
                    ...state.forgotPassword,
                    touched: {
                        ...state.forgotPassword.touched,
                        ...action.payload,
                    },
                },
            };
        case FORGOT_SET_RESEND_COUNTDOWN:
            return {
                ...state,
                forgotPassword: {
                    ...state.forgotPassword,
                    resendCountdown: action.payload,
                },
            };
        case FORGOT_RESET:
            return {
                ...state,
                forgotPassword: initialForgotPasswordState(),
            };
        default:
            return state;
    }
};

export default authReducer;
