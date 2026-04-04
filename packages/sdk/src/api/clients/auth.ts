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
} from '../../dtos/auth.dto';

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
    URL_VERIFY_OTP,
} from '../../utils/path';

class AuthAPI {

    constructor(private axiosService: AxiosService) {}
  
    /**
     * @name registerUser
     * @description Register a new user account.
     * @param {RegisterUserDTO} payload The data needed to register the user.
     * @param {string} payload.firstName The user's first name.
     * @param {string} payload.lastName The user's last name.
     * @param {string} payload.email The user's email address.
     * @param {string} payload.password The account password.
     * @returns {Promise<IAPIResponse>} Server response with user info.
     */
    registerUser(payload: RegisterUserDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_REGISTER,
            isAuth: false,
            payload,
        });
    }

    /**
     * @name activateUser
     * @description Activate a user account after registration using an OTP code.
     * @param {ActivateDTO} payload Data for activating the account.
     * @param {string} payload.email The email tied to the OTP.
     * @param {string} payload.otp The one time code sent to the user.
     * @returns {Promise<IAPIResponse>} Confirmation of activation.
     */
    activateUser(payload: ActivateDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_ACTIVATE,
            isAuth: false,
            payload,
        });
    }

    /**
     * @name loginUser
     * @description Log a user into the system.
     * @param {LoginDTO} payload The login request data.
     * @param {string} payload.email The user's email address.
     * @param {string} payload.password The user's password.
     * @returns {Promise<IAPIResponse>} Login result with tokens.
     */
    loginUser(payload: LoginDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LOGIN,
            isAuth: false,
            payload,
        });
    }

    /**
     * @name verifyOTP
     * @description Validate an OTP for account actions.
     * @param {VerifyOtpDTO} payload The OTP verification data.
     * @param {string} payload.email The email tied to the OTP.
     * @param {string} payload.otp The code entered by the user.
     * @returns {Promise<IAPIResponse>} Result of OTP verification.
     */
    verifyOTP(payload: VerifyOtpDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_VERIFY_OTP,
            isAuth: false,
            payload,
        });
    }

    /**
     * @name resendOTP
     * @description Request that a new OTP be sent to the user.
     * @param {ResendOtpDTO} payload The resend request data.
     * @param {string} payload.email The email that should receive the new OTP.
     * @param {string} payload.otpType The type of OTP that should be sent by the app.
     * @returns {Promise<IAPIResponse>} OTP resend status.
     */
    resendOTP(payload: ResendOtpDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_RESEND_OTP,
            isAuth: false,
            payload,
        });
    }

    /**
     * @name getToken
     * @description Fetch a refreshed token from the server.
     * @param {unknown} payload Any payload required for generating a new token.
     * @returns {Promise<IAPIResponse>} Token generation result.
     */
    getToken(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_GET_TOKEN,
            isAuth: false,
            payload,
        });
    }

    /**
     * @name changePassword
     * @description Change the user password.
     * @param {ChangePasswordDTO} payload The change password data.
     * @param {string} payload.currentPassword The user's old password.
     * @param {string} payload.newPassword The new password.
     * @returns {Promise<IAPIResponse>} Confirmation of password update.
     */
    changePassword(payload: ChangePasswordDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_CHANGE_PASSWORD,
            isAuth: true,
            payload,
        });
    }

    /**
     * @name logoutUser
     * @description Log the user out of the system.
     * @param {LogoutDTO} payload Data needed to logout.
     * @param {string} payload.userId The id of the user logging out.
     * @returns {Promise<IAPIResponse>} Logout confirmation.
     */
    logoutUser(payload: LogoutDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LOGOUT,
            isAuth: true,
            payload,
        });
    }

    /**
     * @name logoutUser
     * @description Log the user out of the system.
     * @param {LogoutDTO} payload Data needed to logout.
     * @param {string} payload.userId The id of the user logging out.
     * @returns {Promise<IAPIResponse>} Logout confirmation.
     */
    logout(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LOGOUT,
            isAuth: true,
            payload: {},
        });
    }

    /**
     * @name forgotPassword
     * @description Send an OTP for password recovery.
     * @param {ForgotPasswordDTO} payload Data for sending the reset OTP.
     * @param {string} payload.email The email of the user requesting reset.
     * @returns {Promise<IAPIResponse>} Response confirming OTP was sent.
     */
    forgotPassword(payload: ForgotPasswordDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_FORGOT_PASSWORD,
            isAuth: false,
            payload,
        });
    }

    /**
     * @name resetPassword
     * @description Reset the user's password using a valid OTP.
     * @param {ResetPasswordDTO} payload Data for resetting the password.
     * @param {string} payload.email The email of the user.
     * @param {string} payload.newPassword The new password.
     * @param {string} payload.otp The OTP used to verify the reset.
     * @returns {Promise<IAPIResponse>} Response confirming password reset.
     */
    resetPassword(payload: ResetPasswordDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_RESET_PASSWORD,
            isAuth: false,
            payload,
        });
    }
}

export default AuthAPI;
