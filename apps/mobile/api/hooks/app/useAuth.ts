import { useRef } from 'react';
import type { IAPIResponse } from '@/utils/interface.utl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { useRegisterStore } from '@/stores/register-store';
import { useForgotPasswordStore } from '@/stores/otp-store';
import { handleMutationError } from '@/utils/helpers.util';
import { useContextType } from '@/state/app-state';
import useGoTo from '../shared/useGoTo';
import secureStorage from '../../services/secure-storage';
import {
    clearTokens,
    storage,
    storeToken,
} from '../../services/mmkv-storage';
import { authService } from '../../clients/auth';
import type {
    ActivateDTO,
    ChangePasswordDTO,
    ForgotPasswordDTO,
    LoginDTO,
    MapRegisteredUserDTO,
    RegisterUserDTO,
    ResendOtpDTO,
    ResetPasswordDTO,
    VerifyOtpDTO,
} from '../../dtos/auth.dto';
import { queryKeys } from '../../utils/query-keys';
import { removeCatalogSearchQueries } from '@/lib/catalog-search-cache';

const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
};

/**
 * Maps API user fields into the shape stored in app auth context.
 * @param {Record<string, unknown>} payload Raw user object from the session envelope.
 */
function mapApiUserToContext(payload: Record<string, unknown>) {
    return {
        id: String(payload.id ?? ''),
        email: String(payload.email ?? ''),
        firstName: String(payload.firstName ?? ''),
        lastName: String(payload.lastName ?? ''),
        userType: payload.userType,
        isActive: payload.isActive,
        isTalent: payload.isTalent,
        isAdmin: payload.isAdmin,
        isSuper: payload.isSuper,
        isOrganisation: payload.isOrganisation,
        isLocked: payload.isLocked,
        roles: payload.roles,
        status: payload.status,
        onboard: payload.onboard,
    };
}

/**
 * Auth flows backed by {@link authService} and React Query `useMutation`.
 *
 * @name useAuth
 * @description Returns OTP refs, register/login/activate, password recovery, change password, and logout mutations with toast, navigation, and session persistence.
 * @returns {object} `otpRefs` plus `RegisterMutation`, `ActivateMutation`, `LoginMutation`, `SendOtpMutation`, `VerifyOtpMutation`, `ResendOtpMutation`, `ResetPasswordMutation`, `ChangePasswordMutation`, and `LogoutMutation` (each a TanStack Query mutation result).
 */
