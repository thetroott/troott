import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { IAPIResponse } from '@/utils/interface.utl';
import { useRegisterStore } from '@/stores/register-store';
import { useForgotPasswordStore } from '@/stores/otp-store';
import { handleMutationError } from '@/utils/helpers.util';
import { useUserStore } from '@/stores/user-store';
import useGoTo from '../../hooks/shared/useGoTo';
import secureStorage from '@/services/secure-storage';
import { UserType } from '@/utils/enums.util';

import AUthAPI from '@/api/auth';
import { storage } from '@/services/storage-service';
import { UserDTO } from '@/dtos/user.dto';
import { removeCatalogSearchQueries } from '@/lib/catalog-search-cache';

const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
};

export const useAuth = () => {
    const { goTo, goToNewScreen } = useGoTo();
    const { reset } = useRegisterStore();
    const { setToken, setUser, setLoading, setUserType } = useUserStore();
    // const { setUser: setAuthUser, setToken: setAuthToken } = useAuthStore();
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

    const RegisterMutation = useMutation({
        mutationFn: AUthAPI.registerUser,

        onSuccess: (data: IAPIResponse) => {
            const user: Partial<UserDTO> = {
                id: data.data?.data?.id,
                firstName: data.data?.data?.firstName,
                lastName: data.data?.data?.lastName,
                email: data.data?.data?.email,
                userType: data.data?.data?.userType,
            };

            storage.setUserEmail(user.email as string);
            storage.setUserId(user.id as string);
            storage.setUserType(user.userType as string);

            setUser(user);

            toast.success(data.data.message);
            reset();

            goTo('/activate');
        },

        onError: handleMutationError,
        retry: 0,
        gcTime: 0,
    });

    const ActivateMutation = useMutation({
        mutationFn: AUthAPI.activateUser,

        onSuccess: (data: IAPIResponse) => {
            toast.success(data.data.message);

            // Check if login was successful
            if (!data.error && data.data) {
                toast.success(data.data.message);

                const user = data?.data?.user;
                const token = data?.data?.token?.data?.token;

                if (!user && !token && data.status === 404) {
                    goTo('/register');
                } else if (data.error && data.status === 401) {
                    goTo('/login');
                } else {
                    // Store authentication tokens if available
                    storage.setUserEmail(user.email);
                    storage.setUserId(user.id);
                    storage.setUserType(user.userType);

                    // secureStorage.setToken(token)
                    // secureStorage.setUserEmail(user.email)
                    // secureStorage.setUserId(user.id)
                    // secureStorage.setUserType(user.userType)

                    // Create user object from response data
                    // use UserDTO
                    const userData = {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userType: user.userType,
                        isActive: user.isActive,
                        isTalent: user.isTalent,
                        isAdmin: user.isAdmin,
                        isSuper: user.isSuper,
                        isOrganisation: user.isOrganisation,
                        isLocked: user.isLocked,
                        roles: user.roles,
                        status: user.status,
                        onboard: user.onboard,
                    };

                    // Set user data in both stores
                    setUser(userData);
                    setUserType(user.userType);
                    // setAuthUser(userData);
                    // setAuthToken(token);

                    // Store onboarding progress to avoid additional API calls
                    // if (user.onboarding) {
                    //   storage.setData({ key: 'onboarding_progress', payload: user.onboarding });
                    // }

                    removeCatalogSearchQueries(queryClient);

                    goTo('/home');
                }
            }
        },
        onError: handleMutationError,
    });

    const LoginMutation = useMutation({
        mutationFn: AUthAPI.loginUser,

        onSuccess: (data: IAPIResponse) => {
            toast.success(data.data.message);

            // Check if login was successful
            if (!data.error && data.data) {
                toast.success(data.data.message);

                const user = data?.data?.user;
                const token = data?.data?.token?.data?.token;

                if (!user && !token && data.status === 400) {
                    goTo('/register');
                } else if (data.error && data.status === 423) {
                    goTo('/login');
                } else if (data.error && data.status === 206) {
                    goTo('/activate');
                } else if (data.error && data.status === 423) {
                    goTo('/login');
                } else {
                    // Store authentication tokens if available
                    storage.setUserEmail(user.email);
                    storage.setUserId(user.id);
                    storage.setUserType(user.userType);

                    // secureStorage.setToken(token)
                    // secureStorage.setUserEmail(user.email)
                    // secureStorage.setUserId(user.id)
                    // secureStorage.setUserType(user.userType)

                    // Create user object from response data
                    const userData = {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userType: user.userType,
                        isActive: user.isActive,
                        isTalent: user.isTalent,
                        isAdmin: user.isAdmin,
                        isSuper: user.isSuper,
                        isOrganisation: user.isOrganisation,
                        isLocked: user.isLocked,
                        roles: user.roles,
                        status: user.status,
                        onboard: user.onboard,
                    };

                    // Set user data in both stores
                    setUser(userData);
                    setUserType(user.userType);
                    // setAuthUser(userData);
                    // setAuthToken(token);

                    // // Store onboarding progress to avoid additional API calls
                    // if (user.onboarding) {
                    //   storage.setData({ key: 'onboarding_progress', payload: user.onboarding });
                    // }

                    // // Set cookie for user type (for admin/super users)
                    // if (user.userType === UserType.SUPERADMIN || user.userType === UserType.ADMIN) {

                    //   secureStorage.setToken(token)
                    //   secureStorage.setUserEmail(user.email)
                    //   secureStorage.setUserId(user.id)
                    //   secureStorage.setUserType(user.userType)

                    // }

                    removeCatalogSearchQueries(queryClient);

                    goTo('/home');
                }
            }
        },
        onError: handleMutationError,
    });

    const SendOtpMutation = useMutation({
        mutationFn: AUthAPI.forgotPassword,

        onSuccess: (data: IAPIResponse) => {
            toast.success(data.message);

            setStep('otp');
            startResendCountdown();
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        },

        onError: handleMutationError,
    });

    const VerifyOtpMutation = useMutation({
        mutationFn: AUthAPI.resetPassword,

        onSuccess: (data: IAPIResponse) => {
            toast.success(data.message);
            setStep('success');
        },

        onError: handleMutationError,
    });

    const ResendOtpMutation = useMutation({
        mutationFn: AUthAPI.resendOTP,

        onSuccess: () => {
            setFormData({ otp: Array(6).fill('') });
            setErrors({});
            setTouched({ otp: false });
            startResendCountdown();
            otpRefs.current[0]?.focus();
        },
        onError: handleMutationError,
    });

    const LogoutMutation = useMutation({
        mutationFn: AUthAPI.logoutUser,

        onSuccess: (data: IAPIResponse) => {
            if (data?.message) {
                setUser({});
                setToken(null);

                queryClient.invalidateQueries({ queryKey: authKeys.user() });
                removeCatalogSearchQueries(queryClient);

                // storage.clearAll();
                secureStorage.resetAllData();

                goTo('/login');
            }
        },

        onError: (error: any) => {
            setUser({});
            setToken(null);

            queryClient.invalidateQueries({ queryKey: authKeys.user() });
            removeCatalogSearchQueries(queryClient);
            // storage.clearAll();
            secureStorage.resetAllData();

            goTo('/login');
            handleMutationError(error);
        },
    });

    const ResetPasswordMutation = useMutation({
        mutationFn: AUthAPI.resetPassword,
        onSuccess: (data: IAPIResponse) => {
            if (!data.error && data.status === 200) {
                toast.success(data.data.message);
                goTo('/login');
            } else {
            }
        },
        onError: (error) => {
            handleMutationError(error);
        },
    });

    return {
        RegisterMutation,
        ActivateMutation,
        LoginMutation,
        VerifyOtpMutation,
        SendOtpMutation,
        ResendOtpMutation,
        ResetPasswordMutation,
        LogoutMutation,
    };
};
