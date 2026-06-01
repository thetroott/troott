import { useCallback, useMemo } from 'react';

import api from '@/api/config';
import storage from '@/api/services/local-storage';
import {
    GET_LOGGEDIN_USER,
    GET_USERS,
    SET_ITEMS,
} from '@/context/types';
import type { IAPIResponse } from '@/api/types';
import type { ICollection, IListQuery } from '@/utils/interfaces.util';
import { INTERNAL_PORTAL_ROLES } from '@/utils/roles.util';

import useAuth from './useAuth';
import useContextType from '../shared/useContextType';
import useNetwork from '../shared/useNetwork';
import { useSession } from '@/context/session/sessionState';
import cookieService from '@/api/services/cookies';

const INTERNAL_PORTAL_USER_TYPES = new Set<string>(
    INTERNAL_PORTAL_ROLES as unknown as string[],
);

function normalizeUserType(raw: string): string {
    return String(raw || '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-');
}

/**
 * Web portal gate: super-admin, admin, minister, creator vs listener / generic user.
 */
export function useWebPortalEligibility() {
    const { userContext } = useContextType();
    const { isHydratingSession } = useSession();
    const persistedType = userContext.userType;
    const user = userContext.user as { userType?: string } | null;
    const cookieType = cookieService.getUserType() || '';
    const effective = normalizeUserType(
        (user?.userType as string | undefined) ??
            persistedType ??
            cookieType,
    );

    return useMemo(() => {
        const hasType = effective.length > 0;
        const isInternal =
            hasType && INTERNAL_PORTAL_USER_TYPES.has(effective);
        const isListenerLike =
            effective === 'listener' || effective === 'user';

        return {
            userType: effective,
            isEligible: isInternal,
            isListenerLike,
            isHydratingUserType: isHydratingSession || !hasType,
        };
    }, [effective, isHydratingSession]);
}

const useUser = () => {
    const { userContext } = useContextType();
    const { logout } = useAuth();
    const { popNetwork } = useNetwork(false);

    const {
        users,
        user,
        items,
        loading,
        loader,
        setLoading,
        unsetLoading,
        setCollection,
        setResource,
    } = userContext;

    const getFullname = useCallback((data: unknown) => {
        if (
            data &&
            typeof data === 'object' &&
            'firstName' in data &&
            'lastName' in data
        ) {
            const o = data as { firstName?: string; lastName?: string };
            const name = `${o.firstName ?? ''} ${o.lastName ?? ''}`.trim();
            return name.length > 0 ? name : '--';
        }
        return '--';
    }, []);

    const setItems = useCallback(
        (data: Array<unknown>) => {
            setResource(SET_ITEMS, data);
        },
        [setResource],
    );

    const onUnauthorized = useCallback(() => {
        void logout();
    }, [logout]);

    const getUsers = useCallback(
        async (data: IListQuery, all = false) => {
            const { limit, page, order, select, ...rest } = data;
            setLoading({ option: 'resource', type: GET_USERS });

            const res: IAPIResponse = await api.user.getUsers(
                {
                    limit,
                    page,
                    order,
                    select,
                    ...rest,
                } as IListQuery,
                all,
            );

            if (!res.error && res.status === 200) {
                const list = Array.isArray(res.data) ? res.data : [];
                const result: ICollection = {
                    count: res.count ?? list.length,
                    total: res.total ?? list.length,
                    data: list,
                    pagination: res.pagination ?? {
                        next: { page: 1, limit: 25 },
                        prev: { page: 1, limit: 25 },
                    },
                    loading: false,
                    message:
                        list.length > 0
                            ? `displaying ${res.count ?? list.length} users`
                            : 'There are no users currently',
                };
                setCollection(GET_USERS, result);
            } else {
                unsetLoading({
                    option: 'default',
                    message: res.message ?? 'Request failed',
                });
                if (res.status === 401) {
                    onUnauthorized();
                } else if (res.message === 'Error: Network Error') {
                    popNetwork();
                }
            }
        },
        [
            setLoading,
            unsetLoading,
            setCollection,
            onUnauthorized,
            popNetwork,
        ],
    );

    const getUser = useCallback(
        async (id?: string) => {
            const userId = id ? id : storage.getUserID();
            setLoading({ option: 'default' });

            const res: IAPIResponse = await api.user.getUser(userId);

            if (!res.error) {
                setResource(GET_LOGGEDIN_USER, res.data);
                await unsetLoading({
                    option: 'default',
                    message: 'data fetched successfully',
                });
            } else {
                setResource(GET_LOGGEDIN_USER, {});
                await unsetLoading({
                    option: 'default',
                    message: res.message ?? 'Request failed',
                });

                if (res.status === 401) {
                    onUnauthorized();
                } else if (res.message === 'Error: Network Error') {
                    popNetwork();
                }
            }
        },
        [
            setLoading,
            unsetLoading,
            setResource,
            onUnauthorized,
            popNetwork,
        ],
    );

    return {
        users,
        user,
        loading,
        loader,
        items,

        getFullname,
        setItems,

        getUsers,
        getUser,
    };
};

export default useUser;
