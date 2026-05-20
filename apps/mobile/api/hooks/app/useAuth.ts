import { useRef } from 'react';
import type { IAPIResponse } from '@/utils/interface.utl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { useRegisterStore } from '@/stores/register-store';
import { useForgotPasswordStore } from '@/stores/otp-store';
import { handleMutationError } from '@/utils/helpers.util';
import { useContextType } from '@/context/apps/useContextType';
import { GET_LOGGEDIN_USER } from '@/context/types';
import useGoTo from '../shared/useGoTo';
import secureStorage from '../../services/secure-storage';
import {
    clearTokens,
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
import { queryKeys } from '../../utils/query-keys';
import { mapApiUserToContext } from '../../utils/map-api-user';
import { removeCatalogSearchQueries } from '@/lib/catalog-search-cache';

export const useAuth = () => {
    const { goTo } = useGoTo();
    const { reset } = useRegisterStore();
    const { userContext } = useContextType();
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

    const persistSession = async (payload: {
        token?: string;
        user?: Record<string, unknown>;
    }) => {
        if (payload.token) {
            await storeToken({ token: payload.token });
        }
        const u = (payload.user ?? {}) as Record<string, unknown>;
        storage.setUserEmail(String(u.email ?? ''));
        storage.setUserId(String(u.id ?? ''));
        storage.setUserType(String(u.userType ?? ''));
        const mapped = mapApiUserToContext(u);
        userContext.setResource(GET_LOGGEDIN_USER, mapped);
        userContext.setUserType(String(u.userType ?? ''));
        queryClient.setQueryData(queryKeys.auth.user(), mapped);
    };

    const RegisterMutation = useMutation({
        mutationFn: (payload: RegisterUserDTO) =>
            api.auth.registerUser(payload),
        onSuccess: (payload: IAPIResponse) => {
            if (payload.error || !payload.data) {
                handleMutationError(payload);
                return;
            }
            toast.success(payload.message || 'Registration successful');
            reset();
            goTo('/verify-email');
        },
        onError: handleMutationError,
    });

    const ActivateMutation = useMutation({
        mutationFn: (payload: ActivateDTO) => api.auth.activateUser(payload),
        onSuccess: async (payload: IAPIResponse) => {
            if (payload.error || !payload.data) {
                handleMutationError(payload);
                return;
            }
            const data = payload.data as {
                token?: string;
                user?: Record<string, unknown>;
            };
            await persistSession(data);
            toast.success(payload.message || 'Account activated');
            goTo('/(onboarding)/select-interests');
        },
        onError: handleMutationError,
    });

    const LoginMutation = useMutation({
        mutationFn: (payload: LoginDTO) => api.auth.loginUser(payload),
        onSuccess: async (payload: IAPIResponse) => {
            if (payload.error || !payload.data) {
                handleMutationError(payload);
                return;
            }
            const data = payload.data as {
                token?: string;
                user?: Record<string, unknown>;
            };
            await persistSession(data);
            toast.success(payload.message || 'Welcome back');
            goTo('/(tabs)/home');
        },
        onError: handleMutationError,
    });

    const SendOtpMutation = useMutation({
        mutationFn: (payload: ForgotPasswordDTO) =>
            api.auth.forgotPassword(payload),
        onSuccess: (payload: IAPIResponse) => {
            if (payload.error) {
                handleMutationError(payload);
                return;
            }
            startResendCountdown();
            toast.success(payload.message || 'OTP sent');
            setStep('otp');
        },
        onError: handleMutationError,
    });

    const VerifyOtpMutation = useMutation({
        mutationFn: (payload: VerifyOtpDTO) => api.auth.verifyOTP(payload),
        onSuccess: (payload: IAPIResponse) => {
            if (payload.error) {
                handleMutationError(payload);
                return;
            }
            toast.success(payload.message || 'OTP verified');
            setStep('success');
        },
        onError: handleMutationError,
    });

    const ResendOtpMutation = useMutation({
        mutationFn: (payload: ResendOtpDTO) => api.auth.resendOTP(payload),
        onSuccess: (payload: IAPIResponse) => {
            if (payload.error) {
                handleMutationError(payload);
                return;
            }
            startResendCountdown();
            toast.success(payload.message || 'OTP resent');
        },
        onError: handleMutationError,
    });

    const ResetPasswordMutation = useMutation({
        mutationFn: (payload: ResetPasswordDTO) =>
            api.auth.resetPassword(payload),
        onSuccess: (payload: IAPIResponse) => {
            if (payload.error) {
                handleMutationError(payload);
                return;
            }
            toast.success(payload.message || 'Password reset');
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
            if (payload.error) {
                handleMutationError(payload);
                return;
            }
            toast.success(payload.message || 'Password updated');
        },
        onError: handleMutationError,
    });

    const LogoutMutation = useMutation({
        mutationFn: () => api.auth.logoutUser(),
        onSuccess: async () => {
            await clearTokens();
            await secureStorage.resetAllData();
            userContext.setResource(GET_LOGGEDIN_USER, null);
            userContext.setUserType('');
            removeCatalogSearchQueries(queryClient);
            queryClient.clear();
            goTo('/login');
        },
        onError: async () => {
            await clearTokens();
            userContext.setResource(GET_LOGGEDIN_USER, null);
            queryClient.clear();
            goTo('/login');
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
        persistSession,
    };
};
