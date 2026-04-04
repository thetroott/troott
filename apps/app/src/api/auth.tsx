import type { IAPIResponse } from "@/utils/interfaces.util";
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
} from "@/dtos/auth.dto";

class Auth {
  client;
  secondaryClient;

  /**
   * Creates an instance of Auth service
   * @param {any} client - Primary HTTP client for auth requests
   * @param {any} [secondaryClient] - Secondary HTTP client for specific auth operations
   */
  constructor(client: any, secondaryClient?: any) {
    this.client = client;
    this.secondaryClient = secondaryClient;
  }

  /**
   * Registers a new user
   * @param {registerUserDTO} payload - User registration data
   * @returns {Promise<any>} Registration response
   */
  register(payload: RegisterUserDTO): Promise<IAPIResponse> {
    return this.client.post("/auth/register", payload);
  }

    /**
   * Activates a user account
   * @param {ActivateDTO} payload - Account activation data
   * @returns {Promise<any>} Account activation response
   */
  activateUser(payload: ActivateDTO): Promise<IAPIResponse> {
    return this.client.post("/auth/activate", payload);
  }

  /**
   * Authenticates a user
   * @param {LoginDTO} payload - User login credentials
   * @returns {Promise<any>} Login response with auth tokens
   */
  login(payload: LoginDTO): Promise<IAPIResponse> {
    return this.client.post("/auth/login", payload);
  }

  /**
   * Verifies OTP code
   * @param {VerifyOtpDTO} payload - OTP verification data
   * @returns {Promise<any>} OTP verification response
   */
  verifyOTP(payload: VerifyOtpDTO): Promise<IAPIResponse> {
    return this.client.post("/auth/verify-otp", payload);
  }

  /**
   * Resends OTP code
   * @param {ResendOtpDTO} payload - Data for OTP resend request
   * @returns {Promise<any>} OTP resend response
   */
  resendOTP(payload: ResendOtpDTO): Promise<IAPIResponse> {
    return this.client.post("/auth/resend-otp", payload);
  }



  /**
   * Retrieves authentication token
   * @param {any} payload - Token request data
   * @returns {Promise<any>} Token response
   */
  getToken(payload: any): Promise<IAPIResponse> {
    return this.client.post("/auth/token", payload);
  }

  /**
   * Changes user password
   * @param {ChangePasswordDTO} payload - Password change data
   * @returns {Promise<any>} Password change response
   */
  changePassword(payload: ChangePasswordDTO): Promise<IAPIResponse> {
    return this.secondaryClient.post("/auth/change-password", payload);
  }

  /**
   * Logs out a user
   * @param {logoutPayload} payload - Logout request data
   * @returns {Promise<any>} Logout response
   */
  logout(payload: LogoutDTO): Promise<IAPIResponse> {
    return this.client.post("/auth/logout", payload);
  }

  /**
   * Initiates forgot password process
   * @param {ForgotPasswordDTO} payload - Forgot password request data
   * @returns {Promise<any>} Forgot password response
   */
  forgotPassword(payload: ForgotPasswordDTO): Promise<IAPIResponse> {
    return this.client.post("/auth/forgot-password", payload);
  }

  /**
   * Resets user password
   * @param {ResetPasswordDTO} payload - Password reset data
   * @returns {Promise<any>} Password reset response
   */
  resetPassword(payload: ResetPasswordDTO): Promise<IAPIResponse> {
    return this.secondaryClient.post("/auth/reset-password", payload);
  }
}

export default Auth;
