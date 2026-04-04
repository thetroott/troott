import AxiosService from '@/api/core/axios';
import { IAPIResponse } from '@/api/types';
import { IListQuery } from '@/utils/interfaces';
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
     * @name getTalents
     * @description Fetches a list of talents from the API.
     * @param {IListQuery} payload The query parameters for fetching talents.
     * @returns {Promise<IAPIResponse>} Server response with talents list.
     */
    getTalents(payload: IListQuery): Promise<IAPIResponse>;
    /**
     * @name getTalent
     * @description Fetches a specific talent by ID.
     * @param {string} userId The talent/user ID.
     * @returns {Promise<IAPIResponse>} Server response with talent data.
     */
    getTalent(userId: string): Promise<IAPIResponse>;
    /**
     * @name sendUsersUpdate
     * @description Sends an update notification to multiple users.
     * @param {ISendUsersUpdate} payload The data for sending updates.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    sendUsersUpdate(payload: ISendUsersUpdate): Promise<IAPIResponse>;
    /**
     * @name inviteTalent
     * @description Invites a new talent user.
     * @param {IInviteTalent} payload The data for inviting a talent.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    inviteTalent(payload: IInviteTalent): Promise<IAPIResponse>;
    /**
     * @name setUserType
     * @description Set user type (TALENT or BUSINESS)
     * @param {Object} payload The data for setting user type.
     * @param {string} payload.userType The user type (TALENT or BUSINESS)
     * @returns {Promise<IAPIResponse>} Server response.
     */
    setUserType(payload: {
        userType: string;
    }): Promise<IAPIResponse>;
    /**
     * @name setBasicInfo
     * @description Set basic user information
     * @param {Object} payload The data for setting basic info.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    setBasicInfo(payload: {
        firstName: string;
        lastName: string;
        phoneCode?: string;
        phoneNumber?: string;
        location: {
            address?: string;
            city?: string;
            state?: string;
            country: string;
            postalCode?: string;
        };
        timeZone: string;
    }): Promise<IAPIResponse>;
    /**
     * @name setUserInfo
     * @description Set user information (specialty, role, discovery) - works for all user types
     * @param {Object} payload The data for setting user info.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    setUserInfo(payload: {
        specialty: string;
        role: string;
        discovery: string;
    }): Promise<IAPIResponse>;
    /**
     * @name setTalentInfo
     * @description Set talent-specific information
     * @param {Object} payload The data for setting talent info.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    setTalentInfo(payload: {
        specialty: string;
        gender: string;
        dateOfBirth: string;
        occupationType: string;
        interests: Array<string>;
    }): Promise<IAPIResponse>;
    /**
     * @name setBusinessInfo
     * @description Set business-specific information
     * @param {Object} payload The data for setting business info.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    setBusinessInfo(payload: {
        businessName: string;
        businessType: string;
        industry: string;
        tags?: Array<string>;
    }): Promise<IAPIResponse>;
    /**
     * @name completeOnboarding
     * @description Complete onboarding process
     * @returns {Promise<IAPIResponse>} Server response.
     */
    completeOnboarding(): Promise<IAPIResponse>;
    /**
     * @name getOnboardingStatus
     * @description Get current onboarding status and progress
     * @returns {Promise<IAPIResponse>} Server response.
     */
    getOnboardingStatus(): Promise<IAPIResponse>;
}
export default UserAPI;
//# sourceMappingURL=user.d.ts.map