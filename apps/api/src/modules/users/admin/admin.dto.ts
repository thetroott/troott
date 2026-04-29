import { IUserDoc } from '../user/user.interface';
import {
    AdminDepartmentEnum,
    AdminTypeEnum,
    CompanyRoleEnum,
} from './admin.interface';

export interface CreateAdminDTO {
    code: string;
    user: IUserDoc;
    firstName: string;
    lastName: string;
    email: string;
    adminType: AdminTypeEnum;
    department: AdminDepartmentEnum; // Required for all - executive board members have operational departments
    position: CompanyRoleEnum;
    accessLevel?: number;
    createdBy?: string;
}

export interface UpdateAdminDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
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
