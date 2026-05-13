import {
    AdminDepartmentEnum,
    AdminTypeEnum,
    CompanyRoleEnum,
} from '@/interfaces/admin.interface';
import IUserDoc from '@/interfaces/user.interface';
import { Upload } from '@/interfaces/common.interface';

export interface CreateAdminDTO {
    code: string;
    user: IUserDoc;
    firstName: string;
    lastName: string;
    slug?: string;
    email: string;
    avatar?: Upload | string;
    banner?: Upload | string;
    adminType: AdminTypeEnum;
    department: AdminDepartmentEnum;
    position: CompanyRoleEnum;
    accessLevel?: number;
    createdBy?: string;
}

export interface UpdateAdminDTO {
    firstName?: string;
    lastName?: string;
    slug?: string;
    email?: string;
    avatar?: Upload | string;
    banner?: Upload | string;
    adminType?: AdminTypeEnum;
    department?: AdminDepartmentEnum;
    position?: CompanyRoleEnum;
    accessLevel?: number;
}

export interface InviteAdminDTO {
    email: string;
    resourceId?: string;
}

export interface AcceptAdminInvitationDTO {
    token: string;
    email: string;
    password: string;
}

export interface SetAdminPasswordDTO {
    password: string;
}

export interface AdminResponseDTO {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    slug: string;
    email: string;
    avatar?: Upload;
    banner?: Upload;
    adminType: AdminTypeEnum;
    department: AdminDepartmentEnum;
    position: CompanyRoleEnum;
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
    avatar?: Upload | null;
    banner?: Upload | null;
    adminType: AdminTypeEnum;
    department: AdminDepartmentEnum;
    position: CompanyRoleEnum;
    accessLevel: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateAdminProfileDTO {
    bio?: string;
    avatar?: Upload | null;
    banner?: Upload | null;
    department?: AdminDepartmentEnum;
    position?: CompanyRoleEnum;
}
