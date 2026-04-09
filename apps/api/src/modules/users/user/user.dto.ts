import { PasswordType, UserType } from "./user.interface";
import { IFile } from "../../../utils/interfaces.util";



export interface createUserDTO {
  email: string;
  password: string;
  passwordType: PasswordType
  userType: UserType  
  createdBy?: string
}

export interface createUserProfileDTO {
  email: string;
  userType: UserType;
  createdBy?: string 
  role?: string;
  permissions?: Array<string>;
}

export interface EditUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  phoneCode?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  avatar?: IFile | string;
  coverImage?: IFile | string;
  dateOfBirth?: Date;
  gender?: string;
  isActive?: boolean;
}

export interface UserProfileDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  phoneCode?: string;
  avatar?: string;
  country?: string;
  gender?: string;
  dateOfBirth?: Date;
  isActive?: boolean;
  userType?: string;
  roles?: string[]
}

export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;

  phoneNumber?: string;
  phoneCode?: string;
  country?: string;

  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;

  userType: string;
  isSuper: boolean;
  isAdmin: boolean;
  isOrganisation: boolean;
  isTalent: boolean;

  isActive: boolean;
  isLocked: boolean;
  lockedUntil: Date | null;
}

export interface RoleDTO {
  id: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBulkUser {
  email: string;
  password: string;
  passwordType: PasswordType;
  userType: UserType;
  createdBy?: string;
}
