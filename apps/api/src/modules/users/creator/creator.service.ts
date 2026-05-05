import { CreateCreatorDTO, UpdateCreatorDTO } from './creator.dto';
import creatorRepository from './creator.repository';
import { IResult } from '@/modules/shared/interfaces.util';
import type { ICreatorDoc } from './creator.interface';
import type { IUserDoc } from '../user/user.interface';
import { UserType } from '../user/user.interface';
import { VerificationStatus } from '../../../utils/enums.util';
import { genSlug } from '../../../utils/helpers.util';
import roleService from '../../authentication/role/role.service';
import PermissionService from '../../authentication/permission/permission.service';

const defaultDob = (): Date => new Date('1990-01-01T00:00:00.000Z');

class CreatorService {
    public result: IResult;

    constructor() {
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    public async createCreator(
        data: CreateCreatorDTO,
    ): Promise<IResult<{ creator: ICreatorDoc; user: IUserDoc }>> {
        const result: IResult<{ creator: ICreatorDoc; user: IUserDoc }> = {
            error: false,
            message: '',
            code: 200,
            data: {} as { creator: ICreatorDoc; user: IUserDoc },
        };

        const { user } = data;
        if (!user) {
            result.error = true;
            result.code = 400;
            result.message =
                'User information is required to create a creator profile';
            return result;
        }

        const userKey = (user as IUserDoc & { id?: string })._id || user.id;

        const existing = await creatorRepository.findOne({ user: userKey });
        if (!existing.error && existing.data) {
            result.error = true;
            result.code = 400;
            result.message = 'Creator profile already exists for this user';
            return result;
        }

        const firstName = data.firstName ?? user.firstName ?? '';
        const lastName = data.lastName ?? user.lastName ?? '';
        const email = (data.email ?? user.email).toLowerCase().trim();
        const nameSlug = genSlug(`${firstName} ${lastName}`.trim() || email);

        const phoneNumber = data.phoneNumber ?? user.phoneNumber ?? '';
        const phoneCode = data.phoneCode ?? user.phoneCode ?? '+234';
        const country = data.country ?? user.location?.country ?? 'Unknown';
        const countryPhone =
            data.countryPhone ??
            `${phoneCode}${phoneNumber}`.replace(/^\++/, '');

        const creatorData: Partial<ICreatorDoc> = {
            firstName,
            lastName,
            email,
            phoneNumber,
            phoneCode,
            country,
            countryPhone,
            avatar:
                data.avatar ??
                (typeof user.avatar === 'string'
                    ? user.avatar
                    : ((user.avatar as { s3Key?: string })?.s3Key ?? '')),
            dateOfBirth: data.dateOfBirth ?? defaultDob(),
            gender: data.gender ?? 'other',
            slug: data.slug ?? nameSlug,
            description: data.description ?? '',
            bites: [],
            topBites: [],
            followers: [],
            monthlyListeners: 0,
            likes: 0,
            shares: 0,
            uploads: [],
            uploadHistory: [],
            identification: [],
            verificationStatus: VerificationStatus.PENDING,
            isVerified: false,
            accountManagers: [],
            transactions: [],
            user: userKey as ICreatorDoc['user'],
            createdBy: (data.createdBy as any) || userKey,
        };

        const createResult = await creatorRepository.createCreator(creatorData);
        if (createResult.error || !createResult.data) {
            result.error = true;
            result.code = 500;
            result.message = createResult.message;
            return result;
        }

        if (!user.roles || user.roles.length === 0) {
            const roleAttachResult = await roleService.attachRole(
                user,
                UserType.CREATOR,
            );
            if (!roleAttachResult.error && roleAttachResult.data) {
                let updatedUser = roleAttachResult.data as IUserDoc;
                const permResult =
                    await PermissionService.initiatePermissionData(updatedUser);
                if (!permResult.error && permResult.data) {
                    updatedUser = permResult.data as IUserDoc;
                }
                const uid = updatedUser?._id || userKey;
                if (uid) {
                    await PermissionService.clearUserCache(String(uid));
                }
            }
        } else {
            const hasCreatorRole = user.roles.some(
                (r: { name?: string; toString?: () => string }) =>
                    (r?.name || r?.toString?.()) === UserType.CREATOR,
            );
            if (!hasCreatorRole) {
                const roleAttachResult = await roleService.attachRole(
                    user,
                    UserType.CREATOR,
                );
                if (!roleAttachResult.error && roleAttachResult.data) {
                    const updatedUser = roleAttachResult.data as IUserDoc;
                    const uid = updatedUser?._id || userKey;
                    if (uid) {
                        await PermissionService.clearUserCache(String(uid));
                    }
                }
            }
        }

        result.message = 'Creator profile created successfully';
        result.code = 201;
        result.data = {
            creator: createResult.data as ICreatorDoc,
            user,
        };
        return result;
    }

    public async updateCreator(
        userId: string,
        data: UpdateCreatorDTO,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const findResult = await creatorRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Creator profile not found';
            return result;
        }

        const creator = findResult.data as ICreatorDoc;
        const creatorId = String(creator._id);

        const updatePayload: UpdateCreatorDTO = { ...data };
        if (updatePayload.email !== undefined) {
            updatePayload.email = updatePayload.email.toLowerCase().trim();
        }

        const updateResult = await creatorRepository.updateCreator(creatorId, {
            $set: { ...updatePayload },
        } as any);
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Creator profile updated successfully';
        result.data = updateResult.data;
        return result;
    }

