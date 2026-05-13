import { UserDTO, UserProfileDTO, UserResponseDTO } from '@/dtos/user.dto';
import IRoleDoc from '@/interfaces/role.interface';
import { IUserDoc } from '@/interfaces/user.interface';

function roleToResponseString(r: string | IRoleDoc | unknown): string {
    if (typeof r === 'string') {
        return r;
    }
    if (r && typeof r === 'object' && '_id' in r) {
        const role = r as IRoleDoc;
        if (role.slug) {
            return role.slug;
        }
        if (role.name) {
            return role.name;
        }
        if (role._id != null) {
            return role._id.toString();
        }
        return '';
    }
    return '';
}

class UserMapper {
    constructor() {}

    /**
     * @name mapUserResponse
     * @param user
     * @returns UserResponseDTO
     */
    public async mapUserResponse(user: IUserDoc): Promise<UserResponseDTO> {
        return {
            id: user.id.toString(),
            code: user.code,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            email: user.email,
            slug: user.slug,

            phoneNumber: user.phoneNumber,
            phoneCode: user.phoneCode,
            countryPhone: user.countryPhone,
            altPhone: user.altPhone,
            country: user.country,
            homeCountry: user.homeCountry,
            location: user.location,

            avatar: user.avatar,
            banner: user.banner,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,

            userType: user.userType,
            isSuper: user.isSuper,
            isAdmin: user.isAdmin,
            isUser: user.isUser,
            isListener: user.isListener,
            isMinister: user.isMinister,
            isCreator: user.isCreator,

            isActive: user.isActive,
            isActivated: user.isActivated,
            isDeactivated: user.isDeactivated,
            isSuspended: user.isSuspended,
            isLocked: user.isLocked,
            lockedUntil: user.lockedUntil,

            roles: (user.roles ?? []).map(roleToResponseString),
            inviteStatus: user.inviteStatus,

            createdAt: user.createdAt ?? '',
            updatedAt: user.updatedAt ?? '',
        };
    }

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

            dateOfBirth: user.dateOfBirth,
            gender: user.gender,

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

            dateOfBirth: user.dateOfBirth,
            gender: user.gender,

            userType: user.userType,

            isActive: user.isActive,
        };

        return result;
    }
}

export default new UserMapper();
