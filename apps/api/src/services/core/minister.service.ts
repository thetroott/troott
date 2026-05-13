import { CreateMinisterDTO, UpdateMinisterDTO } from '@/dtos/core/minister.dto';
import ministerRepository from '@/repository/core/minister.repository';
import { IResult } from '@/interfaces/common.interface';
import { VerificationStatus, type IMinisterDoc, type DocumentUpload } from '@/interfaces/core/minister.interface';
import type { IUserDoc } from '@/interfaces/user.interface';
import { UserType } from '@/interfaces/user.interface';
import { genSlug } from '../../utils/helpers.util';
import roleService from '@/services/role.service';
import PermissionService from '@/services/permission.service';

class MinisterService {
    public result: IResult;

    constructor() {
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    public async createMinister(
        data: CreateMinisterDTO,
    ): Promise<IResult<{ minister: IMinisterDoc; user: IUserDoc }>> {
        const result: IResult<{ minister: IMinisterDoc; user: IUserDoc }> = {
            error: false,
            message: '',
            code: 200,
            data: {} as { minister: IMinisterDoc; user: IUserDoc },
        };

        const { user, email } = data;
        if (!user) {
            result.error = true;
            result.message =
                'User information is required to create a minister profile';
            result.code = 400;
            return result;
        }

        const userKey = (user as IUserDoc & { id?: string })._id || user.id;

        const existing = await ministerRepository.findOne({ user: userKey });
        if (!existing.error && existing.data) {
            result.error = true;
            result.message = 'Minister profile already exists for this user';
            result.code = 400;
            return result;
        }

        const nameSlug = genSlug(
            `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || email,
        );

        const ministerData: Partial<IMinisterDoc> = {
            firstName: user.firstName,
            lastName: user.lastName,
            email,
            phoneNumber: user.phoneNumber ?? '',
            phoneCode: user.phoneCode ?? '+234',
            country: user.country,
            countryPhone: '',
            gender: '',
            avatar:
                typeof user.avatar === 'string'
                    ? user.avatar
                    : ((user.avatar as { s3Key?: string })?.s3Key ?? ''),
            slug: nameSlug,
            profile: {
                description: '',
                ministerialName: '',
                ministryName: '',
                ministryLogo: '',
                ministryType: '',
                ministryHQLocation: { city: '', state: '', address: '' },
                phoneNumber: '',
                phoneCode: '',
                countryPhone: '',
                email: '',
                websiteUrl: '',
                socials: [],
                languages: [],
            },
            verification: {
                document: {} as DocumentUpload,
                status: VerificationStatus.PENDING,
                verifiedAt: undefined as unknown as Date,
                verifiedBy: undefined,
                isVerified: false,
                isPublic: false,
            },

            sermons: [],
            playlists: [],
            transactions: [],
            monthlyListeners: 0,

            user: userKey as IMinisterDoc['user'],
            createdBy: (data.createdBy as any) || userKey,
        };

        const createResult =
            await ministerRepository.createMinister(ministerData);
        if (createResult.error || !createResult.data) {
            result.error = true;
            result.code = 500;
            result.message = createResult.message;
            return result;
        }

        if (!user.roles || user.roles.length === 0) {
            const roleAttachResult = await roleService.attachRole(
                user,
                UserType.MINISTER,
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
            const hasMinisterRole = user.roles.some(
                (r: { name?: string; toString?: () => string }) =>
                    (r?.name || r?.toString?.()) === UserType.MINISTER,
            );
            if (!hasMinisterRole) {
                const roleAttachResult = await roleService.attachRole(
                    user,
                    UserType.MINISTER,
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

        result.message = 'Minister profile created successfully';
        result.code = 201;
        result.data = {
            minister: createResult.data as IMinisterDoc,
            user,
        };
        return result;
    }

    public async updateMinister(
        userId: string,
        data: UpdateMinisterDTO,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const findResult = await ministerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Minister profile not found';
            return result;
        }

        const minister = findResult.data as IMinisterDoc;
        const ministerId = String(minister._id || minister.id);

        const updateResult = await ministerRepository.updateMinister(
            ministerId,
            { $set: { ...data } } as any,
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Minister profile updated successfully';
        result.data = updateResult.data;
        return result;
    }

    public async getMinisterProfile(userId: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const ministerResult = await ministerRepository.findOne(
            { user: userId },
            {
                populate: [
                    { path: 'sermons' },
                    { path: 'playlists' },
                    { path: 'followers' },
                    { path: 'bites' },
                    { path: 'featuredSermons' },
                    { path: 'featuredPlaylists' },
                ],
            },
        );

        if (ministerResult.error || !ministerResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Minister profile not found';
            return result;
        }

        result.data = ministerResult.data;
        result.message = 'Minister profile retrieved successfully';
        return result;
    }

    public async submitVerification(
        userId: string,
        documents: string[],
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!documents?.length) {
            result.error = true;
            result.code = 400;
            result.message = 'At least one document is required';
            return result;
        }

        const findResult = await ministerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Minister profile not found';
            return result;
        }

        const minister = findResult.data as IMinisterDoc;
        const id = String(minister._id || minister.id);

        const updateResult = await ministerRepository.updateMinister(id, {
            $set: {
                'verification.document': documents,
                'verification.status': VerificationStatus.PENDING,
            },
        } as any);

        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.data = updateResult.data;
        result.message = 'Verification documents submitted';
        return result;
    }

    public async updateVerificationStatus(
        ministerId: string,
        status: VerificationStatus,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const findResult = await ministerRepository.findById(ministerId);
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Minister profile not found';
            return result;
        }

        const updateResult = await ministerRepository.updateMinister(
            ministerId,
            {
                $set: {
                    'verification.status': status,
                    'verification.isVerified': status === VerificationStatus.APPROVED,
                    'verification.verifiedAt':
                        status === VerificationStatus.APPROVED
                            ? new Date()
                            : null,
                },
            } as any,
        );

        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.data = updateResult.data;
        result.message = 'Verification status updated';
        return result;
    }
}

export default new MinisterService();
