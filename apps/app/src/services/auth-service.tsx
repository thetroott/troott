import apiCall from "@/api/config";
import storage from "@/utils/storage.util";
import type { IAPIResponse } from "@/utils/interfaces.util";
import type {
  ActivateDTO,
  ForgotPasswordDTO,
  LoginDTO,
  RegisterUserDTO,
  ResendOtpDTO,
  VerifyOtpDTO,
} from "@/dtos/auth.dto";

/**
 * AuthService
 * Handles authentication-related API calls and client-side token storage.
 */
const AuthService = {
  /**
   * @name register
   * @description register a new user.
   * @param {registerDTO} payload - The register request payload.
   * @param {string} payload.firstName - first name of the user.
   * @param {string} payload.lastName - Last name of the user.
   * @param {string} payload.email - The email of the user.
   * @param {string} payload.password - The password for the new account.
   * @returns {Promise<IAPIResponse>} The API response with success message and user info.
   */
  register: async (payload: RegisterUserDTO): Promise<IAPIResponse> => {
    const res = await apiCall.auth.register(payload);
    return res;
  },

  /**
   * @name activateUser
   * @description Activate a user account (OTP verification after registeration)
   * @param {VerifyOtpDTO} payload - The OTP verification request payload.
   * @param {string} payload.email - The email tied to the OTP.
   * @param {string} payload.otp - The OTP code entered by the user.
   * @returns {Promise<IAPIResponse>} The API response confirming verification.
   */
  activateUser: async (payload: ActivateDTO): Promise<IAPIResponse> => {
    const res = await apiCall.auth.activateUser(payload);
    return res;
  },

  /**
   * @name login
   * @description Login a user and store token/id in localStorage
   * @param {LoginDTO} payload - The login request payload.
   * @param {string} payload.email - The email of the user.
   * @param {string} payload.password - The password of the user.
   * @returns {Promise<IAPIResponse>} The API response with user data and tokens.
   */
  login: async (payload: LoginDTO): Promise<IAPIResponse> => {
    // 1. Call the login API with the provided credentials
    const response = await apiCall.auth.login(payload);

    // 2. Return the API response to the caller
    return response;
  },

  /**
   * Verify OTP.
   * @async
   * @param {VerifyOtpDTO} payload - The OTP verification request payload.
   * @param {string} payload.email - The email tied to the OTP.
   * @param {string} payload.otp - The OTP code entered by the user.
   * @returns {Promise<IAPIResponse>} The API response confirming verification.
   */
  verifyOtp: async (payload: VerifyOtpDTO): Promise<IAPIResponse> => {
    const res = await apiCall.auth.verifyOTP(payload);
    return res;
  },

  /**
   * Send OTP for password reset.
   * @async
   * @param {ForgotPasswordDTO} payload - The forgot password request payload.
   * @param {string} payload.email - The email of the user requesting reset.
   * @returns {Promise<IAPIResponse>} The API response with OTP delivery status.
   */
  sendOtp: async (payload: ForgotPasswordDTO): Promise<IAPIResponse> => {
    const res = await apiCall.auth.forgotPassword(payload);
    return res;
  },

  /**
   * Verify OTP.
   * @async
   * @param {VerifyOtpDTO} payload - The OTP verification request payload.
   * @param {string} payload.email - The email tied to the OTP.
   * @param {string} payload.otp - The OTP code entered by the user.
   * @returns {Promise<IAPIResponse>} The API response confirming verification.
   */
  resendOtp: async (payload: ResendOtpDTO): Promise<IAPIResponse> => {
    const res = await apiCall.auth.resendOTP(payload);
    return res;
  },
/**
   * Logout a user (clear local storage)
   * clears auth data
   * @param payload userId
   * @returns IAPIResponse from server
   * @goto redirects to login page.
   */
logout: async (): Promise<IAPIResponse> => {
  const res = await apiCall.auth.logout({ userId: storage.getUserID() });
  return res;
  
},

/**
 * @name resetPassword
 * @description Reset user password
 * @param {object} payload - The reset password request payload.
 * @param {string} payload.email - The email of the user.
 * @param {string} payload.newPassword - The new password.
 * @returns {Promise<IAPIResponse>} The API response with success message.
 */
resetPassword: async (payload: { email: string; newPassword: string }): Promise<IAPIResponse> => {
  const res = await apiCall.auth.resetPassword(payload);
  return res;
},
};

export default AuthService;
