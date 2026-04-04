import type { OtpType, UserType } from "@/utils/enums.util";


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
export interface VerifyOtpDTO {
  email: string;
  otp: number;
  otpType: OtpType
}
export interface ActivateDTO {
  email: string;
  otp: number;
  otpType: OtpType
}

export interface ResendOtpDTO {
  email: string;
  otp: number;
  otpType: OtpType
}
export interface ResetPasswordDTO {
  email: string;
  newPassword: string;
  
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}


export interface LogoutDTO {
  userId: string;
  goTo?: (url: string) => Promise<void>
}

export interface editUserDTO {
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
