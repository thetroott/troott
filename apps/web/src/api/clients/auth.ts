import type {
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

import { IAPIResponse } from '../types';
import type AxiosService from '../core/axios';
import {
    URL_ACTIVATE,
    URL_CHANGE_PASSWORD,
    URL_FORGOT_PASSWORD,
    URL_GET_TOKEN,
    URL_LOGIN,
    URL_LOGOUT,
    URL_REGISTER,
    URL_RESEND_OTP,
    URL_RESET_PASSWORD,
    URL_LOGGEDIN_USER,
    URL_VERIFY_OTP,
} from '../core/paths';

class AuthAPI {
    constructor(private axiosService: AxiosService) {}

    registerUser(payload: RegisterUserDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_REGISTER,
            isAuth: false,
            payload,
        });
    }

    activateUser(payload: ActivateDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_ACTIVATE,
            isAuth: false,
            payload,
        });
    }

    loginUser(payload: LoginDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LOGIN,
            isAuth: false,
            payload,
        });
    }

    verifyOTP(payload: VerifyOtpDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_VERIFY_OTP,
            isAuth: false,
            payload,
        });
    }

    resendOTP(payload: ResendOtpDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_RESEND_OTP,
            isAuth: false,
            payload,
        });
    }

    getToken(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_GET_TOKEN,
            isAuth: false,
            payload,
        });
    }

    changePassword(payload: ChangePasswordDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_CHANGE_PASSWORD,
            isAuth: true,
            payload,
        });
    }

    logoutUser(payload: LogoutDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LOGOUT,
            isAuth: true,
            payload: { userId: payload.userId },
        });
    }

    logout(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LOGOUT,
            isAuth: true,
            payload: {},
        });
    }

    forgotPassword(payload: ForgotPasswordDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_FORGOT_PASSWORD,
            isAuth: false,
            payload,
        });
    }

    resetPassword(payload: ResetPasswordDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_RESET_PASSWORD,
            isAuth: false,
            payload,
        });
    }

    /** Current authenticated user (`GET /auth/user`). */
    fetchMe(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_LOGGEDIN_USER,
            isAuth: true,
            payload: {},
        });
    }
}

export default AuthAPI;
