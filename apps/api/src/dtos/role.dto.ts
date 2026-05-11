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
