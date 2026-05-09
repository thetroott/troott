import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleMutationError } from '@/utils/helpers.util';
import type { IAPIResponse } from '@/utils/interfaces.util';
import useGoTo from '@/hooks/shared/useGoTo';
import { useRegisterStore } from '@/store/register-store';
import { useForgotPasswordStore } from '@/store/otp-store';
import { useRef } from 'react';
import logger from '@/utils/logger.util';
import { useContextType } from '@troott/state';
import storage from '@/utils/storage.util';
import { UserType } from '@troott/api-client';
import cookieService from '@/services/shared/cookie';
import type {
    ActivateDTO,
    ForgotPasswordDTO,
    LoginDTO,
    RegisterUserDTO,
    ResendOtpDTO,
    ResetPasswordDTO,
    VerifyOtpDTO,
} from '@/dtos/auth.dto';
import '@/api/clients/troott';
import { troottAPIClient } from '@troott/api-client';

const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
};

const useAuth = () => {
    const { goTo } = useGoTo();
    const { reset } = useRegisterStore();

    const { userContext } = useContextType();
    const { setUser, setLoading, unsetLoading, setUserType } = userContext;

    const setGlobalLoading = (loading: boolean) => {
        if (loading) {
            void setLoading({ option: 'default' });
            return;
        }
        void unsetLoading({ option: 'default' });
    };

    const queryClient = useQueryClient();

    const { setFormData, setErrors, setTouched, setResendCountdown, setStep } =
        useForgotPasswordStore();

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

    const register = (payload: RegisterUserDTO) =>
        troottAPIClient().auth.registerUser(payload) as Promise<IAPIResponse>;
    const activateUser = (payload: ActivateDTO) =>
        troottAPIClient().auth.activateUser(payload) as Promise<IAPIResponse>;
    const login = (payload: LoginDTO) =>
        troottAPIClient().auth.loginUser(payload) as Promise<IAPIResponse>;
    const sendOtp = (payload: ForgotPasswordDTO) =>
        troottAPIClient().auth.forgotPassword(payload) as Promise<IAPIResponse>;
    const verifyOtp = (payload: VerifyOtpDTO) =>
        troottAPIClient().auth.verifyOTP(payload) as Promise<IAPIResponse>;
    const resendOtp = (payload: ResendOtpDTO) =>
        troottAPIClient().auth.resendOTP(payload) as Promise<IAPIResponse>;
    const logout = () =>
        troottAPIClient().auth.logoutUser({
            userId: storage.getUserID(),
        } as never) as Promise<IAPIResponse>;
    const resetPassword = (payload: ResetPasswordDTO) =>
        troottAPIClient().auth.resetPassword(payload) as Promise<IAPIResponse>;

    const Register = useMutation({
        mutationFn: register,

        onMutate: () => {
            setGlobalLoading(true);
        },

        onSuccess: (data: IAPIResponse) => {
            storage.keep('userEmail', data.data.data.email);
            storage.keep('userId', data.data.data.id);
            storage.keep('userType', data.data.data.userType);

            queryClient.invalidateQueries({ queryKey: authKeys.user() });

            toast.success(data.data.message);
            reset();
            goTo('/activate');
        },

        onError: handleMutationError,

        onSettled: () => {
            setGlobalLoading(false);
        },
    });

    /**
     *
     * @name ActivateUser
     * @description A React Query mutation hook responsible for activating a user's account (e.g., via OTP verification).
     * It handles the API call, manages success state by logging the user in, and sets necessary tokens and user state across the application.
     *
     * @param {object} mutationConfig - The configuration object passed to `useMutation`.
     * @param {function} mutationConfig.mutationFn - The asynchronous function (from `AuthService.activateUser`) that performs the activation API call.
     *
     * @property {function(IAPIResponse): void} mutationConfig.onSuccess - Callback executed upon successful user activation.
     * - Displays a success toast.
     * - Persists authentication data (token, ID, userType, email) via `storage.storeAuth`.
     * - Updates global state (`setUser`, `setUserType`, `setAuthUser`, `setAuthToken`) with new user details and authentication tokens.
     * - Persists onboarding progress locally.
     * - Sets a persistent 'userType' cookie for 'SUPERADMIN' or 'ADMIN' roles.
     *
     * @property {function(*): void} mutationConfig.onError - Callback for handling mutation errors, delegated to `handleMutationError`.
     * @property {function(): void} mutationConfig.onSettled - Callback executed after the mutation finishes (success or error), responsible for setting `loading` state to false.
     */
    const ActivateUser = useMutation({
        mutationFn: activateUser,

        onSuccess: (data: IAPIResponse) => {
            toast.success(data.data.message);

            /// Check if login was successful
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
                    storage.storeAuth(
                        token,
                        user.id,
                        user.userType,
                        user.email,
                    );

                    const ministerId =
                        user.ministerId ??
                        user.minister?._id ??
                        user.minister?.id ??
                        user.minister;

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
                        ministerId:
                            typeof ministerId === 'string' ||
                            typeof ministerId === 'number'
                                ? String(ministerId)
                                : undefined,
                    };

                    // Set user data in both stores
                    setUser(userData);
                    setUserType(user.userType);

                    // Store onboarding progress to avoid additional API calls
                    if (user.onboarding) {
                        storage.keep('onboarding_progress', user.onboarding);
                    }

                    // Set cookie for user type (for admin/super users)
                    if (
                        user.userType === UserType.SUPERADMIN ||
                        user.userType === UserType.ADMIN
                    ) {
                        cookieService.setData({
                            key: 'userType',
                            payload: user.userType,
                            expireAt: new Date(
                                Date.now() + 24 * 60 * 60 * 1000,
                            ), // 24h expiry
                            path: '/',
                        });
                    }
                }
            }
            goTo('/dashboard');
        },

        onError: handleMutationError,

        onSettled: () => {
            setGlobalLoading(false);
        },
    });

    /**
     *
     * @name Login
     * @description A React Query mutation hook for handling user authentication via username/password login.
     * This mutation integrates directly with the application's state management and persistent storage upon success.
     *
     * @property {function} mutationFn - The asynchronous login function from `AuthService.login`.
     *
     * @property {function(IAPIResponse): void} onSuccess - Handles successful login response.
     * - **Data Extraction:** Attempts to extract authentication data (`token`, `id`, `userType`, etc.) from both direct (`data.data`) and nested (`data.data.data`) API response structures.
     * - **Persistence:** Stores the authentication token and essential user details (`id`, `userType`, `email`) in persistent storage (`storage.storeAuth`).
     * - **State Update:** Updates global state via `setUser`, `setUserType`, `setAuthUser`, and `setAuthToken`.
     * - **Local Cache:** Caches `user_data`, `onboarding_progress`, and `onboarding_talent_personal` locally.
     * - **Cookie:** Sets a persistent `userType` cookie for 'SUPERADMIN' or 'ADMIN' roles.
     *
     * @property {function(*): void} onError - Handles mutation failures.
     * - Logs the error.
     * - Specifically checks for a 'Network Error' to trigger `popNetwork()`.
     * - Delegates other errors to the general `handleMutationError`.
     *
     * @property {function(): void} onSettled - Callback executed when the mutation is complete (success or error).
     * - Sets the loading state to false.
     */
    const Login = useMutation({
        mutationFn: login,

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
                    storage.storeAuth(
                        token,
                        user.id,
                        user.userType,
                        user.email,
                    );

                    const ministerId =
                        user.ministerId ??
                        user.minister?._id ??
                        user.minister?.id ??
                        user.minister;

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
                        ministerId:
                            typeof ministerId === 'string' ||
                            typeof ministerId === 'number'
                                ? String(ministerId)
                                : undefined,
                    };

                    // Set user data in both stores
                    setUser(userData);
                    setUserType(user.userType);

                    // Store onboarding progress to avoid additional API calls
                    if (user.onboarding) {
                        storage.keep('onboarding_progress', user.onboarding);
                    }

                    // Set cookie for user type (for admin/super users)
                    if (
                        user.userType === UserType.SUPERADMIN ||
                        user.userType === UserType.ADMIN
                    ) {
                        cookieService.setData({
                            key: 'userType',
                            payload: user.userType,
                            expireAt: new Date(
                                Date.now() + 24 * 60 * 60 * 1000,
                            ), // 24h expiry
                            path: '/',
                        });
                    }

                    goTo('/dashboard');
                }
            }
        },

        onError: handleMutationError,

        onSettled: () => {
            setGlobalLoading(false);
        },
    });

    const SendOtp = useMutation({
        mutationFn: sendOtp,

        onSuccess: (data: IAPIResponse) => {
            logger.log({ data: data, label: 'response data: ', type: 'info' });

            toast.success(data.message);

            setStep('otp');
            startResendCountdown();
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        },

        onError: handleMutationError,
    });

    const VerifyOtp = useMutation({
        mutationFn: verifyOtp,

        onSuccess: (data: IAPIResponse) => {
            toast.success(data.message);
            setStep('success');
        },

        onError: handleMutationError,
    });

    const ResendOtp = useMutation({
        mutationFn: resendOtp,

        onSuccess: () => {
            setFormData({ otp: Array(6).fill('') });
            setErrors({});
            setTouched({ otp: false });
            startResendCountdown();
            otpRefs.current[0]?.focus();
        },
        onError: handleMutationError,
    });

    const Logout = useMutation({
        mutationFn: logout,

        onSuccess: (data: IAPIResponse) => {
            if (data?.message) {
                setUser({});
                setUser({});

                queryClient.invalidateQueries({ queryKey: authKeys.user() });
                storage.clearAuth();

                goTo('/login');
            }
        },
        onError: (error: any) => {
            setUser({});
            setUser({});

            queryClient.invalidateQueries({ queryKey: authKeys.user() });
            storage.clearAuth();

            goTo('/login');
            handleMutationError(error);
        },
    });

    const ResetPassword = useMutation({
        mutationFn: resetPassword,
        onSuccess: (data: IAPIResponse) => {
            if (!data.error && data.status === 200) {
                // Password reset successful
                toast.success(data.data.message);
                goTo('/login');
            } else {
                // Password reset failed
            }
        },
        onError: (error) => {
            handleMutationError(error);
        },
    });

    return {
        Register,
        ActivateUser,
        Login,
        VerifyOtp,
        SendOtp,
        ResendOtp,
        Logout,
        ResetPassword,
    };
};

export default useAuth;
