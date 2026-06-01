import cookieService from '@/api/services/cookies';
import { useCallback } from 'react';
import useGoTo from '../shared/useGoTo';
import api from '@/api/config';

import {
    ActivateDTO,
    ChangePasswordDTO,
    ForgotPasswordDTO,
    LoginDTO,
    LogoutDTO,
    RegisterUserDTO,
    ResendOtpDTO,
    ResetPasswordDTO,
    VerifyOtpDTO,
} from '@/dtos/auth.dto';

import storage, {
    persistAuthFromResponse,
    setVerificationEmail,
} from '@/api/services/local-storage';
import useContextType from '../shared/useContextType';
import { useSession } from '@/context/session/sessionState';
import {
    PATH_ACTIVATE_ACCOUNT,
    PATH_LOGIN,
} from '@/routes/paths';
import {
    isInternalPortalUserType,
    isListenerLikeUserType,
} from '@/utils/auth-redirect.util';
import { clearLocalAuth } from '@/utils/auth-session.util';
import {
    useRedirectAfterAuth,
    type RedirectAfterAuthOptions,
} from '@/hooks/app/useRedirectAfterAuth';

export type { RedirectAfterAuthOptions };

const useAuth = () => {
    const { userContext } = useContextType();
    const { goTo, location, navigate } = useGoTo();
    const { refreshSession } = useSession();

    const {
        users,
        user,
        userType,
        setUserType,
        setLoading,
        unsetLoading,
    } = userContext;

    const redirectAfterAuth = useRedirectAfterAuth();

    async function logoutAuthenticated(): Promise<void> {
        if (storage.checkToken()) {
            try {
                await api.auth.logout();
            } catch {
                /* local session cleared regardless */
            }
        }
        clearLocalAuth();
    }

    const login = async (data: LoginDTO) => {
        const response = await api.auth.loginUser(data);

        if (!response.error) {
            if (response.status === 200) {
                persistAuthFromResponse(response);

                const payload = response.data as
                    | Record<string, unknown>
                    | undefined;
                const user =
                    payload?.user && typeof payload.user === 'object'
                        ? (payload.user as Record<string, unknown>)
                        : payload;
                const ut = String(user?.userType ?? '');
                if (
                    !ut ||
                    (!isInternalPortalUserType(ut) &&
                        !isListenerLikeUserType(ut))
                ) {
                    return response;
                }

                cookieService.setData({
                    key: 'userType',
                    payload: ut,
                    expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    path: '/',
                });

                const businessType = user?.businessType;
                if (typeof businessType === 'string' && businessType) {
                    cookieService.setData({
                        key: 'businessType',
                        payload: businessType,
                        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        path: '/',
                    });
                }

                setUserType(ut);
                await refreshSession({ force: true });

                const from =
                    typeof location.state === 'object' &&
                    location.state !== null &&
                    'from' in location.state
                        ? String(
                              (location.state as { from?: string }).from ?? '',
                          )
                        : undefined;

                await redirectAfterAuth({
                    userType: ut,
                    token: true,
                    returnTo: from,
                });
            }

            if (response.status === 206) {
                clearLocalAuth();
                setUserType('');
                setVerificationEmail(data.email);
                navigate(PATH_ACTIVATE_ACCOUNT, { replace: true });
            }
        }

        return response;
    };

    const logout = async () => {
        await logoutAuthenticated();
        setUserType('');
        goTo(PATH_LOGIN);
    };

    const logoutUser = useCallback(
        async (data: LogoutDTO) => {
            setLoading({ option: 'default' });

            const response = await api.auth.logoutUser({
                userId: data.userId || storage.getUserID(),
            });
            if (!response.error) {
                clearLocalAuth();
                setUserType('');
                unsetLoading({ option: 'default', message: 'successful' });
                goTo(PATH_LOGIN);
            }
            return response;
        },
        [setLoading, unsetLoading, goTo],
    );

    const register = useCallback(
        async (data: RegisterUserDTO) => {
            setLoading({ option: 'default' });

            const response = await api.auth.registerUser(data);

            if (!response.error) {
                unsetLoading({
                    option: 'default',
                    message: 'successful',
                });
            }

            return response;
        },
        [setLoading, unsetLoading],
    );

    const verifyOtp = useCallback(
        async (data: VerifyOtpDTO) => {
            setLoading({ option: 'default' });

            const response = await api.auth.verifyOTP({
                email: data.email,
                otp: data.otp,
                otpType: data.otpType,
            });
            if (!response.error) {
                unsetLoading({ option: 'default', message: 'successful' });
            }
            return response;
        },
        [setLoading, unsetLoading],
    );

    const activateAccount = useCallback(
        async (data: ActivateDTO) => {
            setLoading({ option: 'default' });

            const response = await api.auth.activateUser({
                otp: data.otp,
                otpType: data.otpType,
                email: data.email,
            });

            if (!response.error) {
                unsetLoading({
                    option: 'default',
                    message: 'successful',
                });
            }

            return response;
        },
        [setLoading, unsetLoading],
    );

    const resendOtp = useCallback(
        async (data: ResendOtpDTO) => {
            const { email, otpType } = data;
            const response = await api.auth.resendOTP({
                email,
                otpType,
            });
            if (!response.error) {
                unsetLoading({ option: 'default', message: 'successful' });
            }

            return response;
        },
        [setLoading, unsetLoading],
    );

    const forgotPassword = useCallback(
        async (data: ForgotPasswordDTO) => {
            setLoading({ option: 'default' });

            const response = await api.auth.forgotPassword({
                email: data.email,
            });

            if (!response.error) {
                unsetLoading({ option: 'default', message: 'successful' });
            }
            return response;
        },
        [setLoading, unsetLoading],
    );

    const resetPassword = useCallback(
        async (data: ResetPasswordDTO) => {
            const { newPassword, email } = data;

            setLoading({ option: 'default' });

            const response = await api.auth.resetPassword({
                newPassword,
                email,
            });
            if (!response.error) {
                unsetLoading({ option: 'default', message: 'successful' });
            }
            return response;
        },
        [setLoading, unsetLoading],
    );

    const changePassword = useCallback(
        async (data: ChangePasswordDTO) => {
            setLoading({ option: 'default' });

            const response = await api.auth.changePassword(data);

            if (!response.error) {
                unsetLoading({
                    option: 'default',
                    message: 'successful',
                });
            }

            return response;
        },
        [setLoading, unsetLoading],
    );

    return {
        users,
        user,
        userType,

        redirectAfterAuth,
        login,
        register,
        logout,
        logoutUser,
        activateAccount,
        resendOtp,
        forgotPassword,
        resetPassword,
        verifyOtp,
        changePassword,
    };
};

export default useAuth;
