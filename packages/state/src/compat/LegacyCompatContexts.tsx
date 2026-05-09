import { troottAPIClient } from '@troott/api-client';
import { useCallback, useMemo, type ReactNode } from 'react';
import { useAuthDispatch, useAuthState } from '../domains/auth/auth.context';
import { useDataViewsDispatch, useDataViewsState } from '../domains/data-views/data-views.context';
import { useProfileDispatch, useProfileState } from '../domains/profile/profile.context';
import { useSubscriptionDispatch, useSubscriptionState } from '../domains/subscription/subscription.context';
import { useUiDispatch, useUiState } from '../domains/ui/ui.context';
import type {
    ICollection,
    ISetLoading,
    IUnsetLoading,
    ISidebarProps,
    IToastState,
    ProfileDTO,
    TroottUser,
} from '../helpers/interface';
import { collection, toastSeed } from '../helpers/seed';
import {
    GET_DISCOVERY_HOME,
    GET_PROFILE,
    SET_LOADING,
    SET_PERMISSIONS,
    SET_PLAN,
    SET_PREFERENCES,
    SET_PROFILE,
    SET_SIDEBAR,
    SET_SUBSCRIPTION,
    SET_TOAST,
    SET_USER,
    SET_USER_TYPE,
    UNSET_LOADING,
} from '../helpers/types';
import AppContext from '../app/appContext';
import UserContext from '../user/userContext';

