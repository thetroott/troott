import { useCallback } from 'react';
import useContextType from '@/state/useContextType';
import storage from '@/storage/local-storage';
import { 
    GET_LOGGEDIN_USER, 
    GET_TALENT,
    GET_TALENTS, 
    GET_USER, 
    GET_USERS, 
    SET_ITEMS 
} from '@/state/helpers/types';
import { IListQuery } from '@/utils/interfaces';
import { ICollection } from '@/state/helpers/interface';
import useNetwork from '../shared/useNetwork';
import useAuth from './useAuth';
import { troottAPIClient } from '@/api/clients/troott';

interface ISendUsersUpdate {
    title: string;
    content: string;
    users: Array<string>;
}

interface IInviteTalent {
    title: string;
    content: string;
    email: string;
    firstName: string;
    lastName: string;
    callbackUrl: string;
}

const useUser = () => {
    const { userContext, appContext } = useContextType();
    const { logout } = useAuth();
    const { popNetwork } = useNetwork(false);
    const {
        users,
        user,
        talent,
        loading,
        setLoading,
        unsetLoading,
        setCollection,
        setResource,
    } = userContext;
    
    // Access talents from appContext (if available) or userContext
    const talents = (appContext as any)?.talents || (userContext as any)?.talents || { data: [], count: 0, total: 0, pagination: {}, loading: false };
    const items = appContext.items || [];
    const loader = (userContext as any)?.loader || loading;

    /**
     * @name setItems
     * @description Sets items in the context.
     * @param {Array<any>} data - Array of items to set.
     */
    const setItems = (data: Array<any>) => {
        setResource(SET_ITEMS, data);
    };

    /**
     * @name getFullname
     * @description Gets the full name from user data.
     * @param {any} data - User data object.
     * @returns {string} Full name or '--' if not available.
     */
    const getFullname = (data: any) => {
        let result: string = '--';

        if (data && 'firstName' in data && 'lastName' in data) {
            result = `${data.firstName} ${data.lastName}`;
        }

        return result;
    };

    /**
     * @name getUsers
     * @description Fetches a list of users from the API.
     * @param {IListQuery} data - The query parameters for fetching users.
     * @param {boolean} all - Whether to fetch all users or paginated.
     * @returns {Promise<void>}
     */
    const getUsers = useCallback(async (data: IListQuery, all: boolean = false) => {
        setLoading({ option: 'resource', type: GET_USERS });

        const response = await troottAPIClient().user.getUsers(data, all);

        if (response.error === false) {
            if (response.status === 200) {
                const result: ICollection = {
                    count: response.count!,
                    total: response.total!,
                    data: response.data,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} users` : 'There are no users currently',
                };
                setCollection(GET_USERS, result);
            }
        } else {
            unsetLoading({ 
                option: 'resource', 
                type: GET_USERS,
                message: response.message ? response.message : response.data 
            });

            if (response.status === 401) {
                troottAPIClient().auth.logout();
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get users ${response.data}`);
            }
        }
    }, [setLoading, unsetLoading, setCollection, popNetwork]);

    /**
     * @name getUser
     * @description Fetches a specific user by ID or the logged-in user.
     * @param {string} id - Optional user ID. If not provided, fetches the logged-in user.
     * @returns {Promise<void>}
     */
    const getUser = useCallback(async (id?: string) => {
        const userId = id ? id : storage.getUserID();

        setLoading({ option: 'default' });

        const response = await troottAPIClient().user.getUser(userId);

        if (response.error === false) {
            setResource(GET_LOGGEDIN_USER, response.data);
            unsetLoading({ option: 'default', message: 'data fetched successfully' });
        } else {
            setResource(GET_LOGGEDIN_USER, {});
            unsetLoading({ option: 'default', message: response.message ? response.message : response.data });

            if (response.status === 401) {
                troottAPIClient().auth.logout();
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get user ${response.data}`);
            }
        }
    }, [setLoading, unsetLoading, setResource, popNetwork]);

    /**
     * @name getTalents
     * @description Fetches a list of talents from the API.
     * @param {IListQuery} data - The query parameters for fetching talents.
     * @returns {Promise<void>}
     */
    const getTalents = useCallback(async (data: IListQuery) => {
        setLoading({ option: 'resource', type: GET_TALENTS });

        const response = await troottAPIClient().user.getTalents(data);

        if (response.error === false) {
            if (response.status === 200) {
                const result: ICollection = {
                    count: response.count!,
                    total: response.total!,
                    data: response.data,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} talents` : 'There are no talents currently',
                };
                setCollection(GET_TALENTS, result);
            }
        } else {
            unsetLoading({ 
                option: 'resource', 
                type: GET_TALENTS,
                message: response.message ? response.message : response.data 
            });

            if (response.status === 401) {
                troottAPIClient().auth.logout();
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get talents ${response.data}`);
            }
        }
    }, [setLoading, unsetLoading, setCollection, popNetwork]);

    /**
     * @name getTalent
     * @description Fetches a specific talent by ID.
     * @param {string} id - Optional talent/user ID. If not provided, uses the logged-in user ID.
     * @returns {Promise<void>}
     */
    const getTalent = useCallback(async (id?: string) => {
        const userId = id ? id : storage.getUserID();

        setLoading({ option: 'default' });

        const response = await troottAPIClient().user.getTalent(userId);

        if (response.error === false) {
            setResource(GET_TALENT, response.data);
            unsetLoading({ option: 'default', message: 'data fetched successfully' });
        } else {
            setResource(GET_TALENT, {});
            unsetLoading({ option: 'default', message: response.message ? response.message : response.data });

            if (response.status === 401) {
                troottAPIClient().auth.logout();
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get talent ${response.data}`);
            }
        }
    }, [setLoading, unsetLoading, setResource, popNetwork]);

    /**
     * @name sendUsersUpdate
     * @description Sends an update notification to multiple users.
     * @param {ISendUsersUpdate} data - The data for sending updates.
     * @returns {Promise<any>}
     */
    const sendUsersUpdate = useCallback(async (data: ISendUsersUpdate) => {
        setLoading({ option: 'loader' });

        const response = await troottAPIClient().user.sendUsersUpdate(data);

        if (response.error === false) {
            unsetLoading({ option: 'loader', message: 'successful' });
        } else {
            unsetLoading({ option: 'loader', message: response.message ? response.message : response.data });

            if (response.status === 401) {
                troottAPIClient().auth.logout();
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not send verification code ${response.data}`);
            }
        }

        return response;
    }, [setLoading, unsetLoading, popNetwork]);

    /**
     * @name inviteTalent
     * @description Invites a new talent user.
     * @param {IInviteTalent} data - The data for inviting a talent.
     * @returns {Promise<any>}
     */
    const inviteTalent = useCallback(async (data: IInviteTalent) => {
        setLoading({ option: 'loader' });

        const response = await troottAPIClient().user.inviteTalent(data);

        if (response.error === false) {
            unsetLoading({ option: 'loader', message: 'successful' });
        } else {
            unsetLoading({ option: 'loader', message: response.message ? response.message : response.data });

            if (response.status === 401) {
                troottAPIClient().auth.logout();
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not send invite talent ${response.data}`);
            }
        }

        return response;
    }, [setLoading, unsetLoading, popNetwork]);

    return {
        users,
        user,
        talents,
        talent,
        loading,
        loader,
        items,

        getFullname,
        setItems,

        getUsers,
        getUser,
        getTalents,
        getTalent,

        sendUsersUpdate,
        inviteTalent,
    };
};

export default useUser;
