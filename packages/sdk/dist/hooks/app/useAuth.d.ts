import { ActivateDTO, ForgotPasswordDTO, LoginDTO, LogoutDTO, RegisterUserDTO, ResendOtpDTO, ResetPasswordDTO, VerifyOtpDTO } from '@/dtos/auth.dto';
declare const useAuth: () => {
    users: import("../../state/helpers/interface").ICollection;
    user: import("../../dtos/user.dto").default;
    userType: string;
    businessType: string;
    redirect: (roles: Array<string>) => void;
    login: (data: LoginDTO) => Promise<import("../../api/types").IAPIResponse>;
    register: (data: RegisterUserDTO) => Promise<import("../../api/types").IAPIResponse>;
    logout: () => Promise<void>;
    logoutUser: (data: LogoutDTO) => Promise<import("../../api/types").IAPIResponse>;
    activateAccount: (data: ActivateDTO) => Promise<import("../../api/types").IAPIResponse>;
    resendOtp: (data: ResendOtpDTO) => Promise<import("../../api/types").IAPIResponse>;
    forgotPassword: (data: ForgotPasswordDTO) => Promise<import("../../api/types").IAPIResponse>;
    resetPassword: (data: ResetPasswordDTO) => Promise<import("../../api/types").IAPIResponse>;
    verifyOtp: (data: VerifyOtpDTO) => Promise<import("../../api/types").IAPIResponse>;
};
export default useAuth;
//# sourceMappingURL=useAuth.d.ts.map