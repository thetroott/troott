import { create } from 'zustand';
import type { IRegisterFormErrors } from '@/utils/interfaces.util';
import { UserType } from '@/utils/enums.util';
import type { RegisterUserDTO } from '@/dtos/auth.dto';

interface PasswordStrength {
    score: number;
    feedback: string[];
    label: string;
}

interface TouchedState {
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    password: boolean;
}

interface RegisterState {
    formData: RegisterUserDTO;
    errors: IRegisterFormErrors;
    touched: TouchedState;
    showPassword: boolean;
    passwordStrength: PasswordStrength;

    setField: (field: keyof RegisterUserDTO, value: string) => void;
    setErrors: (errors: Partial<IRegisterFormErrors>) => void;
    setTouched: (field: keyof TouchedState, touched?: boolean) => void;
    togglePassword: () => void;
    setPasswordStrength: (strength: PasswordStrength) => void;
    reset: () => void;
}

export const useRegisterStore = create<RegisterState>((set) => ({
    formData: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        userType: UserType.MINISTER,
    },
    errors: {},
    touched: {
        firstName: false,
        lastName: false,
        email: false,
        password: false,
    },
    showPassword: false,
    passwordStrength: {
        score: 0,
        feedback: [],
        label: 'Very Weak',
    },

    setField: (field, value) =>
        set((state) => ({
            formData: { ...state.formData, [field]: value },
        })),

    setErrors: (errors) =>
        set((state) => ({
            errors: { ...state.errors, ...errors },
        })),

    setTouched: (field, touched = true) =>
        set((state) => ({
            touched: { ...state.touched, [field]: touched },
        })),

    togglePassword: () =>
        set((state) => ({
            showPassword: !state.showPassword,
        })),

    setPasswordStrength: (strength) =>
        set(() => ({
            passwordStrength: strength,
        })),

    reset: () =>
        set({
            formData: {
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                userType: UserType.MINISTER,
            },
            errors: {},
            touched: {
                firstName: false,
                lastName: false,
                email: false,
                password: false,
            },
            showPassword: false,
            passwordStrength: {
                score: 0,
                feedback: [],
                label: 'Very Weak',
            },
        }),
}));
