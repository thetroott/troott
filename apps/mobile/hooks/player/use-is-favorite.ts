import auth from '@/api/auth';
import { UserDataQueryKey } from '@/engine/queries/query-keys';
import type { SermonItemDTO } from '@/types/sermon';
import { useUserStore } from '@/stores/user-store';
import { useQuery } from '@tanstack/react-query';

export const useIsFavorite = (item: SermonItemDTO) => {
    const api = auth;
    const { user } = useUserStore();
    const userKey = user?.id ? { id: user.id } : undefined;

    return useQuery({
        queryKey: UserDataQueryKey(userKey, item),
        queryFn: () => api,
        select: (data) => typeof data === 'object' && data.logoutUser,
        enabled: !!api && !!user?.id && !!item.id,
    });
};
