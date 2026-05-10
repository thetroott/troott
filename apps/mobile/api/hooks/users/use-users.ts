/**
 * Users Query Hook
 * 
 * React Query hook for fetching all users.
 */

import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../services';
import { GetUsersParams, User } from '../../types';
import { queryKeys } from '../../utils/query-keys';

/**
 * Get all users query hook
 * 
 * @example
 * const { data: users, isLoading } = useUsers({ limit: 10 });
 */
export const useUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: (): Promise<User[]> => usersService.getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

