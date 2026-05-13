export interface CreateRoleDTO {
    name: string;
    description: string;
    permissions?: string[];
}

export interface UpdateRoleDTO {
    description?: string;
    permissions?: string[];
}

export interface AttachRoleDTO {
    roleName: string;
}

export interface RoleResponseDTO {
    id: string;
    name: string;
    description: string;
    slug: string;
    permissions: string[];
    usersCount: number;
    createdAt: string;
    updatedAt: string;
}
