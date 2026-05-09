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
} from './auth.dto';
import type { IAPIResponse } from '../_base/types';
import type AxiosService from '../_base/axios';
import { P } from '../_base/paths';

class AuthAPI {
    constructor(private axiosService: AxiosService) {}

    registerUser(payload: RegisterUserDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.auth.register,
            isAuth: false,
            payload,
        });
    }

    activateUser(payload: ActivateDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.auth.activate,
            isAuth: false,
            payload,
        });
    }

    loginUser(payload: LoginDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.auth.login,
            isAuth: false,
            payload,
        });
    }

    verifyOTP(payload: VerifyOtpDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.auth.verifyOtp,
            isAuth: false,
            payload,
        });
    }

    resendOTP(payload: ResendOtpDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.auth.resendOtp,
            isAuth: false,
            payload,
        });
    }

    getToken(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.auth.token,
            isAuth: false,
            payload,
        });
    }

    changePassword(payload: ChangePasswordDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.auth.changePassword,
            isAuth: true,
            payload,
        });
    }

    logoutUser(payload: LogoutDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.auth.logout,
            isAuth: true,
            payload,
        });
    }

    logout(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.auth.logout,
            isAuth: true,
            payload: {},
        });
    }

    forgotPassword(payload: ForgotPasswordDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.auth.forgotPassword,
            isAuth: false,
            payload,
        });
    }

    resetPassword(payload: ResetPasswordDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.auth.resetPassword,
            isAuth: false,
            payload,
        });
    }

    /** Same as `GET /user` — current authenticated user document. */
    fetchMe(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.user.me,
            isAuth: true,
        });
    }
}

export default AuthAPI;
