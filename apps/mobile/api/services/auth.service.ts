/**
 * Authentication Service
 * 
 * Service layer for authentication-related API calls.
 */

import { authEndpoints } from '../config/endpoints';
import {
  ApiResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendOtpRequest,
  ResetPasswordRequest,
  User,
  VerifyOtpRequest,
} from '../types';
import { BaseService } from './base.service';

/**
 * Authentication service
 */
export class AuthService extends BaseService {
  /**
   * Login user
   * 
   * API response structure: { data: User, token: string, status: string, message: string }
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<ApiResponse<User> & { token: string } | LoginResponse>(authEndpoints.login, data);
    
    // Handle API response structure where token is at the same level as data
    if (response && typeof response === 'object' && 'data' in response && 'token' in response) {
      const apiResponse = response as ApiResponse<User> & { token: string };
      return {
        token: apiResponse.token,
        user: apiResponse.data!,
      };
    }
    
    // Fallback to direct response structure (already in LoginResponse format)
    return response as LoginResponse;
  }

  /**
   * Register new user
   * 
   * API response structure: { data: User, token: string, status: string, message: string }
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.post<ApiResponse<User> & { token: string } | RegisterResponse>(authEndpoints.register, data);
    
    // Handle API response structure where token is at the same level as data
    if (response && typeof response === 'object' && 'data' in response && 'token' in response) {
      const apiResponse = response as ApiResponse<User> & { token: string };
      return {
        token: apiResponse.token,
        user: apiResponse.data!,
      };
    }
    
    // Fallback to direct response structure (already in RegisterResponse format)
    return response as RegisterResponse;
  }

  /**
   * Verify OTP
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(authEndpoints.verifyOtp, data);
    return this.extractData(response);
  }

  /**
   * Resend OTP
   */
  async resendOtp(data: ResendOtpRequest): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(authEndpoints.resendOtp, data);
    return this.extractData(response);
  }

  /**
   * Forgot password
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(authEndpoints.forgotPassword, data);
    return this.extractData(response);
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(authEndpoints.resetPassword, data);
    return this.extractData(response);
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(authEndpoints.changePassword, data);
    return this.extractData(response);
  }
}

/**
 * Singleton instance
 */
export const authService = new AuthService();

