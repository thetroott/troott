/**
 * Authentication service: Troott `/auth` routes via {@link BaseService.call}.
 * Every method resolves to {@link IAPIResponse}.
 */

import type { IAPIResponse } from '@/utils/interface.utl';

import { authEndpoints } from '../config/endpoints';
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
            path: authEndpoints.register,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/login` */
    loginUser(payload: LoginDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: authEndpoints.login,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/activate` */
    activateUser(payload: ActivateDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: authEndpoints.activate,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/verify-otp` */
    verifyOTP(payload: VerifyOtpDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: authEndpoints.verifyOtp,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/resend-otp` */
    resendOTP(payload: ResendOtpDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: authEndpoints.resendOtp,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/forgot-password` */
    forgotPassword(payload: ForgotPasswordDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: authEndpoints.forgotPassword,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/reset-password` */
    resetPassword(payload: ResetPasswordDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: authEndpoints.resetPassword,
            isAuth: false,
            payload,
        });
    }

    /** `POST /auth/change-password` */
    changePassword(payload: ChangePasswordDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: authEndpoints.changePassword,
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
            path: authEndpoints.logout,
            isAuth: false,
            payload: {},
        });
    }

    /** `POST /auth/logout` with Bearer. */
    logoutUser(payload: Partial<LogoutDTO> = {}): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: authEndpoints.logout,
            isAuth: true,
            payload: payload.userId ? { userId: payload.userId } : {},
        });
    }
}

export const authService = new AuthService();
