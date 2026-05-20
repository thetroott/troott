import { useCallback, useEffect, useState, type SyntheticEvent } from 'react';

import api from '@/api/config';
import type { IListQuery } from '@/utils/interfaces';
import type { IAPIResponse } from '@/api/types';

import useContextType from '../shared/useContextType';
import useGoTo from '../shared/useGoTo';
import useNetwork from '../shared/useNetwork';

type DiscoveryHomeData = {
    banners?: unknown;
    shelves?: unknown;
    [key: string]: unknown;
};

const useApp = () => {
    const { appContext } = useContextType();
    const { toDetailRoute } = useGoTo();
    const { popNetwork } = useNetwork(false);
    const { loading, setLoading, unsetLoading } = appContext;

    const [discovery, setDiscovery] = useState<DiscoveryHomeData>({});

    useEffect(() => {}, []);

    const toggleAddResource = (e: SyntheticEvent | null, type: string) => {
        if (e) {
            e.preventDefault();
        }
        toDetailRoute(e, { route: 'core', name: `create-${type}` });
    };

    const loadDiscoveryHome = useCallback(
        async (data: IListQuery) => {
            const { limit, page, order } = data;
            const params = {
                limit: limit ?? 25,
                page: page ?? 1,
                ...(order !== undefined && { order }),
            } as IListQuery;

            await setLoading({ option: 'default' });

            const response: IAPIResponse = await api.discovery.getHome(params);

            if (response.error === false && response.status === 200) {
                const body =
                    response.data && typeof response.data === 'object'
                        ? (response.data as Record<string, unknown>)
                        : {};
                setDiscovery(body);
                await unsetLoading({
                    option: 'default',
                    message: response.message ? response.message : '',
                });
            } else if (response.error === true) {
                await unsetLoading({
                    option: 'default',
                    message: response.message
                        ? response.message
                        : String(response.data),
                });
                if (response.status === 401) {
                    await api.auth.logout();
                } else if (response.message === 'Error: Network Error') {
                    popNetwork();
                }
            }
        },
        [setLoading, unsetLoading, popNetwork],
    );

    return {
        discovery,
        loading,
        toggleAddResource,
        getDiscoveryHome: loadDiscoveryHome,
    };
};

export default useApp;
