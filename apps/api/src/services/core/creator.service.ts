import { CreateCreatorDTO, UpdateCreatorDTO } from '@/dtos/core/creator.dto';
import creatorRepository from '@/repository/core/creator.repository';
import { IResult } from '@/interfaces/common.interface';
import type { ICreatorDoc } from '@/interfaces/core/creator.interface';
import { CreatorStatus } from '@/interfaces/core/creator.interface';
import type { IUserDoc } from '@/interfaces/user.interface';
import {
    UserType,
    OnboardStage,
    OnboardStatus,
} from '@/interfaces/user.interface';
import { VerificationStatus } from '@/interfaces/core/minister.interface';
import { genSlug } from '../../utils/helpers.util';
import roleService from '@/services/role.service';
import PermissionService from '@/services/permission.service';
import studioService from '@/services/core/studio.service';
import userRepository from '@/repository/user.repository';
import creatorMapper from '@/mappers/creator.mapper';
import { normalizeStorageReferenceToS3Key } from '@/utils/helpers.util';

const defaultDob = (): Date => new Date('1990-01-01T00:00:00.000Z');

const STEP_PERSONAL = 1;
const STEP_DOCUMENT = 2;
const STEP_ADDRESS = 3;
const STEP_MINISTRY = 4;
const STEP_TOUR = 5;
const STEP_FIRST_SERMON = 6;

function creatorOnboardingStep(c: ICreatorDoc): number {
    const s = c.onboarding?.step;
    return typeof s === 'number' ? s : 0;
}

class CreatorService {
    public result: IResult;

