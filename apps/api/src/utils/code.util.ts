import { Random } from '@btffamily/pacitude';
import { UserType } from '../modules/users/user/user.interface';

/**
 * @name genUserCode
 * @description Generates a unique, standardized identification code for a user based on their type.
 * @param {UserType} userType - The classification of the user (e.g. listener, minister).
 * @returns {string} A formatted string in the format: {abbr}-{year}-{random_6_digits}.
 */
export const genUserCode = (userType: UserType): string => {
    const name: Record<string, string> = {
        [UserType.SUPERADMIN]: 'sa',
        [UserType.ADMIN]: 'ad',
        [UserType.MINISTER]: 'mn',
        [UserType.CREATOR]: 'cr',
        [UserType.LISTENER]: 'ls',
        [UserType.USER]: 'ppl',
    };

    const baseName = name[userType] || 'ppl';
    const now = new Date();
    const year = now.getFullYear();
    const code = Random.randomNum(6);

    return `${baseName}-${year}-${code}`;
};
