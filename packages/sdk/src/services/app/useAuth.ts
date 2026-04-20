import cookieService from '@/services/cookies';
import useContextType from '@/state/useContextType';
import storage from '@/storage/local-storage';
import { useCallback, useEffect, useState } from 'react';
import useGoTo from '../shared/useGoTo';
import { troottAPIClient } from '@/api/_base/troott';

import {
    ActivateDTO,
    ForgotPasswordDTO,
    LoginDTO,
    LogoutDTO,
    RegisterUserDTO,
    ResendOtpDTO,
    ResetPasswordDTO,
    VerifyOtpDTO,
} from '@/dtos/auth.dto';
import { BusinessType, UserType } from '@/utils/enums';



const useAuth = () => {
    const { userContext } = useContextType();
    const { goTo, location, navigate, toMainRoute } = useGoTo();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const {
        users,
        user,
        userType,
        businessType,
        setUserType,
        setBusinessType,
        currentSidebar,
        setLoading,
        unsetLoading,
    } = userContext;

    useEffect(() => {
        let ut = cookieService.getUserType();
        let bt = cookieService.getBusinessType();
        setUserType(ut ? ut : '');
        setBusinessType(bt ? bt : '');
    }, []);

    useEffect(() => {
        if (!storage.checkToken() || !storage.checkUserID()) {
            if (
                location.pathname.includes('/invite') ||
                location.pathname.includes('/register') ||
                location.pathname.includes('/verify-otp') || 
                location.pathname.includes('/activate-account')
            ) {
                goTo(location.pathname);
            } else {
                troottAPIClient().auth.logout();
                goTo('/login');
            }
        } else {
            setIsLoggedIn(true);
            currentSidebar(false);

            if (
                location.pathname === '/login' ||
                location.pathname === '/home' ||
                location.pathname === '/'
            ) {
                goTo('/dashboard');
            }
        }
    }, [navigate]);

    useEffect(() => {
        let ut = cookieService.getUserType();
        let bt = cookieService.getBusinessType();
        setUserType(ut ? ut : '');
        setBusinessType(bt ? bt : '');
    }, [isLoggedIn]);


    /**
     * @name redirect
     * @description Redirects the user to the appropriate page based on their role.
     * @param {Array<string>} roles - The roles of the user.
     * @param {string} roles.userType - The user type of the user.
     * @param {string} roles.businessType - The business type of the user.
     * @param {string} roles.talentType - The talent type of the user.
     * @param {string} roles.superAdmin - The super admin type of the user.
     * @param {string} roles.admin - The admin type of the user.
     * @param {string} roles.user - The user type of the user.
     * @param {string} roles.business - The business type of the user.
     * @param {string} roles.talent - The talent type of the user.
     * @returns {Promise<void>}
     */
    const redirect = useCallback( (roles: Array<string>) => {

        if (!storage.checkToken() || !storage.checkUserID()) {
            troottAPIClient().auth.logout();
            goTo('/login');
        } else {
            const userType = cookieService.getUserType();
            //const businessType = cookieService.getBusinessType();
            const token = storage.getToken();
            

            if (token) {
                if (userType && !roles.includes(userType)) {
                    goTo('/login');
                    troottAPIClient().auth.logout();
                } else {
                    setIsLoggedIn(true);
                    currentSidebar(false); // set sidebar

                    if (
                        location.pathname === '/login' ||
                        location.pathname === '/home' ||
                        location.pathname === '/'
                    ) {
                        toMainRoute(null, 'dashboard');
                    }
                }
            } else {
                troottAPIClient().auth.logout();
                goTo('/login');
            }
        }
    }, [navigate])


    /**
     * @name login
     * @description Logs in a user.
     * @param {LoginDTO} data - The data for logging in a user.
     * @param {string} data.email - The email of the user.
     * @param {string} data.password - The password of the user.
     * @returns {Promise<Response<IAuthResponse>>} - The response from the API.
     */
    const login = async (data: LoginDTO) => {
        
        const response = await troottAPIClient().auth.loginUser(data);

        if (!response.error) {
            if (response.status === 200) {
                if (
                    response.data.userType === UserType.SUPER ||
                    response.data.userType === UserType.ADMIN
                ) {
                    // store auth credentials
                    storage.storeAuth(
                        response.token!,
                        response.data._id,
                        response.data.userType,
                        response.data.email,

                    );

                    cookieService.setData({
                        key: 'userType',
                        payload: response.data.userType,
                        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        path: '/',
                    });

                    setIsLoggedIn(true);
                }

                if (
                    response.data.userType === UserType.BUSINESS &&
                    response.data.businessType === BusinessType.EDUCATION
                ) {
                    // store auth credentials
                    storage.storeAuth(
                        response.token!,
                        response.data._id,
                        response.data.userType,
                        response.data.email,
                        response.data.businessType,
                    );

                    cookieService.setData({
                        key: 'userType',
                        payload: response.data.userType,
                        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        path: '/',
                    });

                    setIsLoggedIn(true);
                }

                if (response.data.userType === UserType.BUSINESS) {
                    // store auth credentials
                    storage.storeAuth(
                        response.token!,
                        response.data._id,
                        response.data.userType,
                        response.data.email,
                        response.data.businessType,
                    );

                    cookieService.setData({
                        key: 'userType',
                        payload: response.data.userType,
                        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        path: '/',
                    });

                    cookieService.setData({
                        key: 'businessType',
                        payload: response.data.businessType,
                        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        path: '/',
                    });
                    
                    setUserType(response.data.userType);
                    setBusinessType(response.data.businessType);

                    setIsLoggedIn(true);
                }

                
                if (response.data.userType === UserType.TALENT) {
                    // store auth credentials
                    storage.storeAuth(
                        response.token!,
                        response.data._id,
                        response.data.userType,
                        response.data.email,
                    );

                    cookieService.setData({
                        key: 'userType',
                        payload: response.data.userType,
                        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        path: '/',
                    });
                    
                    setUserType(response.data.userType);

                    setIsLoggedIn(true);
                }
            }

            if (response.status === 206) {
            }
        }

        return response;
    };

    /**
     * @name logout
     * @description Logs out a user.
     * @returns {Promise<void>}
     */
    const logout = async () => {
        await troottAPIClient().auth.logout();
        storage.clearAuth();
        cookieService.removeData({ key: 'userType' });
        cookieService.removeData({ key: 'token' });
        cookieService.removeData({ key: 'userID' });
        cookieService.removeData({ key: 'email' });
        cookieService.removeData({ key: 'userType' });
        cookieService.removeData({ key: 'businessType' });

        setUserType('');
        setBusinessType(''); 

        goTo('/login');
        setIsLoggedIn(false);

    };

    /**
     * @name logoutUser
     * @description Logs out a user.
     * @param {LogoutDTO} data - The data for logging out a user.
     * @param {string} data.userId - The ID of the user.
     * @returns {Promise<Response<IAuthResponse>>} - The response from the API.
     */
    const logoutUser = useCallback(
        async (data: LogoutDTO) => {
            setLoading({ option: 'default' });

            const response = await troottAPIClient().auth.logoutUser({
                userId: data.userId || storage.getUserID(),
            });
            if (!response.error) {
                setIsLoggedIn(false);
                storage.clearAuth();
                cookieService.removeData({ key: 'userType' });
                cookieService.removeData({ key: 'token' });
                cookieService.removeData({ key: 'userID' });
                cookieService.removeData({ key: 'email' });
                cookieService.removeData({ key: 'userType' });
                cookieService.removeData({ key: 'businessType' });

                setUserType('');
                setBusinessType('');

                unsetLoading({ option: 'default', message: 'successful' });

                goTo('/login');
            }
            return response;
        },
        [setLoading],
    );

    /**
     * @name register
     * @description Registers a new user.
     * @param {RegisterUserDTO} data - The data for registering a new user.
     * @param {string} data.email - The email of the user.
     * @param {string} data.password - The password of the user.
     * @returns {Promise<Response<IAuthResponse>>} - The response from the API.
     */
    const register = useCallback(
        async (data: RegisterUserDTO) => {
            setLoading({ option: 'default' });

            const response = await troottAPIClient().auth.registerUser(data);

            if (!response.error) {
                setIsLoggedIn(false);
                unsetLoading({
                    option: 'default',
                    message: 'successful',
                });
            }

            return response;
        },
        [setLoading],
    );

    /**
     * @name verifyOtp
     * @description Verifies an OTP sent to the user's email.
     * @param {VerifyOtpDTO} data - The data for verifying an OTP.
     * @param {string} data.email - The email of the user.
     * @param {number} data.otp - The OTP sent to the user's email.
     * @param {OtpType} data.otpType - The type of OTP.
     * @returns {Promise<Response<IAuthResponse>>} - The response from the API.
     */
    const verifyOtp = useCallback(
        async (data: VerifyOtpDTO) => {
            setLoading({ option: 'default' });

            const response = await troottAPIClient().auth.verifyOTP({
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
        [setLoading],
    );

    /**
     * @name activateAccount
     * @description Activates an account.
     * @param {ActivateDTO} data - The data for activating an account.
     * @param {string} data.email - The email of the user.
     * @param {number} data.otp - The OTP sent to the user's email.
     * @param {OtpType} data.otpType - The type of OTP.
     * @returns {Promise<Response<IAuthResponse>>} - The response from the API.
     */
    const activateAccount = useCallback(
        async (data: ActivateDTO) => {
            setLoading({ option: 'default' });

            const response = await troottAPIClient().auth.activateUser({
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
        [setLoading],
    );

    /**
     * @name resendOtp
     * @description Resends an OTP to the user's email.
     * @param {ResendOtpDTO} data - The data for resending an OTP.
     * @param {string} data.email - The email of the user.
     * @param {OtpType} data.otpType - The type of OTP.
     * @returns {Promise<Response<IAuthResponse>>} - The response from the API.
     */
    const resendOtp = useCallback(
        async (data: ResendOtpDTO) => {
            const { email, otpType } = data;
            const response = await troottAPIClient().auth.resendOTP({
                email,
                otpType,
            });
            if (!response.error) {
                setIsLoggedIn(false);
                unsetLoading({ option: 'default', message: 'successful' });
            }

            return response;
        },
        [setLoading],
    );

    /**
     * @name forgotPassword
     * @description Forgets a password.
     * @param {ForgotPasswordDTO} data - The data for forgetting a password.
     * @param {string} data.email - The email of the user.
     * @returns {Promise<Response<IAuthResponse>>} - The response from the API.
     */
    const forgotPassword = useCallback(
        async (data: ForgotPasswordDTO) => {
            setLoading({ option: 'default' });

            const response = await troottAPIClient().auth.forgotPassword({
                email: data.email,
            });

            if (!response.error) {
                setIsLoggedIn(false);
                unsetLoading({ option: 'default', message: 'successful' });
            }
            return response;
        },
        [setLoading],
    );

    /**
     * @name resetPassword
     * @description Resets a password.
     * @param {ResetPasswordDTO} data - The data for resetting a password.
     * @param {string} data.newPassword - The new password of the user.
     * @param {string} data.email - The email of the user.
     * @returns {Promise<Response<IAuthResponse>>} - The response from the API.
     */
    const resetPassword = useCallback(
        async (data: ResetPasswordDTO) => {
            const { newPassword, email } = data;

            setLoading({ option: 'default' });

            const response = await troottAPIClient().auth.resetPassword({
                newPassword,
                email,
            });
            if (!response.error) {
                setIsLoggedIn(false);
                unsetLoading({ option: 'default', message: 'successful' });
            }
            return response;
        },
        [setLoading],
    );

    return {
        users,
        user,
        userType,
        businessType,
        
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
    };
};

export default useAuth;
