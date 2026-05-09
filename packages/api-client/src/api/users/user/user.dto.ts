import type { UserType } from '../../../utils/enums';

/** Listener / minister / staff user document shape (client-side). */
export interface TroottUser {
    _id?: string;
    id?: string;
    code?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    userType?: UserType;
    avatar?: string;
    coverImage?: string;
    [key: string]: unknown;
}

export default TroottUser;
