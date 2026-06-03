import {
    CreateMinisterDTO,
    UpdateMinisterDTO,
} from '@/dtos/core/minister.dto';
import ministerRepository from '@/repository/core/minister.repository';
import { IResult } from '@/interfaces/common.interface';
import {
    VerificationStatus,
    type IMinisterDoc,
    type DocumentUpload,
} from '@/interfaces/core/minister.interface';
import type { IUserDoc } from '@/interfaces/user.interface';
import {
    UserType,
    OnboardStage,
    OnboardStatus,
} from '@/interfaces/user.interface';
import { genSlug } from '../../utils/helpers.util';
import roleService from '@/services/role.service';
import PermissionService from '@/services/permission.service';
import ministerMapper from '@/mappers/minister.mapper';
import studioService from '@/services/core/studio.service';
import userRepository from '@/repository/user.repository';
import { normalizeStorageReferenceToS3Key } from '@/utils/helpers.util';

/** Canonical get-started ladder (aligned with web). */
const STEP_PERSONAL = 1;
const STEP_DOCUMENT = 2;
const STEP_ADDRESS = 3;
const STEP_MINISTRY = 4;
const STEP_TOUR = 5;
const STEP_FIRST_SERMON = 6;

function ministerOnboardingStep(m: IMinisterDoc): number {
    const s = m.onboarding?.step;
    return typeof s === 'number' ? s : 0;
}

function normalizeStorageWriteValue(value: unknown): unknown {
    if (typeof value !== 'string' || !value.trim()) {
        return value;
    }
    return normalizeStorageReferenceToS3Key(value);
}

function buildDotSetFromUpdateDTO(data: UpdateMinisterDTO): {
    $set: Record<string, unknown>;
} {
    const $set: Record<string, unknown> = {};
    const {
        profile: profilePatch,
        onboarding: onboardingPatch,
        ...top
    } = data;
    for (const [key, value] of Object.entries(top)) {
        if (value !== undefined) {
            if (key === 'avatar' || key === 'banner') {
                $set[key] = normalizeStorageWriteValue(value);
            } else {
                $set[key] = value;
            }
        }
    }
    if (profilePatch) {
        for (const [pk, pv] of Object.entries(profilePatch)) {
            if (pv === undefined) continue;
            if (pk === 'ministryHQLocation' && pv && typeof pv === 'object') {
                for (const [hk, hv] of Object.entries(
                    pv as Record<string, unknown>,
                )) {
                    if (hv !== undefined) {
                        $set[`profile.ministryHQLocation.${hk}`] = hv;
                    }
                }
            } else if (pk === 'ministryLogo') {
                $set[`profile.${pk}`] = normalizeStorageWriteValue(pv);
            } else {
                $set[`profile.${pk}`] = pv;
            }
        }
    }
    if (onboardingPatch) {
        if (onboardingPatch.step !== undefined) {
            $set['onboarding.step'] = onboardingPatch.step;
        }
        if (onboardingPatch.status !== undefined) {
            $set['onboarding.status'] = onboardingPatch.status;
        }
    }
    return { $set };
}

class MinisterService {
    public result: IResult;

