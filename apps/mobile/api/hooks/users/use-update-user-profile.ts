/**
 * Update listener profile (`PUT /listener`).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listenerService } from '../../services';
import { UpdateUserProfileRequest } from '../../types';
import { queryKeys } from '../../utils/query-keys';

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateUserProfileRequest): Promise<unknown> =>
            listenerService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        },
    });
};