function LegacyCompatContexts({ children }: { children: ReactNode }) {
    const auth = useAuthState();
    const authDispatch = useAuthDispatch();
    const profile = useProfileState();
    const profileDispatch = useProfileDispatch();
    const sub = useSubscriptionState();
    const subDispatch = useSubscriptionDispatch();
    const ui = useUiState();
    const uiDispatch = useUiDispatch();
    const dv = useDataViewsState();
    const dvDispatch = useDataViewsDispatch();

    const setUser = useCallback(
        (data: TroottUser | Record<string, unknown>) => {
            authDispatch({ type: SET_USER, payload: data });
        },
        [authDispatch],
    );

    const setUserType = useCallback(
        (type: string) => {
            authDispatch({ type: SET_USER_TYPE, payload: type });
        },
        [authDispatch],
    );

    const setProfile = useCallback(
        (data: ProfileDTO | null) => {
            profileDispatch({ type: SET_PROFILE, payload: data });
        },
        [profileDispatch],
    );

    const setPreferences = useCallback(
        (data: unknown) => {
            profileDispatch({ type: SET_PREFERENCES, payload: data });
        },
        [profileDispatch],
    );

    const setPermissions = useCallback(
        (data: unknown[]) => {
            authDispatch({ type: SET_PERMISSIONS, payload: data });
        },
        [authDispatch],
    );

    const setSubscription = useCallback(
        (data: unknown) => {
            subDispatch({ type: SET_SUBSCRIPTION, payload: data });
        },
        [subDispatch],
    );

    const setPlan = useCallback(
        (data: unknown) => {
            subDispatch({ type: SET_PLAN, payload: data });
        },
        [subDispatch],
    );

    const setToast = useCallback(
        (data: IToastState) => {
            uiDispatch({ type: SET_TOAST, payload: data });
        },
        [uiDispatch],
    );

    const clearToast = useCallback(() => {
        uiDispatch({
            type: SET_TOAST,
            payload: { ...toastSeed, show: false, message: '' },
        });
    }, [uiDispatch]);

    const setSidebar = useCallback(
        (data: ISidebarProps) => {
            uiDispatch({ type: SET_SIDEBAR, payload: data });
        },
        [uiDispatch],
    );

    const setCollection = useCallback(
        (type: string, data: ICollection) => {
            dvDispatch({ type, payload: data });
        },
        [dvDispatch],
    );

    const setResource = useCallback(
        (type: string, data: unknown) => {
            dvDispatch({ type, payload: data });
        },
        [dvDispatch],
    );

    const userSetLoading = useCallback(
        async (data: ISetLoading) => {
            if (data.option === 'default') {
                uiDispatch({ type: SET_LOADING });
            }
            if (data.option === 'resource' && data.type) {
                dvDispatch({
                    type: data.type,
                    payload: { ...collection, loading: true },
                });
            }
        },
        [dvDispatch, uiDispatch],
    );

    const userUnsetLoading = useCallback(
        async (data: IUnsetLoading) => {
            if (data.option === 'default') {
                uiDispatch({ type: UNSET_LOADING, payload: data.message });
            }
            if (data.option === 'resource' && data.type) {
                dvDispatch({
                    type: data.type,
                    payload: {
                        ...collection,
                        loading: false,
                        message: data.message,
                    },
                });
            }
        },
        [dvDispatch, uiDispatch],
    );

    const appSetLoading = useCallback(
        async (data: ISetLoading) => {
            if (data.option === 'default') {
                dvDispatch({ type: SET_LOADING });
            }
            if (data.option === 'resource' && data.type) {
                dvDispatch({
                    type: data.type,
                    payload: { ...collection, loading: true },
                });
            }
        },
        [dvDispatch],
    );

    const appUnsetLoading = useCallback(
        async (data: IUnsetLoading) => {
            if (data.option === 'default') {
                dvDispatch({ type: UNSET_LOADING, payload: data.message });
            }
            if (data.option === 'resource' && data.type) {
                dvDispatch({
                    type: data.type,
                    payload: {
                        ...collection,
                        loading: false,
                        message: data.message,
                    },
                });
            }
        },
        [dvDispatch],
    );

    const refreshProfile = useCallback(async () => {
        try {
            const res = await troottAPIClient().profile.getMe();
            const body = res as { error?: boolean; data?: unknown };
            if (body && !body.error && body.data) {
                profileDispatch({
                    type: GET_PROFILE,
                    payload: body.data as ProfileDTO,
                });
            }
        } catch {
            /* ignore */
        }
    }, [profileDispatch]);

    const loadDiscoveryHome = useCallback(async () => {
        try {
            const res = await troottAPIClient().discovery.getHome();
            dvDispatch({
                type: GET_DISCOVERY_HOME,
                payload: (res as { data?: unknown }).data ?? res,
            });
        } catch {
            /* SDK may be uninitialized in tests */
        }
    }, [dvDispatch]);

    const userContext = useMemo(
        () => ({
            users: dv.users,
            user: auth.user,
            userType: auth.userType,
            profile: profile.profile,
            preferences: profile.preferences,
            permissions: auth.permissions,
            subscription: sub.subscription,
            plan: sub.plan,
            loading: ui.loading,
            toast: ui.toast,
            sidebar: ui.sidebar,
            setUser,
            setUserType,
            setProfile,
            setPreferences,
            setPermissions,
            setSubscription,
            setPlan,
            setToast,
            clearToast,
            setSidebar,
            setCollection,
            setResource,
            setLoading: userSetLoading,
            unsetLoading: userUnsetLoading,
            refreshProfile,
        }),
        [
            auth.permissions,
            auth.user,
            auth.userType,
            clearToast,
            dv.users,
            profile.preferences,
            profile.profile,
            refreshProfile,
            setCollection,
            setPermissions,
            setPlan,
            setPreferences,
            setProfile,
            setResource,
            setSidebar,
            setSubscription,
            setToast,
            setUser,
            setUserType,
            sub.plan,
            sub.subscription,
            ui.loading,
            ui.sidebar,
            ui.toast,
            userSetLoading,
            userUnsetLoading,
        ],
    );

    const appContext = useMemo(
        () => ({
            sermons: dv.sermons,
            sermon: dv.sermon,
            playlists: dv.playlists,
            playlist: dv.playlist,
            ministers: dv.ministers,
            minister: dv.minister,
            listeners: dv.listeners,
            listener: dv.listener,
            creators: dv.creators,
            creator: dv.creator,
            library: dv.library,
            discoveryHome: dv.discoveryHome,
            featuredMinister: dv.featuredMinister,
            searchResults: dv.searchResults,
            plans: dv.plans,
            plan: dv.plan,
            transactions: dv.transactions,
            transaction: dv.transaction,
            loading: dv.loading,
            setCollection,
            setResource,
            setLoading: appSetLoading,
            unsetLoading: appUnsetLoading,
            loadDiscoveryHome,
        }),
        [
            appSetLoading,
            appUnsetLoading,
            dv.creator,
            dv.creators,
            dv.discoveryHome,
            dv.featuredMinister,
            dv.library,
            dv.listener,
            dv.listeners,
            dv.loading,
            dv.minister,
            dv.ministers,
            dv.plan,
            dv.playlist,
            dv.playlists,
            dv.plans,
            dv.searchResults,
            dv.sermon,
            dv.sermons,
            dv.transaction,
            dv.transactions,
            loadDiscoveryHome,
            setCollection,
            setResource,
        ],
    );

    return (
        <UserContext.Provider value={userContext}>
            <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
        </UserContext.Provider>
    );
}

export default LegacyCompatContexts;
