import {
    MapActivatedUserDTO,
    MapRegisteredUserDTO,
    MapUserDTO,
} from '@/dtos/auth.dto';
import type { IUserDoc } from '@/interfaces/user.interface';
import { UserType, OnboardStatus } from '@/interfaces/user.interface';
import ministerRepository from '@/repository/core/minister.repository';
import listenerRepository from '@/repository/core/listener.repository';
import creatorRepository from '@/repository/core/creator.repository';
import adminRepository from '@/repository/admin.repository';
import studioRepository from '@/repository/core/studio.repository';

function userDocId(user: IUserDoc | { _id?: unknown; id?: unknown }): string {
    const u = user as { _id?: unknown; id?: unknown };
    if (u._id != null) {
        return String(u._id);
    }
    if (u.id != null) {
        return String(u.id);
    }
    return '';
}

function refId(ref: unknown): string {
    if (ref == null) {
        return '';
    }
    if (typeof ref === 'string') {
        return ref;
    }
    if (typeof ref === 'object') {
        const o = ref as { _id?: unknown; id?: unknown };
        if (o._id != null) {
            return String(o._id);
        }
        if (o.id != null) {
            return String(o.id);
        }
    }
    return '';
}

function codeFromDoc(doc: unknown): string | undefined {
    if (doc == null || typeof doc !== 'object') {
        return undefined;
    }
    const code = (doc as { code?: string }).code;
    return typeof code === 'string' && code.trim() ? code.trim() : undefined;
}

async function resolveCode(
    ref: unknown,
    fetchById: (id: string) => Promise<{ error: boolean; data?: unknown }>,
): Promise<string | undefined> {
    const inline = codeFromDoc(ref);
    if (inline) {
        return inline;
    }
    const id = refId(ref);
    if (!id) {
        return undefined;
    }
    const res = await fetchById(id);
    if (res.error || !res.data) {
        return undefined;
    }
    return codeFromDoc(res.data);
}

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
            id: userDocId(user),
            code: user.code,
            slug: user.slug,
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
            isUser: user.isUser,
            isMinister: user.userType === UserType.MINISTER,
            isCreator: user.userType === UserType.CREATOR,
            isListener: user.userType === UserType.LISTENER,

            isActive: user.isActive,
            isLocked: user.isLocked,
            lockedUntil: user.lockedUntil,
            isActivated: user.isActivated,
            isDeactivated: user.isDeactivated,
            isSuspended: user.isSuspended,
            roles: (user.roles || []).map((r: any) => {
                if (typeof r === 'string') {
                    return r;
                }
                if (r?.slug) {
                    return r.slug;
                }
                if (r?.name) {
                    return r.name;
                }
                if (r?._id != null) {
                    return r._id.toString();
                }
                return '';
            }),

            onboard: {
                step: user.onboard?.step ?? 0,
                stage: user.onboard?.stage ?? '',
                status: user.onboard?.status ?? OnboardStatus.NOT_STARTED,
            },
        };

        const u = user as IUserDoc & {
            minister?: unknown;
            listener?: unknown;
            primaryStudio?: unknown;
        };

        result.ministerCode =
            (await resolveCode(u.minister, (id) =>
                ministerRepository.findById(id),
            )) ?? null;
        result.listenerCode =
            (await resolveCode(u.listener, (id) =>
                listenerRepository.findById(id),
            )) ?? null;
        result.studioCode =
            (await resolveCode(u.primaryStudio, (id) =>
                studioRepository.findStudioById(id),
            )) ?? null;

        if (user.userType === UserType.CREATOR) {
            const cRes = await creatorRepository.findOne({
                user: user.id,
            } as never);
            result.creatorCode = cRes.error
                ? null
                : (codeFromDoc(cRes.data) ?? null);
        } else {
            result.creatorCode = null;
        }

        if (user.isAdmin || user.userType === UserType.ADMIN) {
            const aRes = await adminRepository.findAdminByUser(userDocId(user));
            result.adminCode = aRes.error
                ? null
                : (codeFromDoc(aRes.data) ?? null);
        } else {
            result.adminCode = null;
        }

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
