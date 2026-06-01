import { useCallback, useEffect, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { router, usePathname, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import type { IAPIResponse } from '@/api/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import {
    useContextType,
    useForgotPasswordAuth,
    useRegisterAuth,
} from '@/context';
import { GET_LOGGEDIN_USER } from '@/context/types';
import type { SessionUser } from '@/context/user/types';
import { ApiError } from '@/api/errors';
import { getUserFriendlyMessage } from '@/api/errors/messages';
import useGoTo from '../shared/useGoTo';
import secureStorage from '../../services/secure-storage';
import {
    clearTokens,
    getToken,
    mmkvStateStorage,
    storage,
    storeToken,
} from '../../services/mmkv-storage';
import api from '../../api';
import type {
    ActivateDTO,
    ChangePasswordDTO,
    ForgotPasswordDTO,
    LoginDTO,
    RegisterUserDTO,
    ResendOtpDTO,
    ResetPasswordDTO,
    VerifyOtpDTO,
} from '../../dtos/auth.dto';
import { queryKeys } from '../../query-keys';
import {
    isListenerOnboardingComplete,
    listenerOnboardingRoute,
} from './useOnboardingGuard';
import { UserType } from '@/models/User.model';

function firstErrorMessage(errors: unknown): string | null {
    if (!Array.isArray(errors) || errors.length === 0) {
        return null;
    }
    const first = errors[0];
    if (typeof first === 'string' && first.trim()) {
        return first.trim();
    }
    if (first && typeof first === 'object' && 'message' in first) {
        const m = (first as { message?: unknown }).message;
        if (typeof m === 'string' && m.trim()) {
            return m.trim();
        }
    }
    return null;
}

/** Human-readable message from Troott API envelope. */
export function apiErrorMessage(response: {
    message?: unknown;
    errors?: unknown;
    data?: unknown;
}): string {
    if (typeof response.message === 'string' && response.message.trim()) {
        return response.message.trim();
    }
    const fromErrors = firstErrorMessage(response.errors);
    if (fromErrors) {
        return fromErrors;
    }
    if (typeof response.data === 'string' && response.data.trim()) {
        return response.data.trim();
    }
    return 'Something went wrong';
}

function isApiEnvelope(value: unknown): value is {
    error?: boolean;
    message?: unknown;
    status?: number;
} {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    return 'error' in value || 'status' in value || 'message' in value;
}

function handleMutationError(error: unknown) {
    if (error instanceof ApiError) {
        toast.error(getUserFriendlyMessage(error));
        return;
    }

    if (isApiEnvelope(error) && 'error' in error) {
        toast.error(apiErrorMessage(error as IAPIResponse));
        return;
    }

    const err = error as {
        response?: { data?: { errors?: unknown[]; message?: string } };
        message?: string;
    };
    const fromAxios =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        err?.message;
    toast.error(
        typeof fromAxios === 'string' && fromAxios.trim()
            ? fromAxios
            : 'Something went wrong',
    );
}

const PENDING_STABLE_TARGET_KEY = '@troott/pending_stable_target_v1';

type PendingStableTarget =
    | { kind: 'sermon'; id: string }
    | { kind: 'playlist'; id: string }
    | { kind: 'minister'; id: string };

function parseStableTargetFromUrl(url: string): PendingStableTarget | null {
    if (!url || typeof url !== 'string') {
        return null;
    }

    const sermon = url.match(/\/sermons?\/([^/?#]+)/i);
    if (sermon?.[1]) {
        return { kind: 'sermon', id: decodeURIComponent(sermon[1]) };
    }

    const playlist = url.match(/\/playlists?\/([^/?#]+)/i);
    if (playlist?.[1]) {
        return { kind: 'playlist', id: decodeURIComponent(playlist[1]) };
    }

    const minister = url.match(/\/ministers?\/([^/?#]+)/i);
    if (minister?.[1]) {
        return { kind: 'minister', id: decodeURIComponent(minister[1]) };
    }

    return null;
}

export async function setPendingStableTargetFromUrl(
    url: string,
): Promise<void> {
    const target = parseStableTargetFromUrl(url);
    if (!target) {
        return;
    }
    mmkvStateStorage.setItem(PENDING_STABLE_TARGET_KEY, JSON.stringify(target));
}

async function getAndClearPendingStableTarget(): Promise<PendingStableTarget | null> {
    const rawMaybe = mmkvStateStorage.getItem(PENDING_STABLE_TARGET_KEY);
    const raw = await Promise.resolve(rawMaybe);
    if (!raw) {
        return null;
    }
    mmkvStateStorage.removeItem(PENDING_STABLE_TARGET_KEY);
    try {
        return JSON.parse(raw) as PendingStableTarget;
    } catch {
        return null;
    }
}

export async function resolvePostAuthPath(
    user: SessionUser,
): Promise<string> {
    const onboarding = user ? listenerOnboardingRoute(user) : null;
    if (onboarding) {
        return onboarding;
    }

    const pending = await getAndClearPendingStableTarget();
    if (pending?.kind === 'sermon') {
        return `/sermon/${pending.id}`;
    }
    if (pending?.kind === 'playlist') {
        return `/playlist/${pending.id}`;
    }
    if (pending?.kind === 'minister') {
        return `/minister/${pending.id}`;
    }

    return '/(tabs)/home';
}

export async function navigatePostAuth(user: SessionUser): Promise<void> {
    const path = await resolvePostAuthPath(user);
    router.replace(path as never);
}

export async function replaceWithPendingTargetOrHome(
    user?: SessionUser | null,
): Promise<void> {
    if (user == null) {
        const pending = await getAndClearPendingStableTarget();
        if (pending?.kind === 'sermon') {
            router.replace(`/sermon/${pending.id}`);
            return;
        }
        if (pending?.kind === 'playlist') {
            router.replace(`/playlist/${pending.id}`);
            return;
        }
        if (pending?.kind === 'minister') {
            router.replace(`/minister/${pending.id}`);
            return;
        }
        router.replace('/(tabs)/home');
        return;
    }

    if (typeof user === 'object' && !isListenerOnboardingComplete(user)) {
        await navigatePostAuth(user);
        return;
    }

    await navigatePostAuth(user);
}

function authRequestFailed(payload: IAPIResponse): boolean {
    return payload.error === true || payload.status >= 400;
}

async function clearLocalSession(
    queryClient: ReturnType<typeof useQueryClient>,
    userContext: ReturnType<typeof useContextType>['userContext'],
    options?: { clearAllQueries?: boolean },
): Promise<void> {
    await clearTokens();
    await secureStorage.resetAllData();
    storage.setUserEmail('');
    storage.setUserId('');
    storage.setUserType('');
    userContext.setResource(GET_LOGGEDIN_USER, null);
    userContext.setUserType('');
    queryClient.removeQueries({ queryKey: queryKeys.search.all });
    if (options?.clearAllQueries) {
        queryClient.clear();
    }
}

const SESSION_INVALID_EVENT = 'troott:session-invalid';

type SessionInvalidPayload = {
    message?: string;
    status?: number;
};

function normalizeAuthPath(pathname: string): string {
    const base = (pathname.split('?')[0] ?? '').replace(/\/$/, '');
    return base || '/';
}

const AUTH_PUBLIC_PATHS = new Set([
    '/',
    '/login',
    '/register',
    '/enter-email',
    '/verify-email',
    '/activate-user-account',
    '/reset-password-otp-request',
    '/request-password-otp',
    '/reset-password',
]);

function isAuthPublicPath(pathname: string): boolean {
    const path = normalizeAuthPath(pathname);
    if (AUTH_PUBLIC_PATHS.has(path)) {
        return true;
    }
    return path.startsWith('/(auth)');
}

function isAuthEntryRedirectPath(pathname: string): boolean {
    const path = normalizeAuthPath(pathname);
    return (
        path === '/' ||
        path === '/login' ||
        path === '/register' ||
        path === '/enter-email'
    );
}

function isProtectedAppPath(pathname: string): boolean {
    return !isAuthPublicPath(pathname);
}

function toastAuthResult(
    payload: IAPIResponse,
    fallbackSuccess?: string,
): boolean {
    if (authRequestFailed(payload)) {
        const message = apiErrorMessage(payload);
        if (__DEV__) {
            console.log('[Auth] error toast:', message);
        }
        toast.error(message);
        return false;
    }
    const msg =
        (typeof payload.message === 'string' && payload.message.trim()) ||
        fallbackSuccess;
    if (msg) {
        if (__DEV__) {
            console.log('[Auth] success toast:', msg);
        }
        toast.success(msg);
    }
    return true;
}

export type UseAuthOptions = {
    /** Mount once from TroottProviders — session invalid, deep links, post-auth redirect. */
    routing?: boolean;
};

function useAuthRouting(
    enabled: boolean,
    clearSession: (options?: { clearAllQueries?: boolean }) => Promise<void>,
    user: SessionUser,
): void {
    const pathname = usePathname();
    const segments = useSegments();
    const routingRef = useRef(false);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const handle = (url: string | null) => {
            if (url) {
                void setPendingStableTargetFromUrl(url);
            }
        };

        void Linking.getInitialURL().then(handle);
        const sub = Linking.addEventListener('url', (event) =>
            handle(event.url),
        );
        return () => sub.remove();
    }, [enabled]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const onSessionInvalid = (payload: SessionInvalidPayload) => {
            void (async () => {
                await clearSession();
                toast.error(
                    payload.message?.trim() ||
                        (payload.status === 403
                            ? 'Your sign-in expired. Please sign in again.'
                            : 'Sign in again.'),
                );
                router.replace('/login');
            })();
        };

        const subscription = DeviceEventEmitter.addListener(
            SESSION_INVALID_EVENT,
            onSessionInvalid,
        );
        return () => subscription.remove();
    }, [clearSession, enabled]);

    useEffect(() => {
        if (!enabled || routingRef.current) {
            return;
        }

        let cancelled = false;

        void (async () => {
            const token = await getToken();
            if (cancelled) {
                return;
            }

            const inAuthGroup =
                segments.includes('(auth)' as never) ||
                segments.includes('(onboarding)' as never);
            const publicPath = isAuthPublicPath(pathname);

            if (!token) {
                if (
                    isProtectedAppPath(pathname) &&
                    !publicPath &&
                    !inAuthGroup &&
                    pathname !== '/'
                ) {
                    router.replace('/login');
                }
                return;
            }

            if (!user || typeof user !== 'object') {
                return;
            }

            if (isAuthEntryRedirectPath(pathname)) {
                routingRef.current = true;
                try {
                    await navigatePostAuth(user as SessionUser);
                } finally {
                    routingRef.current = false;
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [enabled, pathname, segments, user]);
}

export const useAuth = (options?: UseAuthOptions) => {
    const { goTo } = useGoTo();
    const { reset, setEmail, setField } = useRegisterAuth();
    const { userContext } = useContextType();
    const { setFormData, setErrors, setTouched, setResendCountdown, setStep } =
        useForgotPasswordAuth();

    const queryClient = useQueryClient();
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const startResendCountdown = () => {
        let count = 60;
        setResendCountdown(count);
        const timer = setInterval(() => {
            count -= 1;
            setResendCountdown(count);
            if (count <= 0) {
                clearInterval(timer);
            }
        }, 1000);
    };

    const persistSession = async (payload: {
        token?: string;
        user?: Record<string, unknown>;
    }): Promise<NonNullable<SessionUser>> => {
        if (payload.token) {
            await storeToken({ token: payload.token });
        }
        const u = (payload.user ?? {}) as Record<string, unknown>;
        storage.setUserEmail(String(u.email ?? ''));
        storage.setUserId(String(u.id ?? ''));
        storage.setUserType(String(u.userType ?? ''));
        const mapped: NonNullable<SessionUser> = {
            id: String(u.id ?? ''),
            email: String(u.email ?? ''),
            firstName: String(u.firstName ?? ''),
            lastName: String(u.lastName ?? ''),
            userType: u.userType,
            isActive: u.isActive,
            isAdmin: u.isAdmin,
            isSuper: u.isSuper,
            isLocked: u.isLocked,
            roles: u.roles,
            status: u.status,
            onboard: u.onboard,
            avatar: u.avatar,
            phoneNumber: u.phoneNumber,
        };
        userContext.setResource(GET_LOGGEDIN_USER, mapped);
        userContext.setUserType(String(u.userType ?? ''));
        queryClient.setQueryData(queryKeys.auth.user(), mapped);
        queryClient.setQueryData(queryKeys.users.me(), mapped);
        return mapped;
    };

    const RegisterMutation = useMutation({
        mutationFn: (payload: RegisterUserDTO) => {
            const ut = payload.userType;
            const userType =
                ut === UserType.LISTENER ||
                ut === UserType.CREATOR ||
                ut === UserType.MINISTER
                    ? ut
                    : UserType.LISTENER;
            return api.auth.registerUser({ ...payload, userType });
        },
        onSuccess: async (payload: IAPIResponse, variables: RegisterUserDTO) => {
            if (authRequestFailed(payload) || !payload.data) {
                toastAuthResult(
                    authRequestFailed(payload)
                        ? payload
                        : {
                              ...payload,
                              error: true,
                              message: payload.message || 'Registration failed',
                          },
                );
                return;
            }
            toastAuthResult(payload);
            const normalizedEmail = variables.email.trim().toLowerCase();
            if (normalizedEmail) {
                await storage.setUserEmail(normalizedEmail);
            }
            reset();
            setEmail(normalizedEmail);
            setField('email', normalizedEmail);
            goTo('/verify-email');
        },
        onError: handleMutationError,
    });

    const ActivateMutation = useMutation({
        mutationFn: (payload: ActivateDTO) => api.auth.activateUser(payload),
        onSuccess: async (payload: IAPIResponse) => {
            if (authRequestFailed(payload) || !payload.data) {
                toastAuthResult(
                    authRequestFailed(payload)
                        ? payload
                        : {
                              ...payload,
                              error: true,
                              message: payload.message || 'Activation failed',
                          },
                );
                return;
            }
            const data = payload.data as {
                token?: string;
                user?: Record<string, unknown>;
            };
            const mapped = await persistSession(data);
            toastAuthResult(payload);
            await navigatePostAuth(mapped);
        },
        onError: handleMutationError,
    });

    const LoginMutation = useMutation({
        mutationFn: (payload: LoginDTO) => api.auth.loginUser(payload),
        onSuccess: async (payload: IAPIResponse, variables: LoginDTO) => {
            if (payload.status === 206) {
                const email = variables.email.trim().toLowerCase();
                if (email) {
                    await storage.setUserEmail(email);
                }
                setEmail(email);
                setField('email', email);
                toast.error(apiErrorMessage(payload));
                goTo('/verify-email');
                return;
            }

            if (authRequestFailed(payload) || !payload.data) {
                toastAuthResult(
                    authRequestFailed(payload)
                        ? payload
                        : {
                              ...payload,
                              error: true,
                              message: payload.message || 'Login failed',
                          },
                );
                return;
            }
            const data = payload.data as {
                token?: string;
                user?: Record<string, unknown>;
            };
            const mapped = await persistSession(data);
            toastAuthResult(payload);
            await replaceWithPendingTargetOrHome(mapped);
        },
        onError: handleMutationError,
    });

    const SendOtpMutation = useMutation({
        mutationFn: (payload: ForgotPasswordDTO) =>
            api.auth.forgotPassword(payload),
        onSuccess: (payload: IAPIResponse) => {
            if (!toastAuthResult(payload)) {
                return;
            }
            startResendCountdown();
            setStep('otp');
            goTo('/request-password-otp');
        },
        onError: handleMutationError,
    });

    const VerifyOtpMutation = useMutation({
        mutationFn: (payload: VerifyOtpDTO) => api.auth.verifyOTP(payload),
        onSuccess: (payload: IAPIResponse) => {
            if (!toastAuthResult(payload)) {
                return;
            }
            setStep('success');
            goTo('/reset-password');
        },
        onError: handleMutationError,
    });

    const ResendOtpMutation = useMutation({
        mutationFn: (payload: ResendOtpDTO) => api.auth.resendOTP(payload),
        onSuccess: (payload: IAPIResponse) => {
            if (!toastAuthResult(payload)) {
                return;
            }
            startResendCountdown();
        },
        onError: handleMutationError,
    });

    const ResetPasswordMutation = useMutation({
        mutationFn: (payload: ResetPasswordDTO) =>
            api.auth.resetPassword(payload),
        onSuccess: (payload: IAPIResponse) => {
            if (!toastAuthResult(payload)) {
                return;
            }
            setFormData({ email: '', otp: Array(6).fill('') });
            setErrors({});
            setTouched({});
            goTo('/login');
        },
        onError: handleMutationError,
    });

    const ChangePasswordMutation = useMutation({
        mutationFn: (payload: ChangePasswordDTO) =>
            api.auth.changePassword(payload),
        onSuccess: (payload: IAPIResponse) => {
            toastAuthResult(payload);
        },
        onError: handleMutationError,
    });

    const LogoutMutation = useMutation({
        mutationFn: () => api.auth.logoutUser(),
        onSuccess: async () => {
            await clearLocalSession(queryClient, userContext, {
                clearAllQueries: true,
            });
            goTo('/login');
        },
        onError: async () => {
            await clearLocalSession(queryClient, userContext, {
                clearAllQueries: true,
            });
            goTo('/login');
        },
    });

    const clearSession = useCallback(
        (opts?: { clearAllQueries?: boolean }) =>
            clearLocalSession(queryClient, userContext, opts),
        [queryClient, userContext],
    );

    useAuthRouting(options?.routing === true, clearSession, userContext.user);

    return {
        otpRefs,
        RegisterMutation,
        ActivateMutation,
        LoginMutation,
        SendOtpMutation,
        VerifyOtpMutation,
        ResendOtpMutation,
        ResetPasswordMutation,
        ChangePasswordMutation,
        LogoutMutation,
        persistSession,
        clearSession,
        user: userContext.user,
    };
};
