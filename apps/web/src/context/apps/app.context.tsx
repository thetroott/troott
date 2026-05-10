import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { appReducer } from './app.reducer';
import type { AppAction } from './app.actions';
import type { IAppState } from '../../utils/app.util';
import initialState from '../../utils/app.util';
import storage from '../../utils/storage.util';
import { DraftProvider } from '../draft/draft.context';
import { UploadProvider } from '../upload/upload.context';

const getInitialTheme = (): 'light' | 'dark' | 'system' => {
    try {
        const storedTheme = storage.fetch('theme');
        if (
            storedTheme === 'light' ||
            storedTheme === 'dark' ||
            storedTheme === 'system'
        ) {
            return storedTheme;
        }
    } catch (error) {
        console.error('Could not read theme from localStorage', error);
    }
    // Fallback to system preference if nothing stored or error
    // Check if window is defined (for SSR or build environments)
    if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersDarkMode = window.matchMedia(
            '(prefers-color-scheme: dark)',
        ).matches;
        return prefersDarkMode ? 'dark' : 'light';
    }
    return 'system';
};

const AppContext = createContext<{
    state: IAppState;
    dispatch: React.Dispatch<AppAction>;
}>({
    state: { ...initialState, theme: { mode: getInitialTheme() } },
    dispatch: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(appReducer, {
        ...initialState,
        theme: { mode: getInitialTheme() },
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');

        if (state.theme.mode === 'system') {
            const systemTheme = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches
                ? 'dark'
                : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(state.theme.mode);
        }

        storage.keep('theme', state.theme.mode);
    }, [state.theme.mode]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            <UploadProvider>
                <DraftProvider>{children}</DraftProvider>
            </UploadProvider>
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
