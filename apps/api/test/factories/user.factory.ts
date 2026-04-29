import { faker } from '@faker-js/faker';
import {
    IUserDoc,
    UserType,
    PasswordType,
    OnboardStatus,
    InviteStatus,
} from '../../src/modules/user/user.interface';
import User from '../../src/modules/user/user.model';
import authService from '../../src/modules/auth/auth.service';
import { genUserCode } from '../../src/utils/code.util';

/**
 * Factory for creating test user data
 */

export interface UserFactoryOptions {
    userType?: UserType;
    isActive?: boolean;
    isActivated?: boolean;
    isLocked?: boolean;
    email?: string;
    password?: string;
    isAdmin?: boolean;
    isBusiness?: boolean;
    isTalent?: boolean;
    passwordType?: PasswordType;
}

/**
 * Creates a user factory data object
 */
export const createUserData = (
    options: UserFactoryOptions = {},
): Partial<IUserDoc> => {
    const {
        userType = UserType.TALENT,
        isActive = true,
        isActivated = true,
        isLocked = false,
        email,
        password = 'Test@1234',
        isAdmin = false,
        isBusiness = false,
        isTalent = true,
        passwordType = PasswordType.USERGENERATED,
    } = options;

    return {
        email: email || faker.internet.email().toLowerCase(),
        password,
        code: genUserCode(userType),
        userType,
        passwordType,
        isActive,
        isActivated,
        isLocked,
        isAdmin,
        isBusiness,
        isTalent,
        isUser: !isAdmin && !isBusiness && !isTalent,
        loginLimit: 0,
        login: {
            last: new Date().toISOString(),
            method: 'email' as any,
        },
        onboard: {
            step: 1,
            status: OnboardStatus.NOT_STARTED,
        },
        inviteStatus: InviteStatus.PENDING,
    };
};

/**
 * Creates and saves a test user
 */
export const createUser = async (
    options: UserFactoryOptions = {},
): Promise<IUserDoc> => {
    const userData = createUserData(options);
    const user = await User.create(userData);

    // Encrypt password if provided
    if (userData.password && userData.password !== user.password) {
        await authService.encryptUserPassword(
            user,
            userData.password as string,
        );
        await user.save();
    }

    return user;
};

/**
 * Creates multiple test users
 */
export const createUsers = async (
    count: number,
    options: UserFactoryOptions = {},
): Promise<IUserDoc[]> => {
    const users: IUserDoc[] = [];
    for (let i = 0; i < count; i++) {
        users.push(await createUser(options));
    }
    return users;
};

/**
 * Creates an admin user
 */
export const createAdminUser = async (): Promise<IUserDoc> => {
    return createUser({
        userType: UserType.ADMIN,
        isAdmin: true,
        isBusiness: false,
        isTalent: false,
    });
};

/**
 * Creates a business user
 */
export const createBusinessUser = async (): Promise<IUserDoc> => {
    return createUser({
        userType: UserType.BUSINESS,
        isAdmin: false,
        isBusiness: true,
        isTalent: false,
    });
};

/**
 * Creates a talent user
 */
export const createTalentUser = async (): Promise<IUserDoc> => {
    return createUser({
        userType: UserType.TALENT,
        isAdmin: false,
        isBusiness: false,
        isTalent: true,
    });
};
