import AxiosService from '@/api/core/axios';
import { IAPIResponse } from '@/api/types';
import { CreateWorkspaceDTO, GetWorkspaceDTO, UpdateWorkspaceDTO } from '@/dtos/workspace.dto';
import { IListQuery } from '@/utils/interfaces';
declare class WorkspaceAPI {
    private axiosService;
    constructor(axiosService: AxiosService);
    /**
     * @name getWorkspace
     * @description Register a new user account.
     * @param {getWorkspaceDTO} payload The data needed to register the user.
     * @param {string} payload.id The workspace ID.
     * @returns {Promise<IAPIResponse>} Server response with user info.
     */
    getWorkspace(payload: GetWorkspaceDTO): Promise<IAPIResponse>;
    getWorkspaces(payload: IListQuery): Promise<IAPIResponse>;
    createWorkspace(payload: CreateWorkspaceDTO): Promise<IAPIResponse>;
    updateWorkspace(payload: UpdateWorkspaceDTO): Promise<IAPIResponse>;
    /**
     * @name inviteMember
     * @description Invites a member to a workspace by email
     * @param {Object} payload The data for inviting a member.
     * @param {string} payload.workspaceId The workspace ID.
     * @param {string} payload.email The email address of the member to invite.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    inviteMember(payload: {
        workspaceId: string;
        email: string;
    }): Promise<IAPIResponse>;
    /**
     * @name bulkInviteMembers
     * @description Invites multiple members to a workspace by email
     * @param {Object} payload The data for bulk inviting members.
     * @param {string} payload.workspaceId The workspace ID.
     * @param {string[]} payload.emails Array of email addresses to invite.
     * @returns {Promise<IAPIResponse>} Server response with success/failure for each email.
     */
    bulkInviteMembers(payload: {
        workspaceId: string;
        emails: string[];
    }): Promise<IAPIResponse>;
    /**
     * @name updateDomainAccess
     * @description Updates domain-based access configuration for a workspace
     * @param {Object} payload The data for updating domain access.
     * @param {string} payload.workspaceId The workspace ID.
     * @param {boolean} payload.allowDomainAccess Whether to allow domain-based access.
     * @param {string} [payload.domain] Optional domain to add to allowed domains.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    updateDomainAccess(payload: {
        workspaceId: string;
        allowDomainAccess: boolean;
        domain?: string;
    }): Promise<IAPIResponse>;
    /**
     * @name generateShareableLink
     * @description Generates a shareable link for a workspace
     * @param {Object} payload The data for generating a shareable link.
     * @param {string} payload.workspaceId The workspace ID.
     * @param {number} [payload.expiresInDays] Optional number of days until expiration (default: 7).
     * @returns {Promise<IAPIResponse>} Server response with shareable link URL.
     */
    generateShareableLink(payload: {
        workspaceId: string;
        expiresInDays?: number;
    }): Promise<IAPIResponse>;
    /**
     * @name joinWorkspaceByLink
     * @description Allows a user to join a workspace using a shareable link token
     * @param {Object} payload The data for joining via shareable link.
     * @param {string} payload.token The shareable link token.
     * @param {string} payload.workspaceId The workspace ID.
     * @param {string} [payload.userEmail] Optional user email for domain validation.
     * @returns {Promise<IAPIResponse>} Server response.
     */
    joinWorkspaceByLink(payload: {
        token: string;
        workspaceId: string;
        userEmail?: string;
    }): Promise<IAPIResponse>;
}
export default WorkspaceAPI;
//# sourceMappingURL=workspace.d.ts.map