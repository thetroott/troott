import { faker } from '@faker-js/faker';
import {
    IUserDoc,
    UserType,
    PasswordType,
    OnboardStatus,
    InviteStatus,
} from '../../src/modules/users/user/user.interface';
import User from '@/models/user.model';
import authService from '@/services/auth.service';
import { genUserCode } from '../../src/utils/helpers.util';

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
    passwordType?: PasswordType;
}

/**
 * Creates a user factory data object
 */
export const createUserData = (
    options: UserFactoryOptions = {},
): Partial<IUserDoc> => {
    const {
        userType = UserType.CREATOR,
        isActive = true,
        isActivated = true,
        isLocked = false,
        email,
        password = 'Test@1234',
        isAdmin = false,
        passwordType = PasswordType.USERGENERATED,
    } = options;

    const isUser =
        !isAdmin &&
        (userType === UserType.LISTENER || userType === UserType.USER);

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
        isUser,
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
    });
};

/**
 * Creates a minister user (legacy tests referred to this as "business")
 */
export const createMinisterUser = async (): Promise<IUserDoc> => {
    return createUser({
        userType: UserType.MINISTER,
        isAdmin: false,
    });
};

/**
 * Creates a creator user (legacy tests referred to this as "talent")
 */
export const createCreatorUser = async (): Promise<IUserDoc> => {
    return createUser({
        userType: UserType.CREATOR,
        isAdmin: false,
    });
};