    public async getCreatorProfile(userId: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const creatorResult = await creatorRepository.findOne(
            { user: userId },
            {
                populate: [
                    { path: 'bites' },
                    { path: 'topBites' },
                    { path: 'followers' },
                ],
            },
        );

        if (creatorResult.error || !creatorResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Creator profile not found';
            return result;
        }

        result.data = creatorResult.data;
        result.message = 'Creator profile retrieved successfully';
        return result;
    }

    public async getCreator(creatorId: string): Promise<IResult> {
        return creatorRepository.findCreator(creatorId, [
            { path: 'user' },
            { path: 'createdBy' },
            { path: 'bites' },
        ]);
    }

    public async submitVerification(
        userId: string,
        documents: string[],
    ): Promise<IResult> {
        if (!documents?.length) {
            return {
                error: true,
                code: 400,
                message: 'At least one document is required',
                data: {},
            };
        }

        const findResult = await creatorRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            return {
                error: true,
                code: 404,
                message: 'Creator profile not found',
                data: {},
            };
        }

        const c = findResult.data as ICreatorDoc;
        const id = String(c._id);

        const updateResult = await creatorRepository.updateCreator(id, {
            $set: {
                identification: documents,
                verificationStatus: VerificationStatus.PENDING,
            },
        } as any);
        if (updateResult.error) {
            return {
                error: true,
                code: updateResult.code,
                message: updateResult.message,
                data: {},
            };
        }
        return {
            error: false,
            code: 200,
            data: updateResult.data,
            message: 'Verification documents submitted',
        };
    }

    public async updateVerificationStatus(
        creatorId: string,
        status: VerificationStatus,
    ): Promise<IResult> {
        const findResult = await creatorRepository.findById(creatorId);
        if (findResult.error || !findResult.data) {
            return {
                error: true,
                code: 404,
                message: 'Creator profile not found',
                data: {},
            };
        }

        const updateResult = await creatorRepository.updateCreator(creatorId, {
            $set: {
                verificationStatus: status,
                isVerified: status === VerificationStatus.APPROVED,
                verifiedAt:
                    status === VerificationStatus.APPROVED ? new Date() : null,
            },
        } as any);
        if (updateResult.error) {
            return {
                error: true,
                code: updateResult.code,
                message: updateResult.message,
                data: {},
            };
        }
        return {
            error: false,
            code: 200,
            data: updateResult.data,
            message: 'Verification status updated',
        };
    }
}

export default new CreatorService();
