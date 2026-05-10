/**
 * Logout Hook
 * 
 * React Query mutation hook for user logout.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../client';
import { authEndpoints } from '../../config/endpoints';
import { clearTokens } from '../../storage/auth';

/**
 * Logout mutation hook
 * 
 * @example
 * const logout = useLogout();
 * logout.mutate();
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

