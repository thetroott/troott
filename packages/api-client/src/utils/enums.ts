/** Align with `apps/api` `UserType` where applicable. */
export enum UserType {
    SUPERADMIN = 'super-admin',
    ADMIN = 'admin',
    MINISTER = 'minister',
    CREATOR = 'creator',
    LISTENER = 'listener',
    USER = 'user',
}

export enum OtpType {
    REGISTER = 'register',
    LOGIN = 'login',
    VERIFY = 'verify',
    GENERIC = 'generic',
    PASSWORD_RESET = 'password-reset',
    ACTIVATEACCOUNT = 'activate-account',
    CHANGEPASSWORD = 'change-password',
    FORGOTPASSWORD = 'forgot-password',
}
