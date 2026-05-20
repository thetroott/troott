import { UserType } from '@/models/User.model';

/** Accounts that use the internal web portal (not listener-first mobile). */
export const INTERNAL_PORTAL_ROLES: UserType[] = [
    UserType.SUPER,
    UserType.ADMIN,
    UserType.MINISTER,
    UserType.CREATOR,
];
