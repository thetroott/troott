import type { AuthState } from './auth.types';

export const authInitial: AuthState = {
    token: null,
    userId: '',
    userType: '',
    user: {},
    isLoggedIn: false,
    isBootstrapping: true,
    isFirstTimeUser: true,
    error: null,
    roles: [],
    permissions: [],
    twoFactorEnabled: false,
    accountLocked: false,
    accountLockReason: null,
    tokenExpiresAt: null,
    tokenVersion: 0,
    mustChangePassword: false,
    anonymous: {
        isAnonymous: false,
        teaserQuotaRemaining: 0,
        teaserQuotaResetAt: null,
    },
};
