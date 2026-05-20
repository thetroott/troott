/**
 * Admin DTOs — aligned with `apps/api/src/dtos/admin.dto.ts`
 * and `interfaces/admin.interface.ts`.
 */
import type { ApiUpload } from '@/models/_api-types';

export enum AdminTypeEnum {
    STAFF = 'staff',
    BOARD = 'board',
}

export enum AdminDepartmentEnum {
    PRODUCT_ENGINEERING = 'product-engineering',
    PLATFORM_ENGINEERING = 'platform-engineering',
    DEVELOPER_EXPERIENCE = 'developer-experience',
    INFRASTRUCTURE = 'infrastructure',
    DATA = 'data',
    SECURITY = 'security',
    EDUCATION = 'education',
    PEOPLE = 'people',
}

export enum CompanyRoleEnum {
    JUNIOR = 'junior',
    ASSOCIATE = 'associate',
    INTERMEDIATE = 'intermediate',
    SENIOR = 'senior',
    STAFF = 'staff',
    PRINCIPAL = 'principal',
    MANAGER = 'manager',
    DIRECTOR = 'director',
    VP = 'vp',
    EXECUTIVE = 'executive',
}

export interface CreateAdminDTO {
    code: string;
    userId: string;
    firstName: string;
    lastName: string;
    slug?: string;
    email: string;
    avatar?: ApiUpload | string;
    banner?: ApiUpload | string;
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
    avatar?: ApiUpload | string;
    banner?: ApiUpload | string;
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
    avatar?: ApiUpload;
    banner?: ApiUpload;
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
    avatar?: ApiUpload | null;
    banner?: ApiUpload | null;
    adminType: AdminTypeEnum;
    department: AdminDepartmentEnum;
    position: CompanyRoleEnum;
    accessLevel: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateAdminProfileDTO {
    bio?: string;
    avatar?: ApiUpload | null;
    banner?: ApiUpload | null;
    department?: AdminDepartmentEnum;
    position?: CompanyRoleEnum;
}
