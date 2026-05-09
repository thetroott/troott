import type { AuthAction, AuthState } from './auth.types';

export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'GET_USER':
        case 'SET_USER': {
            const u = (action.payload ?? {}) as Record<string, unknown>;
            const rawId = u.id ?? u._id;
            const id = typeof rawId === 'string' ? rawId : state.userId;
            const ut =
                typeof u.userType === 'string' ? u.userType : state.userType;
            return {
                ...state,
                user: action.payload as AuthState['user'],
                userId: id,
                userType: ut,
                isLoggedIn: Object.keys(u).length > 0,
            };
        }
        case 'SET_USER_TYPE':
            return { ...state, userType: action.payload };
        case 'SET_TOKEN':
            return { ...state, token: action.payload };
        case 'SET_BOOTSTRAPPING':
            return { ...state, isBootstrapping: action.payload };
        case 'SET_FIRST_TIME':
            return { ...state, isFirstTimeUser: action.payload };
        case 'SET_ROLES':
            return { ...state, roles: action.payload };
        case 'SET_PERMISSIONS':
            return { ...state, permissions: action.payload };
        case 'SET_TWO_FACTOR':
            return { ...state, twoFactorEnabled: action.payload };
        case 'SET_ACCOUNT_LOCKED':
            return {
                ...state,
                accountLocked: action.payload,
                accountLockReason:
                    action.reason !== undefined
                        ? action.reason
                        : state.accountLockReason,
            };
        case 'SET_TOKEN_META':
            return { ...state, ...action.payload };
        case 'SET_ANONYMOUS':
            return {
                ...state,
                anonymous: { ...state.anonymous, ...action.payload },
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
}
