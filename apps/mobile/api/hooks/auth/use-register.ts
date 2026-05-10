/**
 * Register Hook
 * 
 * React Query mutation hook for user registration.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services';
import { storeToken } from '../../storage/auth';
import { RegisterRequest, RegisterResponse } from '../../types';
import { queryKeys } from '../../utils/query-keys';

/**
 * Register mutation hook
 * 
 * @example
 * const register = useRegister();
 * register.mutate({ name: 'John', email: 'john@example.com', password: 'password' });
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<RegisterResponse> => {
      const response = await authService.register(data);

      // Store token
      if (response.token) {
        await storeToken({
          token: response.token,
        });
      }

      // Store profileCode in AsyncStorage for persistence
      if (response.user?.profileCode) {
        await AsyncStorage.setItem('userProfileCode', response.user.profileCode);
      }

      return response;
    },
    mutationKey: queryKeys.auth.register(),
    onSuccess: (data) => {
      // Update user query cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);
    },
  });
};

