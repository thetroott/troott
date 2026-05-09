import type { TroottUser } from '../../helpers/interface';

export type RoleSummary = { id?: string; name?: string; slug?: string };

export interface AuthState {
    token: string | null;
    userId: string;
    userType: string;
    user: TroottUser | Record<string, unknown>;
    isLoggedIn: boolean;
    isBootstrapping: boolean;
    isFirstTimeUser: boolean;
    error: string | null;
    roles: RoleSummary[];
    permissions: unknown[];
    twoFactorEnabled: boolean;
    accountLocked: boolean;
    accountLockReason: string | null;
    tokenExpiresAt: string | null;
    tokenVersion: number;
    mustChangePassword: boolean;
    anonymous: {
        isAnonymous: boolean;
        teaserQuotaRemaining: number;
        teaserQuotaResetAt: string | null;
    };
}

export type AuthAction =
    | { type: 'GET_USER'; payload: TroottUser | Record<string, unknown> }
    | { type: 'SET_USER'; payload: TroottUser | Record<string, unknown> }
    | { type: 'SET_USER_TYPE'; payload: string }
    | { type: 'SET_TOKEN'; payload: string | null }
    | { type: 'SET_BOOTSTRAPPING'; payload: boolean }
    | { type: 'SET_FIRST_TIME'; payload: boolean }
    | { type: 'SET_ROLES'; payload: RoleSummary[] }
    | { type: 'SET_PERMISSIONS'; payload: unknown[] }
    | { type: 'SET_TWO_FACTOR'; payload: boolean }
    | { type: 'SET_ACCOUNT_LOCKED'; payload: boolean; reason?: string | null }
    | { type: 'SET_TOKEN_META'; payload: Partial<Pick<AuthState, 'tokenExpiresAt' | 'tokenVersion' | 'mustChangePassword'>> }
    | { type: 'SET_ANONYMOUS'; payload: Partial<AuthState['anonymous']> }
    | { type: 'SET_ERROR'; payload: string | null };
