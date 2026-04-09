import { MapActivatedUserDTO, MapRegisteredUserDTO } from './auth.dto';
import { IUserDoc } from '../../users/user/user.interface';

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
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,

            phoneNumber: user.location?.phoneNumber || '',
            phoneCode: user.location?.phoneCode || '',
            country: user.location?.country || '',
            dateOfBirth: (user as any).dateOfBirth || null,
            gender: (user as any).gender || '',

            avatar: user.avatar?.s3Key || undefined,
            userType: user.userType,
            passwordType: user.passwordType,

            isSuper: user.isSuper,
            isAdmin: user.isAdmin,
            isOrganisation: user.isBusiness,
            isTalent: user.isTalent,

            isActive: user.isActive,
            isLocked: user.isLocked,
            lockedUntil: user.lockedUntil,

            roles: user.roles || [],
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
    ): Promise<MapActivatedUserDTO> {
        const result: MapActivatedUserDTO = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,

            phoneNumber: user.location?.phoneNumber || '',
            country: user.location?.country || '',
            dateOfBirth: (user as any).dateOfBirth || null,
            gender: (user as any).gender || '',

            avatar: user.avatar?.s3Key || undefined,
            userType: user.userType,

            onboard: {
                step: user.onboard?.step || 1,
                status: user.onboard?.status || 'not-started',
            },
            status: {
                profile: user.isActive ? 'active' : 'inactive',
            },
            inviteStatus: user.inviteStatus || 'pending',

            isSuper: user.isSuper,
            isAdmin: user.isAdmin,
            isOrganisation: user.isBusiness,
            isTalent: user.isTalent,

            isActive: user.isActive,
            isLocked: user.isLocked,
            lockedUntil: user.lockedUntil,

            roles: user.roles || [],
        };

        return result;
    }
}

export default new AuthMapper();
