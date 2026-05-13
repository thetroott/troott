import { UserDTO, UserProfileDTO } from '@/dtos/user.dto';
import { IUserDoc } from '@/interfaces/user.interface';

class UserMapper {
    constructor() {}

    /**
     * @name mapUser
     * @param user
     * @returns UserDTO
     */
    public async mapUser(user: IUserDoc): Promise<UserDTO> {
        const result: UserDTO = {
            id: user.id.toString(),
            code: user.code,
            slug: user.slug,

            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,

            phoneNumber: user.phoneNumber,
            phoneCode: user.phoneCode,
            country: user.location?.country,

            dateOfBirth: undefined,
            gender: undefined,

            userType: user.userType,
            isSuper: user.isSuper,
            isAdmin: user.isAdmin,
            isUser: user.isUser,
            isListener: user.isListener,
            isMinister: user.isMinister,
            isCreator: user.isCreator,

            isActive: user.isActive,
            isLocked: user.isLocked,
            lockedUntil: user.lockedUntil,
        };

        return result;
    }

    /**
     * @name mapUserProfile
     * @param user
     * @returns UserDTO
     */
    public async mapUserProfile(user: IUserDoc): Promise<UserProfileDTO> {
        const result: UserProfileDTO = {
            id: user.id.toString(),
            code: user.code,

            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,

            phoneNumber: user.phoneNumber,
            phoneCode: user.phoneCode,
            country: user.location?.country,

            dateOfBirth: undefined,
            gender: undefined,

            userType: user.userType,

            isActive: user.isActive,
        };

        return result;
    }
}

export default new UserMapper();
