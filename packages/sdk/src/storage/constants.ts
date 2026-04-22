export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER_ID: 'userId',
    USER_TYPE: 'userType',
    EMAIL: 'userEmail',
    BUSINESS_TYPE: 'businessType',
} as const;

/** Keys used by {@link LocalStorageAdapter} and {@link AsyncStorageAdapter}. */
export const AUTH_STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER_ID: 'auth_user_id',
    USER_TYPE: 'auth_user_type',
    EMAIL: 'auth_email',
    BUSINESS_TYPE: 'auth_business_type',
} as const;