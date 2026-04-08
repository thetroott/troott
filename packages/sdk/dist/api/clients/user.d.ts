import AxiosService from '@/api/core/axios';
import { IAPIResponse } from '@/api/types';
import { IListQuery } from '@/utils/interfaces';
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
declare class UserAPI {
    private axiosService;
    constructor(axiosService: AxiosService);
    /**
     * @name getUsers
     * @description Fetches a list of users from the API.
     * @param {IListQuery} payload The query parameters for fetching users.
     * @param {boolean} all Whether to fetch all users or paginated.
     * @returns {Promise<IAPIResponse>} Server response with users list.
     */
    getUsers(payload: IListQuery, all?: boolean): Promise<IAPIResponse>;
    /**
     * @name getUser
     * @description Fetches a specific user by ID or the logged-in user.
     * @param {string} userId Optional user ID. If not provided, fetches the logged-in user.
     * @returns {Promise<IAPIResponse>} Server response with user data.
     */
    getUser(userId?: string): Promise<IAPIResponse>;
    /**
     * @name getMinisters
     * @description Fetches a list of Ministers from the API.
     * @param {IListQuery} payload The query parameters for fetching Ministers.
     * @returns {Promise<IAPIResponse>} Server response with Ministers list.
     */
    getMinisters(payload: IListQuery): Promise<IAPIResponse>;
    /**
     * @name getMinister
     * @description Fetches a specific Minister by ID.
     * @param {string} userId The Minister/user ID.
     * @returns {Promise<IAPIResponse>} Server response with Minister data.
     */
    getMinister(userId: string): Promise<IAPIResponse>;
    /**
     * @name sendUsersUpdate
     * @description Sends an update notification to multiple users.
     * @param {ISendUsersUpdate} payload The data for sending updates.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    sendUsersUpdate(payload: ISendUsersUpdate): Promise<IAPIResponse>;
    /**
     * @name inviteMinister
     * @description Invites a new Minister user.
     * @param {IInviteMinister} payload The data for inviting a Minister.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    inviteMinister(payload: IInviteMinister): Promise<IAPIResponse>;
    /** @deprecated Use getMinisters */
    getTalents(payload: IListQuery): Promise<IAPIResponse>;
    /** @deprecated Use getMinister */
    getTalent(userId: string): Promise<IAPIResponse>;
    /** @deprecated Use inviteMinister */
    inviteTalent(payload: IInviteMinister): Promise<IAPIResponse>;
}
export default UserAPI;
//# sourceMappingURL=user.d.ts.map