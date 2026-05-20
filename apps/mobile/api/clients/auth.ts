/**
 * Authentication service: Troott `/auth` routes via {@link BaseService.call}.
 * Every method resolves to {@link IAPIResponse}.
 */

import type { IAPIResponse } from '@/utils/interface.utl';

import {
    URL_ACTIVATE,
    URL_CHANGE_PASSWORD,
    URL_FORGOT_PASSWORD,
    URL_LOGIN,
    URL_LOGOUT,
    URL_REGISTER,
    URL_RESEND_OTP,
    URL_RESET_PASSWORD,
    URL_VERIFY_OTP,
} from '../config/path';
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
} from '../dtos/auth.dto';
import { clearTokens } from '../services/mmkv-storage';
import { storage as sessionKv } from '../services/mmkv-storage';
import { BaseService } from '../config/api-call';
export class AuthService extends BaseService {
    /** `POST /auth/register` */
    registerUser(payload: RegisterUserDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_REGISTER,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/login` */
    loginUser(payload: LoginDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LOGIN,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/activate` */
    activateUser(payload: ActivateDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_ACTIVATE,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/verify-otp` */
    verifyOTP(payload: VerifyOtpDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_VERIFY_OTP,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/resend-otp` */
    resendOTP(payload: ResendOtpDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_RESEND_OTP,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/forgot-password` */
    forgotPassword(payload: ForgotPasswordDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_FORGOT_PASSWORD,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/reset-password` */
    resetPassword(payload: ResetPasswordDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_RESET_PASSWORD,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/change-password` */
    changePassword(payload: ChangePasswordDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_CHANGE_PASSWORD,
            isAuth: true,
            payload,
        });
    }

    /**
     * Clears local session and secure tokens, then `POST /auth/logout` without Bearer.
     */
    async logout(): Promise<IAPIResponse> {
       
        await clearTokens();
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LOGOUT,
            isAuth: false,
            payload: {},
        });
    }

    /** `POST /auth/logout` with Bearer. */
    logoutUser(payload: Partial<LogoutDTO> = {}): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LOGOUT,
            isAuth: true,
            payload: payload.userId ? { userId: payload.userId } : {},
        });
    }
}
