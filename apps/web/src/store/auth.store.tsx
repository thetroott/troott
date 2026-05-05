import storage from '@/utils/storage.util';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const collection = {};
const STORAGE_KEY = 'isFirstTime';
const isFirstTime = !storage.fetch(STORAGE_KEY);

interface AuthState {
    users: {};
    user: {};
    userType: string;
    isAuthenticated: boolean;
    loading: boolean;
    token: string | null;
    isFirstTimeUser: boolean;

    // Actions
    setUser: (user: {}) => void;
    setUserType: (userType: string) => void;
    setFirstTimeUser: (value: boolean) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
    clearAuth: () => void;
}

// NOTE: Renamed to useAuthStore as the primary user/auth store
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: {},
            users: collection,
            userType: '',
            isAuthenticated: false,
            loading: false,
            token: null,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                }),
            setUserType: (userType) => set({ userType }),
            isFirstTimeUser: isFirstTime,
            setFirstTimeUser: (value) => {
                set({ isFirstTimeUser: value });
                if (!value) storage.keep(STORAGE_KEY, 'true');
            },

            setToken: (token) => set({ token }),

            setLoading: (loading) => set({ loading }),

            logout: () =>
                set({
                    user: {},
                    isAuthenticated: false,
                    token: null,
                }),

            clearAuth: () =>
                set({
                    user: {},
                    isAuthenticated: false,
                    token: null,
                    loading: false,
                }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);
