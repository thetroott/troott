import {
    MapActivatedUserDTO,
    MapRegisteredUserDTO,
    MapUserDTO,
} from '@/dtos/auth.dto';
import type { IUserDoc } from '@/modules/users/user/user.interface';
import { UserType } from '@/modules/users/user/user.interface';

class AuthMapper {
    constructor() {}

    /**
     * @name mapRegisteredUser
     * @param user - IUserDoc
     * @returns result
     */
    public async mapRegisteredUser(
        user: IUserDoc,
    ): Promise<MapRegisteredUserDTO> {
        const result: MapRegisteredUserDTO = {
            id: user.id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType,

            phoneNumber: user.phoneNumber,
            phoneCode: user.phoneCode,
            country: user.location?.country ?? '',
            dateOfBirth: undefined,
            gender: '',

            isSuper: user.isSuper,
            isAdmin: user.isAdmin,
            isMinister: user.userType === UserType.MINISTER,
            isCreator: user.userType === UserType.CREATOR,
            isListener: user.userType === UserType.LISTENER,

            isActive: user.isActive,
            isLocked: user.isLocked,
            lockedUntil: user.lockedUntil,
            isActivated: user.isActivated,
            isDeactivated: user.isDeactivated,
            roles: (user.roles || []).map((r: any) =>
                typeof r === 'string'
                    ? r
                    : (r?.slug ?? r?.name ?? r?._id?.toString?.() ?? ''),
            ),
        };

        return result;
    }

    /**
     * @name mapActivatedUser
     * @param user - IUserDoc
     * @returns result
     */
    public async mapActivatedUser(
        user: IUserDoc,
        token: string,
    ): Promise<MapActivatedUserDTO> {
        const result: MapActivatedUserDTO = {
            user: await this.mapRegisteredUser(user),
            token: token,
        };

        return result;
    }

    /**
     * @name mapActivatedUser
     * @param user - IUserDoc
     * @returns result
     */
    public async mapUser(user: IUserDoc, token: string): Promise<MapUserDTO> {
        const result: MapUserDTO = {
            user: await this.mapRegisteredUser(user),
            token: token,
        };

        return result;
    }
}

export default new AuthMapper();
