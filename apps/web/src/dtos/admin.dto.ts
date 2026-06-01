import type { IListQuery } from '@/utils/interfaces';

export type AdminType = string;
export type AdminDepartment = string;
export type CompanyRole = string;

export interface AdminResponseDTO {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    slug: string;
    email: string;
    avatar?: string;
    banner?: string;
    adminType: AdminType;
    department: AdminDepartment;
    position: CompanyRole;
    accessLevel: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdminProfileDTO {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    email: string;
    slug: string;
    bio?: string;
    avatar?: string | null;
    banner?: string | null;
    adminType: AdminType;
    department: AdminDepartment;
    position: CompanyRole;
    accessLevel: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateAdminProfileDTO {
    bio?: string;
    avatar?: string | null;
    banner?: string | null;
    department?: AdminDepartment;
    position?: CompanyRole;
}

export interface InviteAdminDTO {
    email: string;
    resourceId?: string;
}

export interface SetAdminPasswordDTO {
    password: string;
}

export type AdminListQuery = IListQuery;
