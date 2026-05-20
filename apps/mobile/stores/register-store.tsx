import { create } from '@/lib/zstore';

import { UserType } from '@/models/User.model';
import type { RegisterUserDTO } from '@/api/dtos/auth.dto';

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
    email: string;
    userEmail: boolean;
    touched: TouchedState;
    showPassword: boolean;
    passwordStrength: PasswordStrength;

    setEmail: (email: string) => void;
    setUserEmail: (isUserEmail: boolean) => void;
    setField: (field: keyof RegisterUserDTO, value: string) => void;
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
    email: '',
    userEmail: false,

    setEmail: (email) => set({ email: email }),
    setUserEmail: (isUserEmail) => set({ userEmail: isUserEmail }),
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
