/**
 * Update User Profile Hook
 * 
 * React Query mutation hook for updating user profile.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services';
import { UpdateUserProfileRequest, User } from '../../types';
import { queryKeys } from '../../utils/query-keys';

/**
 * Update user profile mutation hook
 * 
 * @example
 * const updateProfile = useUpdateUserProfile();
 * updateProfile.mutate({ name: 'New Name' });
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest): Promise<User> => 
      usersService.updateProfile(data),
    onSuccess: (data) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.users.detail(data.id), data);
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

