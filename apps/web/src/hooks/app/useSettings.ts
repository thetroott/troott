import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/config';
import { accountQueryKeys } from '@/constants/account-query-keys';
import type { EditUserDTO } from '@/dtos/user.dto';
import type { IAPIResponse } from '@/api/types';

export function useUpdateAccountMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: EditUserDTO) => {
            const res: IAPIResponse = await api.user.updateProfile(payload);
            if (res.error) {
                throw new Error(res.message || 'Could not update account');
            }
            return res.data;
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: accountQueryKeys.current(),
            });
        },
    });
}

export function useDeactivateAccountMutation() {
    return useMutation({
        mutationFn: async () => {
            const res: IAPIResponse = await api.user.deactivateAccount();
            if (res.error) {
                throw new Error(res.message || 'Could not deactivate account');
            }
            return res.data;
        },
    });
}
