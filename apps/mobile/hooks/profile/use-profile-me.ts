import { useQuery } from '@tanstack/react-query';
import type { IAPIResponse } from '@troott/api-client';
import { queryKeys, troottAPIClient } from '@troott/api-client';
import '@/apis/config';
import storage from '@/services/storage-service';
import { useEffect, useState } from 'react';

function extractProfilePayload(res: IAPIResponse<unknown>): unknown {
    const payload = res.data as Record<string, unknown> | null | undefined;
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data: unknown }).data;
    }
    return payload;
}

type ProfileMeOptions = {
    /** When false, the query does not run (e.g. logged out). Default true. */
    enabled?: boolean;
};

/**
 * Authenticated `GET /profile/me` for mobile (same contract as web ADR 0001).
 */
export function useProfileMeQuery(options?: ProfileMeOptions) {
    const optEnabled = options?.enabled ?? true;

    const [tokenReady, setTokenReady] = useState<boolean | null>(null);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            const t = await storage.getToken();
            if (!cancelled) setTokenReady(!!t);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const enabled = optEnabled && tokenReady === true;

    return useQuery({
        queryKey: [...queryKeys.profile.me, 'mobile'],
        queryFn: async () => {
            const res = await troottAPIClient().profile.getMe();
            if (res.error) {
                throw new Error(
                    (res.message as string | undefined) ??
                        'Failed to load profile',
                );
            }
            return extractProfilePayload(res);
        },
        enabled,
        staleTime: 2 * 60 * 1000,
        retry: false,
    });
}
