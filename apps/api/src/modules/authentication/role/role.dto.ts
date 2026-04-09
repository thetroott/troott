import { IRoleDoc } from './role.interface';
import { WorkspaceMemberRole } from '../../core/workspace/workspace.interface';
import { ProjectMemberRole } from '../../projects/project/project.interface';
import { HackathonMemberRole } from '../../hackathons/hackathon/hackathon.interface';

/**
 * @interface CreateRoleDTO
 * @description Data transfer object for creating a new role
 */
export interface CreateRoleDTO {
    name: string;
    description: string;
    permissions?: string[];
}

/**
 * @interface UpdateRoleDTO
 * @description Data transfer object for updating a role
 */
export interface UpdateRoleDTO {
    description?: string;
    permissions?: string[];
}

/**
 * @interface AttachRoleDTO
 * @description Data transfer object for attaching a role to a user
 */
export interface AttachRoleDTO {
    roleName: string;
}

/**
 * @interface AssignWorkspaceRoleDTO
 * @description Data transfer object for assigning workspace member role
 */
export interface AssignWorkspaceRoleDTO {
    userId: string;
    role: WorkspaceMemberRole;
}

/**
 * @interface AssignProjectRoleDTO
 * @description Data transfer object for assigning project member role
 */
export interface AssignProjectRoleDTO {
    userId: string;
    role: ProjectMemberRole;
}

/**
 * @interface AssignHackathonRoleDTO
 * @description Data transfer object for assigning hackathon member role
 */
export interface AssignHackathonRoleDTO {
    userId: string;
    role: HackathonMemberRole;
}
