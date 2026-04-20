import AxiosService from '@/api/core/axios';
import { IAPIResponse } from '@/api/_base/types';
import { IListQuery } from '@/utils/interfaces';
import { URL_USERS, URL_LOGGEDIN_USER, URL_MINISTER } from '@/utils/path';

interface ISendUsersUpdate {
    title: string;
    content: string;
    users: Array<string>;
}

interface IInviteMinister {
    title: string;
    content: string;
    email: string;
    firstName: string;
    lastName: string;
    callbackUrl: string;
}

class UserAPI {
    constructor(private axiosService: AxiosService) {}

    /**
     * @name getUsers
     * @description Fetches a list of users from the API.
     * @param {IListQuery} payload The query parameters for fetching users.
     * @param {boolean} all Whether to fetch all users or paginated.
     * @returns {Promise<IAPIResponse>} Server response with users list.
     */
    getUsers(payload: IListQuery, all: boolean = false): Promise<IAPIResponse> {
        const { limit, page, order } = payload;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        let path = `${URL_USERS}?${q}`;
        if (all) {
            path = `${URL_USERS}/all?cache=false&${q}`;
        }

        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: path,
            isAuth: true,
            payload: {},
        });
    }

    /**
     * @name getUser
     * @description Fetches a specific user by ID or the logged-in user.
     * @param {string} userId Optional user ID. If not provided, fetches the logged-in user.
     * @returns {Promise<IAPIResponse>} Server response with user data.
     */
    getUser(userId?: string): Promise<IAPIResponse> {
        const path = userId ? `${URL_LOGGEDIN_USER}/${userId}` : URL_LOGGEDIN_USER;

        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: path,
            isAuth: true,
            payload: {},
        });
    }

    /**
     * @name getMinisters
     * @description Fetches a list of Ministers from the API.
     * @param {IListQuery} payload The query parameters for fetching Ministers.
     * @returns {Promise<IAPIResponse>} Server response with Ministers list.
     */
    getMinisters(payload: IListQuery): Promise<IAPIResponse> {
        const { limit, page, order } = payload;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: `${URL_MINISTER}?${q}`,
            isAuth: true,
            payload: {},
        });
    }

    /**
     * @name getMinister
     * @description Fetches a specific Minister by ID.
     * @param {string} userId The Minister/user ID.
     * @returns {Promise<IAPIResponse>} Server response with Minister data.
     */
    getMinister(userId: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: `${URL_MINISTER}/${userId}`,
            isAuth: true,
            payload: {},
        });
    }

    /**
     * @name sendUsersUpdate
     * @description Sends an update notification to multiple users.
     * @param {ISendUsersUpdate} payload The data for sending updates.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    sendUsersUpdate(payload: ISendUsersUpdate): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: `${URL_USERS}/send-update`,
            isAuth: true,
            payload,
        });
    }

    /**
     * @name inviteMinister
     * @description Invites a new Minister user.
     * @param {IInviteMinister} payload The data for inviting a Minister.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    inviteMinister(payload: IInviteMinister): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: `${URL_USERS}/invite-Minister`,
            isAuth: true,
            payload,
        });
    }

    /** @deprecated Use getMinisters */
    getTalents(payload: IListQuery): Promise<IAPIResponse> {
        return this.getMinisters(payload);
    }

    /** @deprecated Use getMinister */
    getTalent(userId: string): Promise<IAPIResponse> {
        return this.getMinister(userId);
    }

    /** @deprecated Use inviteMinister */
    inviteTalent(payload: IInviteMinister): Promise<IAPIResponse> {
        return this.inviteMinister(payload);
    }
}

export default UserAPI;

