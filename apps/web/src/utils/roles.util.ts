import { UserType } from '@troott/api-client';

/** Accounts that use the internal web portal (not listener-first mobile). */
export const INTERNAL_PORTAL_ROLES: UserType[] = [
    UserType.SUPERADMIN,
    UserType.ADMIN,
    UserType.MINISTER,
    UserType.CREATOR,
];