    constructor() {
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    private async syncOnboarding(
        userId: string,
        creatorId: string,
        step: number,
        stage: OnboardStage,
        userOnboardStatus: OnboardStatus,
        creatorOnboardStatus: string,
    ): Promise<void> {
        await creatorRepository.updateCreator(creatorId, {
            $set: {
                'onboarding.step': step,
                'onboarding.status': creatorOnboardStatus,
            },
        } as any);
        await userRepository.updateUser(userId, {
            'onboard.step': step,
            'onboard.stage': stage,
            'onboard.status': userOnboardStatus,
        } as any);
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
        const countryPhone =
            data.countryPhone ??
            `${phoneCode}${phoneNumber}`.replace(/^\++/, '');

        const creatorData: Partial<ICreatorDoc> = {
            code: `creator-${nameSlug}`,
            firstName,
            lastName,
            email,
            phoneNumber,
            phoneCode,
            country: (data.country ?? user.country) as ICreatorDoc['country'],
            homeCountry: (user.homeCountry ??
                user.country) as ICreatorDoc['homeCountry'],
            countryPhone,
            avatar:
                data.avatar ??
                (typeof user.avatar === 'string'
                    ? user.avatar
                    : ((user.avatar as { s3Key?: string })?.s3Key ?? '')),
            banner: data.banner ?? '',
            dateOfBirth: data.dateOfBirth ?? defaultDob(),
            gender: data.gender ?? 'other',
            slug: data.slug ?? nameSlug,
            published: false,
            status: CreatorStatus.ACTIVE,
            profile: {
                displayName: data.profile?.displayName ?? '',
                description: data.profile?.description ?? '',
                username: data.profile?.username ?? '',
                websiteUrl: data.profile?.websiteUrl ?? '',
                socials: data.profile?.socials ?? [],
                languages: data.profile?.languages ?? [],
            },
            onboarding: {
                step: 0,
                status: OnboardStatus.NOT_STARTED,
            } as ICreatorDoc['onboarding'],
            verification: {
                document: {} as any,
                status: VerificationStatus.PENDING,
                verifiedAt: undefined as unknown as Date,
                verifiedBy: undefined,
                isVerified: false,
                isPublic: false,
            },
            transactions: [],
            monthlyListeners: 0,
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

        const creator = createResult.data as ICreatorDoc;
        const creatorId = String(creator._id || creator.id);
        const userId = String(userKey);

        await userRepository.updateUser(userId, {
            isCreator: true,
        } as any);

        const studioProvision = await studioService.provisionDefaultStudioForCreator(
            creatorId,
            userId,
        );
        if (studioProvision.error) {
            result.error = true;
            result.code = studioProvision.code || 500;
            result.message = studioProvision.message;
            return result;
        }

        result.message = 'Creator profile created successfully';
        result.code = 201;
        result.data = {
            creator,
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
        if (typeof updatePayload.avatar === 'string') {
            updatePayload.avatar = normalizeStorageReferenceToS3Key(
                updatePayload.avatar,
            );
        }
        if (typeof updatePayload.banner === 'string') {
            updatePayload.banner = normalizeStorageReferenceToS3Key(
                updatePayload.banner,
            );
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
        result.data = await creatorMapper.mapCreatorOwnerResponse(
            updateResult.data as ICreatorDoc,
        );
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
                populate: [{ path: 'sermons' }, { path: 'playlists' }],
            },
        );

        if (creatorResult.error || !creatorResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Creator profile not found';
            return result;
        }

        result.data = await creatorMapper.mapCreatorOwnerResponse(
            creatorResult.data as ICreatorDoc,
        );
        result.message = 'Creator profile retrieved successfully';
        return result;
    }

    public async getCreator(creatorId: string): Promise<IResult> {
        return creatorRepository.findCreator(creatorId, [
            { path: 'user' },
            { path: 'createdBy' },
        ]);
    }

    public async submitVerification(
        userId: string,
        documents: unknown,
    ): Promise<IResult> {
        const list = Array.isArray(documents) ? documents : [documents];
        if (!list.length) {
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
        const step = creatorOnboardingStep(c);
        if (step < STEP_PERSONAL) {
            return {
                error: true,
                code: 400,
                message:
                    'Complete personal information before submitting verification',
                data: {},
            };
        }

        let verificationDocument: unknown = documents;
        if (Array.isArray(documents)) {
            verificationDocument = documents.map((doc) => {
                if (!doc || typeof doc !== 'object') {
                    return doc;
                }
                const d = doc as { frontPage?: string; backPage?: string };
                return {
                    ...d,
                    ...(d.frontPage
                        ? {
                              frontPage: normalizeStorageReferenceToS3Key(
                                  d.frontPage,
                              ),
                          }
                        : {}),
                    ...(d.backPage
                        ? {
                              backPage: normalizeStorageReferenceToS3Key(
                                  d.backPage,
                              ),
                          }
                        : {}),
                };
            });
        } else if (documents && typeof documents === 'object') {
            const d = documents as { frontPage?: string; backPage?: string };
            verificationDocument = {
                ...d,
                ...(d.frontPage
                    ? {
                          frontPage: normalizeStorageReferenceToS3Key(
                              d.frontPage,
                          ),
                      }
                    : {}),
                ...(d.backPage
                    ? {
                          backPage: normalizeStorageReferenceToS3Key(
                              d.backPage,
                          ),
                      }
                    : {}),
            };
        }

        const updateResult = await creatorRepository.updateCreator(id, {
            $set: {
                'verification.document': verificationDocument,
                'verification.status': VerificationStatus.PENDING,
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

        const nextStep = Math.max(step, STEP_DOCUMENT);
        await this.syncOnboarding(
            userId,
            id,
            nextStep,
            OnboardStage.CREATOR_DOCUMENT,
            OnboardStatus.IN_PROGRESS,
            OnboardStatus.IN_PROGRESS,
        );

        return {
            error: false,
            code: 200,
            data: updateResult.data,
            message: 'Verification documents submitted',
        };
    }

    public async onboardingDocumentComplete(userId: string): Promise<IResult> {
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
        const id = String(creator._id);
        const step = creatorOnboardingStep(creator);
        if (step >= STEP_DOCUMENT) {
            result.message = 'Document step already recorded';
            result.data = creator;
            return result;
        }
        if (step < STEP_PERSONAL) {
            result.error = true;
            result.code = 400;
            result.message =
                'Complete personal information before document step';
            return result;
        }
        await this.syncOnboarding(
            userId,
            id,
            STEP_DOCUMENT,
            OnboardStage.CREATOR_DOCUMENT,
            OnboardStatus.IN_PROGRESS,
            OnboardStatus.IN_PROGRESS,
        );
        result.message = 'Document onboarding step updated';
        return result;
    }

    public async onboardingPersonalComplete(userId: string): Promise<IResult> {
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
        const id = String(creator._id);
        const step = creatorOnboardingStep(creator);
        if (step >= STEP_PERSONAL) {
            result.message = 'Personal step already recorded';
            return result;
        }
        await this.syncOnboarding(
            userId,
            id,
            STEP_PERSONAL,
            OnboardStage.CREATOR_PERSONAL,
            OnboardStatus.IN_PROGRESS,
            OnboardStatus.IN_PROGRESS,
        );
        result.message = 'Personal onboarding step recorded';
        return result;
    }

    public async onboardingAddressComplete(userId: string): Promise<IResult> {
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
        const id = String(creator._id);
        const step = creatorOnboardingStep(creator);
        if (step >= STEP_ADDRESS) {
            result.message = 'Address step already recorded';
            return result;
        }
        if (step < STEP_DOCUMENT) {
            result.error = true;
            result.code = 400;
            result.message = 'Complete document verification first';
            return result;
        }
        await this.syncOnboarding(
            userId,
            id,
            STEP_ADDRESS,
            OnboardStage.CREATOR_ADDRESS,
            OnboardStatus.IN_PROGRESS,
            OnboardStatus.IN_PROGRESS,
        );
        result.message = 'Address onboarding step recorded';
        return result;
    }

    public async onboardingMinistryComplete(userId: string): Promise<IResult> {
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
        const id = String(creator._id);
        const step = creatorOnboardingStep(creator);
        if (step >= STEP_MINISTRY) {
            result.message = 'Ministry step already recorded';
            return result;
        }
        if (step < STEP_ADDRESS) {
            result.error = true;
            result.code = 400;
            result.message = 'Complete address step first';
            return result;
        }
        await this.syncOnboarding(
            userId,
            id,
            STEP_MINISTRY,
            OnboardStage.CREATOR_MINISTRY,
            OnboardStatus.IN_PROGRESS,
            OnboardStatus.IN_PROGRESS,
        );
        result.message = 'Ministry onboarding step recorded';
        return result;
    }

    public async onboardingTourComplete(userId: string): Promise<IResult> {
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
        const id = String(creator._id);
        const step = creatorOnboardingStep(creator);
        if (step >= STEP_TOUR) {
            result.message = 'Tour step already recorded';
            return result;
        }
        if (step < STEP_MINISTRY) {
            result.error = true;
            result.code = 400;
            result.message = 'Complete ministry profile first';
            return result;
        }
        await this.syncOnboarding(
            userId,
            id,
            STEP_TOUR,
            OnboardStage.CREATOR_TOUR,
            OnboardStatus.IN_PROGRESS,
            OnboardStatus.IN_PROGRESS,
        );
        result.message = 'Tour onboarding step recorded';
        return result;
    }

    public async onboardingFirstSermonComplete(userId: string): Promise<IResult> {
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
        const id = String(creator._id);
        const step = creatorOnboardingStep(creator);
        if (step >= STEP_FIRST_SERMON) {
            result.message = 'First sermon step already recorded';
            return result;
        }
        if (step < STEP_TOUR) {
            result.error = true;
            result.code = 400;
            result.message = 'Complete tour step first';
            return result;
        }
        await this.syncOnboarding(
            userId,
            id,
            STEP_FIRST_SERMON,
            OnboardStage.CREATOR_FIRST_SERMON,
            OnboardStatus.COMPLETED,
            OnboardStatus.COMPLETED,
        );
        result.message = 'First sermon onboarding completed';
        return result;
    }

    public async tryCompleteOnboardingAfterFirstPublish(
        userId: string,
    ): Promise<IResult> {
        return this.onboardingFirstSermonComplete(userId);
    }

    public async skipCreatorOnboarding(userId: string): Promise<IResult> {
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
        const id = String(creator._id);
        await this.syncOnboarding(
            userId,
            id,
            STEP_FIRST_SERMON,
            OnboardStage.SKIPPED,
            OnboardStatus.COMPLETED,
            OnboardStatus.COMPLETED,
        );
        result.message = 'Creator onboarding skipped';
        return result;
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
                'verification.status': status,
                'verification.isVerified': status === VerificationStatus.APPROVED,
                'verification.verifiedAt':
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
