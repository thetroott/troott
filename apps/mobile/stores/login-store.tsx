import { create } from 'zustand';

interface AuthState {
    formData: { email: string; password: string };

    touched: { email: boolean; password: boolean };
    showPassword: boolean;
    passwordStrength: { score: number; feedback: string[]; label: string };

    setField: (field: 'email' | 'password', value: string) => void;
    setTouched: (field: 'email' | 'password') => void;

    togglePassword: () => void;
    setPasswordStrength: (strength: AuthState['passwordStrength']) => void;
    reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    formData: { email: '', password: '' },
    errors: {},
    touched: { email: false, password: false },
    showPassword: false,
    passwordStrength: { score: 0, feedback: [], label: 'Very Weak' },

    setField: (field, value) =>
        set((state) => ({
            formData: { ...state.formData, [field]: value },
        })),

    setTouched: (field) =>
        set((state) => ({ touched: { ...state.touched, [field]: true } })),

    togglePassword: () =>
        set((state) => ({ showPassword: !state.showPassword })),

    setPasswordStrength: (strength) => set({ passwordStrength: strength }),

    reset: () =>
        set({
            formData: { email: '', password: '' },

            touched: { email: false, password: false },
            showPassword: false,
            passwordStrength: { score: 0, feedback: [], label: 'Very Weak' },
        }),
}));
