import { OtpType, UserType } from "../utils/enums.util";
import { IUserDoc } from "../utils/interfaces.util";

export interface RegisterUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType?: UserType;
}
export interface LoginDTO {
  email: string;
  password: string;
}

export interface ForgotPasswordDTO {
  email: string;
}
export interface verifyOtpDTO {
  email: string;
  otp: number;
  otpType: OtpType
}

export interface resendOtpDTO {
  email: string;
  otpType: OtpType
}
export interface ResetPasswordDTO {
  email: string;
  newPassword: string;
}

export interface ChangePasswordDTO  {
  currentPassword: string;
  newPassword: string;
}

export interface EditUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;

  country?: string;
  phoneNumber?: string;
  phoneCode?: string;

  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
}

export interface MatchEncryptedPasswordDTO {
  user: IUserDoc;
  hash: string;
}

export interface AuthResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;

  isActive: boolean;
  isLocked: boolean;
  accessToken: string;
  accessTokenExpiry: Date;
}

export interface MapRegisteredUserDTO {
  id: string;

  firstName: string;
  lastName: string;
  email: string;
  userType: string;

  phoneNumber: string;
  phoneCode: string;
  country: string;
  dateOfBirth?: Date;
  gender: string;
  

  isSuper: boolean;
  isAdmin: boolean;
  isMinister: boolean;
  isCreator: boolean;
  isListener: boolean;

  isActive: boolean;
  isLocked: boolean;
  isActivated: boolean;
  isDeactivated: boolean;
  lockedUntil?: Date | null;

  roles: Array<string | any>;
}


export interface MapActivatedUserDTO {
  user: MapRegisteredUserDTO;
  token: string;
}

export interface MapUserDTO {
  user: MapRegisteredUserDTO;
  token: string;
  //
}


export interface NotificationPreferencesDTO {
  email: boolean;
  push: boolean;
  sms: boolean;
}
