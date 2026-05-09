import {
    createContext,
    useContext,
    useEffect,
    useReducer,
    type Dispatch,
    type ReactNode,
} from 'react';
import { troottAPIClient } from '@troott/api-client';
import { GET_USER } from '../../helpers/types';
import { authReducer } from './auth.reducer';
import { authInitial } from './auth.seed';
import type { AuthAction, AuthState } from './auth.types';

const AuthStateContext = createContext<AuthState | null>(null);
const AuthDispatchContext = createContext<Dispatch<AuthAction> | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, authInitial);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await troottAPIClient().auth.fetchMe();
                const body = res as { error?: boolean; data?: unknown };
                if (!cancelled && body && !body.error && body.data) {
                    dispatch({
                        type: GET_USER,
                        payload: body.data as AuthState['user'],
                    });
                }
            } catch {
                /* SDK not initialized or offline */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <AuthDispatchContext.Provider value={dispatch}>
            <AuthStateContext.Provider value={state}>
                {children}
            </AuthStateContext.Provider>
        </AuthDispatchContext.Provider>
    );
}

export function useAuthState(): AuthState {
    const s = useContext(AuthStateContext);
    if (s == null) {
        throw new Error(
            'auth: state used outside <TroottStateProvider> (or missing AuthProvider).',
        );
    }
    return s;
}

export function useAuthDispatch(): Dispatch<AuthAction> {
    const d = useContext(AuthDispatchContext);
    if (d == null) {
        throw new Error(
            'auth: dispatch used outside <TroottStateProvider> (or missing AuthProvider).',
        );
    }
    return d;
}