    constructor() {
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    private async syncOnboarding(
        userId: string,
        ministerId: string,
        step: number,
        stage: OnboardStage,
        userOnboardStatus: OnboardStatus,
        ministerOnboardStatus: string,
    ): Promise<void> {
        await ministerRepository.updateMinister(ministerId, {
            $set: {
                'onboarding.step': step,
                'onboarding.status': ministerOnboardStatus,
            },
        } as any);
        await userRepository.updateUser(userId, {
            'onboard.step': step,
            'onboard.stage': stage,
            'onboard.status': userOnboardStatus,
        } as any);
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
            onboarding: {
                step: 0,
                status: OnboardStatus.NOT_STARTED,
            } as IMinisterDoc['onboarding'],
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

        const minister = createResult.data as IMinisterDoc;
        const ministerId = String(minister._id || minister.id);
        const userId = String(userKey);

        await userRepository.updateUser(userId, {
            minister: minister._id || minister.id,
            isMinister: true,
        } as any);

        const studioProvision = await studioService.provisionDefaultStudioForMinister(
            ministerId,
            userId,
        );
        if (studioProvision.error) {
            result.error = true;
            result.code = studioProvision.code || 500;
            result.message = studioProvision.message;
            return result;
        }

        result.message = 'Minister profile created successfully';
        result.code = 201;
        result.data = {
            minister,
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

        const dotSet = buildDotSetFromUpdateDTO(data);
        if (Object.keys(dotSet.$set).length === 0) {
            result.message = 'Nothing to update';
            result.data = minister;
            return result;
        }

        const updateResult = await ministerRepository.updateMinister(
            ministerId,
            dotSet as any,
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Minister profile updated successfully';
        result.data = await ministerMapper.mapMinisterOwnerResponse(
            updateResult.data as IMinisterDoc,
        );
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
                populate: [{ path: 'sermons' }, { path: 'playlists' }],
            },
        );

        if (ministerResult.error || !ministerResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Minister profile not found';
            return result;
        }

        result.data = await ministerMapper.mapMinisterOwnerResponse(
            ministerResult.data as IMinisterDoc,
        );
        result.message = 'Minister profile retrieved successfully';
        return result;
    }

    public async getPublicMinisterProfile(
        idOrSlug: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const trimmed = String(idOrSlug ?? '').trim();
        if (!trimmed) {
            result.error = true;
            result.code = 400;
            result.message = 'ministerId is required';
            return result;
        }

        const ministerResult = await ministerRepository.findMinister(trimmed);
        if (ministerResult.error || !ministerResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Minister profile not found';
            return result;
        }

        const minister = ministerResult.data as IMinisterDoc;
        const isPublic =
            Boolean(minister.published) ||
            Boolean((minister as any).verification?.isPublic);

        if (!isPublic) {
            result.error = true;
            result.code = 404;
            result.message = 'Minister profile not found';
            return result;
        }

        result.data = await ministerMapper.mapMinisterProfile(minister);
        result.message = 'Minister profile retrieved successfully';
        return result;
    }

    public async submitVerification(
        userId: string,
        document: DocumentUpload,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!document?.type || !document?.frontPage) {
            result.error = true;
            result.code = 400;
            result.message =
                'document.type and document.frontPage are required';
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
        const step = ministerOnboardingStep(minister);
        if (step < STEP_PERSONAL) {
            result.error = true;
            result.code = 400;
            result.message =
                'Complete personal information before submitting verification';
            return result;
        }

        const updateResult = await ministerRepository.updateMinister(id, {
            $set: {
                'verification.document': {
                    ...document,
                    frontPage: normalizeStorageReferenceToS3Key(
                        document.frontPage,
                    ),
                    ...(document.backPage
                        ? {
                              backPage: normalizeStorageReferenceToS3Key(
                                  document.backPage,
                              ),
                          }
                        : {}),
                },
                'verification.status': VerificationStatus.PENDING,
            },
        } as any);

        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        const nextStep = Math.max(step, STEP_DOCUMENT);
        await this.syncOnboarding(
            userId,
            id,
            nextStep,
            OnboardStage.MINISTER_DOCUMENT,
            OnboardStatus.IN_PROGRESS,
            OnboardStatus.IN_PROGRESS,
        );

        result.data = updateResult.data;
        result.message = 'Verification documents submitted';
        return result;
    }

    /** Idempotent: safe if already at or past document step. */
    public async onboardingDocumentComplete(
        userId: string,
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
        const id = String(minister._id || minister.id);
        const step = ministerOnboardingStep(minister);
        if (step >= STEP_DOCUMENT) {
            result.message = 'Document step already recorded';
            result.data = minister;
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
            OnboardStage.MINISTER_DOCUMENT,
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
        const findResult = await ministerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Minister profile not found';
            return result;
        }
        const minister = findResult.data as IMinisterDoc;
        const id = String(minister._id || minister.id);
        const step = ministerOnboardingStep(minister);
        if (step >= STEP_PERSONAL) {
            result.message = 'Personal step already recorded';
            return result;
        }
        await this.syncOnboarding(
            userId,
            id,
            STEP_PERSONAL,
            OnboardStage.MINISTER_PERSONAL,
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
        const findResult = await ministerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Minister profile not found';
            return result;
        }
        const minister = findResult.data as IMinisterDoc;
        const id = String(minister._id || minister.id);
        const step = ministerOnboardingStep(minister);
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
            OnboardStage.MINISTER_ADDRESS,
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
        const findResult = await ministerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Minister profile not found';
            return result;
        }
        const minister = findResult.data as IMinisterDoc;
        const id = String(minister._id || minister.id);
        const step = ministerOnboardingStep(minister);
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
            OnboardStage.MINISTER_MINISTRY,
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
        const findResult = await ministerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Minister profile not found';
            return result;
        }
        const minister = findResult.data as IMinisterDoc;
        const id = String(minister._id || minister.id);
        const step = ministerOnboardingStep(minister);
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
            OnboardStage.MINISTER_TOUR,
            OnboardStatus.IN_PROGRESS,
            OnboardStatus.IN_PROGRESS,
        );
        result.message = 'Tour onboarding step recorded';
        return result;
    }

    public async onboardingFirstSermonComplete(
        userId: string,
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
        const id = String(minister._id || minister.id);
        const step = ministerOnboardingStep(minister);
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
            OnboardStage.MINISTER_FIRST_SERMON,
            OnboardStatus.COMPLETED,
            OnboardStatus.COMPLETED,
        );
        result.message = 'First sermon onboarding completed';
        return result;
    }

    /**
     * Called when a minister publishes a sermon; advances step 6 if tour is done.
     * Idempotent if already completed.
     */
    public async tryCompleteOnboardingAfterFirstPublish(
        userId: string,
    ): Promise<IResult> {
        return this.onboardingFirstSermonComplete(userId);
    }

    public async skipMinisterOnboarding(userId: string): Promise<IResult> {
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
        const id = String(minister._id || minister.id);
        await this.syncOnboarding(
            userId,
            id,
            STEP_FIRST_SERMON,
            OnboardStage.SKIPPED,
            OnboardStatus.COMPLETED,
            OnboardStatus.COMPLETED,
        );
        result.message = 'Minister onboarding skipped';
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
