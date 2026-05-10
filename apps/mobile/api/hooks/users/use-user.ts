/**
 * User Query Hook
 * 
 * React Query hook for fetching a single user by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../services';
import { User } from '../../types';
import { queryKeys } from '../../utils/query-keys';

/**
 * Get user by ID query hook
 * 
 * @example
 * const { data: user } = useUser('user-id', true);
 */
export const useUser = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: (): Promise<User> => usersService.getUserById(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

