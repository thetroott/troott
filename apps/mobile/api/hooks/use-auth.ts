/**
 * Authentication Hooks
 * 
 * React Query hooks for authentication endpoints with proper error handling.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, post } from '../client';
import { authEndpoints } from '../config/endpoints';
import { clearTokens, storeToken } from '../storage/auth';
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
import { queryKeys } from '../utils/query-keys';

/**
 * Login mutation hook
 * 
 * @example
 * const login = useLogin();
 * login.mutate({ email: 'user@example.com', password: 'password' });
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await post<ApiResponse<LoginResponse>>(
        authEndpoints.login,
        data
      );
      
      // Store token
      if (response.data?.token) {
        await storeToken({
          token: response.data.token,
          // Extract expiry from token if available (JWT decode)
          // For now, we'll rely on server response or set a default
        });
      }

      return response.data!;
    },
    onSuccess: (data) => {
      // Update user query cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);
    },
    onError: (error) => {
      // Clear any existing tokens on login failure
      clearTokens();
    },
  });
};

/**
 * Register mutation hook
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<RegisterResponse> => {
      const response = await post<ApiResponse<RegisterResponse>>(
        authEndpoints.register,
        data
      );

      // Store token
      if (response.data?.token) {
        await storeToken({
          token: response.data.token,
        });
      }

      return response.data!;
    },
    onSuccess: (data) => {
      // Update user query cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);
    },
  });
};

/**
 * Verify OTP mutation hook
 */
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (data: VerifyOtpRequest): Promise<void> => {
      await post(authEndpoints.verifyOtp, data);
    },
  });
};

/**
 * Resend OTP mutation hook
 */
export const useResendOtp = () => {
  return useMutation({
    mutationFn: async (data: ResendOtpRequest): Promise<void> => {
      await post(authEndpoints.resendOtp, data);
    },
  });
};

/**
 * Forgot password mutation hook
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest): Promise<void> => {
      await post(authEndpoints.forgotPassword, data);
    },
  });
};

/**
 * Reset password mutation hook
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest): Promise<void> => {
      await post(authEndpoints.resetPassword, data);
    },
  });
};

/**
 * Change password mutation hook
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest): Promise<void> => {
      await apiClient(authEndpoints.changePassword, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  });
};

/**
 * Logout mutation hook
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await apiClient(authEndpoints.logout, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      // Clear tokens
      clearTokens();
      // Clear all query cache
      queryClient.clear();
    },
    onError: () => {
      // Clear tokens even on error
      clearTokens();
      queryClient.clear();
    },
  });
};

/**
 * Get current user query hook
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async (): Promise<User | null> => {
      // This would typically fetch from a /me endpoint
      // For now, return null as placeholder
      // You'll need to implement the actual endpoint
      return null;
    },
    enabled: false, // Disable by default, enable when token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

