/**
 * Current authenticated user (`GET /user`).
 */

import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../services';
import { User } from '../../types';
import { queryKeys } from '../../utils/query-keys';

/**
 * @example
 * const { data: user } = useCurrentUser();
 */
export const useCurrentUser = (enabled = true) => {
    return useQuery({
        queryKey: queryKeys.users.me(),
        queryFn: (): Promise<User> => usersService.getCurrentUser(),
        enabled,
        staleTime: 5 * 60 * 1000,
    });
};

/** @deprecated Use {@link useCurrentUser}; Troott has no `GET /user/:id`. */
export const useUser = (_userId?: string, enabled = true) => useCurrentUser(enabled);
