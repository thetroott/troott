import cookieService from '@/api/services/cookies';
import { useCallback, useEffect, useState } from 'react';
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

import storage, { setVerificationEmail } from '@/api/services/local-storage';
import useContextType from '../shared/useContextType';
import { UserType } from '@/models/User.model';
import {
    isStudioPortalUserType,
    navigateToStudioPortal,
} from '@/utils/studio-portal.util';
import {
    AUTH_ROUTES,
    isAuthEntryRedirectPath,
    isAuthPublicPath,
} from '@/constants/auth-routes';
import { clearLocalAuth } from '@/utils/auth-session.util';

const useAuth = () => {
    const { userContext } = useContextType();
    const { goTo, location, navigate } = useGoTo();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const {
        users,
        user,
        userType,
        setUserType,
        currentSidebar,
        setLoading,
        unsetLoading,
    } = userContext;

    const redirectAfterAuth = useCallback(() => {
        const utAfterAuth = cookieService.getUserType();
        if (isStudioPortalUserType(utAfterAuth) && storage.checkToken()) {
            void navigateToStudioPortal(goTo);
        } else {
            goTo('/dashboard');
        }
    }, [goTo]);

    useEffect(() => {
        let ut = cookieService.getUserType();
        setUserType(ut ? ut : '');
    }, []);

    useEffect(() => {
        if (!storage.checkToken() || !storage.checkUserID()) {
            if (isAuthPublicPath(location.pathname)) {
                goTo(location.pathname);
            } else {
                clearLocalAuth();
                goTo(AUTH_ROUTES.login);
            }
        } else {
            setIsLoggedIn(true);
            currentSidebar(false);

            if (isAuthEntryRedirectPath(location.pathname)) {
                redirectAfterAuth();
            }
        }
    }, [navigate, location.pathname, goTo, currentSidebar, redirectAfterAuth]);

    useEffect(() => {
        let ut = cookieService.getUserType();
        setUserType(ut ? ut : '');
    }, [isLoggedIn]);

    const redirect = useCallback(
        (roles: Array<string>) => {
            if (!storage.checkToken() || !storage.checkUserID()) {
                clearLocalAuth();
                goTo(AUTH_ROUTES.login);
                return;
            }

            const cookieUserType = cookieService.getUserType();
            const token = storage.getToken();

            if (!token) {
                clearLocalAuth();
                goTo(AUTH_ROUTES.login);
                return;
            }

            if (cookieUserType && !roles.includes(cookieUserType)) {
                goTo(AUTH_ROUTES.login);
                void logoutAuthenticated();
                return;
            }

            setIsLoggedIn(true);
            currentSidebar(false);

            if (isAuthEntryRedirectPath(location.pathname)) {
                redirectAfterAuth();
            }
        },
        [
            goTo,
            location.pathname,
            currentSidebar,
            redirectAfterAuth,
        ],
    );

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
                const d = response.data;
                const ut = d?.userType as string | undefined;
                const troottPortalTypes: string[] = [
                    UserType.SUPER,
                    UserType.ADMIN,
                    UserType.MINISTER,
                    UserType.CREATOR,
                    UserType.LISTENER,
                    UserType.USER,
                ];
                if (!ut || !troottPortalTypes.includes(ut)) {
                    return response;
                }

                storage.storeAuth(
                    response.token!,
                    d._id ?? d.id,
                    ut,
                    d.email,
                    d.businessType,
                );

                cookieService.setData({
                    key: 'userType',
                    payload: ut,
                    expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    path: '/',
                });

                if (d.businessType) {
                    cookieService.setData({
                        key: 'businessType',
                        payload: d.businessType,
                        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        path: '/',
                    });
                }

                setUserType(ut);
                setIsLoggedIn(true);
            }

            if (response.status === 206) {
                setVerificationEmail(data.email);
                goTo(AUTH_ROUTES.activateAccount);
            }
        }

        return response;
    };

    const logout = async () => {
        await logoutAuthenticated();
        setUserType('');
        goTo(AUTH_ROUTES.login);
        setIsLoggedIn(false);
    };

    const logoutUser = useCallback(
        async (data: LogoutDTO) => {
            setLoading({ option: 'default' });

            const response = await api.auth.logoutUser({
                userId: data.userId || storage.getUserID(),
            });
            if (!response.error) {
                setIsLoggedIn(false);
                clearLocalAuth();
                setUserType('');
                unsetLoading({ option: 'default', message: 'successful' });
                goTo(AUTH_ROUTES.login);
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
                setIsLoggedIn(false);
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
                setIsLoggedIn(false);
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
                setIsLoggedIn(false);
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
                setIsLoggedIn(false);
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
                setIsLoggedIn(false);
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
                setIsLoggedIn(false);
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

        redirect,
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
