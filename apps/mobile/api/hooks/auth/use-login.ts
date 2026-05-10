/**
 * Login Hook
 * 
 * React Query mutation hook for user login.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services';
import { clearTokens, storeToken } from '../../storage/auth';
import { LoginRequest, LoginResponse } from '../../types';
import { queryKeys } from '../../utils/query-keys';

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
      const response = await authService.login(data);

      // Store token
      if (response.token) {
        await storeToken({
          token: response.token,
        });
      }

      return response;
    },
    mutationKey: queryKeys.auth.login(),
    onSuccess: (data) => {
      // Update user query cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);
    },
    onError: () => {
      // Clear any existing tokens on login failure
      clearTokens();
    },
  });
};