export const useAuth = () => {
    const { goTo } = useGoTo();
    const { reset } = useRegisterStore();
    const { userContext } = useContextType();
    const { setUser, setUserType } = userContext;
    const { setFormData, setErrors, setTouched, setResendCountdown, setStep } =
        useForgotPasswordStore();

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

    /**
     * Persists access token and user snapshot to secure store, MMKV, auth context, and React Query cache.
     * @param {LoginResponse} payload Session token and user returned inside the API `data` envelope.
     */
    const persistSession = async (payload: any) => {
        await storeToken({ token: payload.token });
        const u = payload.user as unknown as Record<string, unknown>;
        storage.setUserEmail(String(u.email ?? ''));
        storage.setUserId(String(u.id ?? ''));
        storage.setUserType(String(u.userType ?? ''));
        setUser(mapApiUserToContext(u));
        setUserType(String(u.userType ?? ''));
        queryClient.setQueryData(queryKeys.auth.user(), payload.user);
    };

    /**
     * @name registerUser
     * @description Register a new account; API emails an OTP and returns the mapped user in `data`.
     * @param {RegisterUserDTO} payload Registration request body.
     * @param {string} payload.firstName User given name.
     * @param {string} payload.lastName User family name.
     * @param {string} payload.email Account email.
     * @param {string} payload.password Account password.
     * @param {string} [payload.userType] Optional Troott user role.
     * @returns {Promise<IAPIResponse>} API envelope; on success `mutate` resolves with user in `data`.
     */
    const RegisterMutation = useMutation({
        mutationFn: (payload: RegisterUserDTO) =>
            authService.registerUser(payload),
        onSuccess: (payload: IAPIResponse) => {
            if (
                payload.error ||
                payload.data == null ||
                typeof payload.data !== 'object'
            ) {
                toast.error(payload.message || 'Registration failed');
                return;
            }
            const u = payload.data as MapRegisteredUserDTO;
            storage.setUserEmail(u.email);
            storage.setUserId(u.id);
            storage.setUserType(String(u.userType));

            setUser({
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                userType: u.userType,
            });

            toast.success(payload.message || 'Registered');
            reset();
            goTo('/activate');
        },
        onError: handleMutationError,
        retry: 0,
        gcTime: 0,
    });

    /**
     * @name activateUser
     * @description Activate a user account after registration using an OTP code.
     * @param {ActivateDTO} payload Data for activating the account.
     * @param {string} payload.email The email tied to the OTP.
     * @param {number} payload.otp The one-time code sent to the user (numeric).
     * @param {string} payload.otpType Which OTP flow this code belongs to (see `OtpType` in `@/models/User.model`).
     * @returns {Promise<IAPIResponse>} Confirmation of activation; `data` includes user and token on success.
     */
    const ActivateMutation = useMutation({
        mutationFn: (payload: ActivateDTO) =>
            authService.activateUser(payload),
        onSuccess: async (payload: IAPIResponse) => {
            if (
                payload.error ||
                payload.data == null ||
                typeof payload.data !== 'object'
            ) {
                toast.error(payload.message || 'Activation failed');
                return;
            }
            const body = payload.data as { user?: unknown; token?: string };
            if (!body.token || !body.user) {
                toast.error(payload.message || 'Activation failed');
                return;
            }
            const session = {
                token: body.token,
                user: body.user
            };
            toast.success(
                payload.message || 'Account activated successfully',
            );
            await persistSession(session);
            removeCatalogSearchQueries(queryClient);
            goTo('/home');
        },
        onError: handleMutationError,
    });

    /**
     * @name loginUser
     * @description Sign in with email and password; on success the API returns user and token in `data`.
     * @param {LoginDTO} payload Login request body.
     * @param {string} payload.email Account email.
     * @param {string} payload.password Account password.
     * @returns {Promise<IAPIResponse>} API envelope with session payload in `data` when credentials are valid.
     */
    const LoginMutation = useMutation({
        mutationFn: (payload: LoginDTO) => authService.loginUser(payload),
        onSuccess: async (payload: IAPIResponse) => {
            if (
                payload.error ||
                payload.data == null ||
                typeof payload.data !== 'object'
            ) {
                toast.error(payload.message || 'Login failed');
                return;
            }
            const body = payload.data as { user?: unknown; token?: string };
            if (!body.token || !body.user) {
                toast.error(payload.message || 'Login failed');
                return;
            }
            const session = {
                token: body.token,
                user: body.user,
            };
            toast.success(payload.message || 'User logged in successfully.');
            await persistSession(session);
            removeCatalogSearchQueries(queryClient);
            goTo('/home');
        },
        onError: handleMutationError,
    });

    /**
     * @name forgotPassword
     * @description Request a password-reset OTP for the given email.
     * @param {ForgotPasswordDTO} payload Forgot-password request body.
     * @param {string} payload.email Email that should receive the reset OTP.
     * @returns {Promise<IAPIResponse>} API envelope confirming the OTP send attempt.
     */
    const SendOtpMutation = useMutation({
        mutationFn: (payload: ForgotPasswordDTO) =>
            authService.forgotPassword(payload),
        onSuccess: (payload: IAPIResponse) => {
            toast.success(payload.message);
            setStep('otp');
            startResendCountdown();
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        },
        onError: handleMutationError,
    });

    /**
     * @name verifyOTP
     * @description Validate an OTP for the given email and purpose (e.g. password reset).
     * @param {VerifyOtpDTO} payload OTP verification body.
     * @param {string} payload.email Email the OTP was sent to.
     * @param {number} payload.otp Numeric OTP entered by the user.
     * @param {string} payload.otpType Purpose of the OTP (see `OtpType`).
     * @returns {Promise<IAPIResponse>} API envelope with verification outcome message.
     */
    const VerifyOtpMutation = useMutation({
        mutationFn: (payload: VerifyOtpDTO) => authService.verifyOTP(payload),
        onSuccess: (payload: IAPIResponse) => {
            toast.success(payload.message);
            setStep('success');
        },
        onError: handleMutationError,
    });

    /**
     * @name resendOTP
     * @description Ask the API to send a new OTP for the same email and purpose.
     * @param {ResendOtpDTO} payload Resend request body.
     * @param {string} payload.email Email to resend to.
     * @param {string} payload.otpType Which OTP template to send (see `OtpType`).
     * @returns {Promise<IAPIResponse>} API envelope for the resend request.
     */
    const ResendOtpMutation = useMutation({
        mutationFn: (payload: ResendOtpDTO) => authService.resendOTP(payload),
        onSuccess: () => {
            setFormData({ otp: Array(6).fill('') });
            setErrors({});
            setTouched({ otp: false });
            startResendCountdown();
            otpRefs.current[0]?.focus();
        },
        onError: handleMutationError,
    });

    /**
     * @name resetPassword
     * @description Set a new password after the reset OTP flow (server-dependent ordering).
     * @param {ResetPasswordDTO} payload Reset-password body.
     * @param {string} payload.email Account email.
     * @param {string} payload.newPassword New password meeting API rules.
     * @returns {Promise<IAPIResponse>} API envelope confirming the password update.
     */
    const ResetPasswordMutation = useMutation({
        mutationFn: (payload: ResetPasswordDTO) =>
            authService.resetPassword(payload),
        onSuccess: (payload: IAPIResponse) => {
            toast.success(payload.message);
            goTo('/login');
        },
        onError: handleMutationError,
    });

    /**
     * @name changePassword
     * @description Change password for the authenticated user (Bearer required).
     * @param {ChangePasswordDTO} payload Change-password body.
     * @param {string} payload.currentPassword Existing password.
     * @param {string} payload.newPassword Replacement password.
     * @returns {Promise<IAPIResponse>} API envelope confirming the change.
     */
    const ChangePasswordMutation = useMutation({
        mutationFn: (payload: ChangePasswordDTO) =>
            authService.changePassword(payload),
        onSuccess: (payload: IAPIResponse) => {
            toast.success(payload.message);
        },
        onError: handleMutationError,
    });

    /**
     * @name logout
     * @description Clear local session, call logout endpoint, invalidate queries, and navigate to login.
     * @returns {Promise<IAPIResponse>} API envelope from the logout request (client clears state even on error).
     */
    const LogoutMutation = useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: async () => {
            setUser({});
            setUserType('');
            await clearTokens();
            queryClient.invalidateQueries({ queryKey: authKeys.user() });
            queryClient.clear();
            removeCatalogSearchQueries(queryClient);
            secureStorage.resetAllData();
            goTo('/login');
        },
        onError: async (error: unknown) => {
            setUser({});
            setUserType('');
            await clearTokens();
            queryClient.invalidateQueries({ queryKey: authKeys.user() });
            queryClient.clear();
            removeCatalogSearchQueries(queryClient);
            secureStorage.resetAllData();
            goTo('/login');
            handleMutationError(error);
        },
    });

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
    };
};
