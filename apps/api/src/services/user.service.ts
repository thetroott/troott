import { Types } from 'mongoose';
import { dateToday, IDateToday } from '@btffamily/pacitude';
import {
    IUserDoc,
    OnboardStatus,
    PasswordType,
    UserType,
} from '@/interfaces/user.interface';
import { IResult } from '@/interfaces/common.interface';
import {
    createUserDTO,
    createUserProfileDTO,
    createSocialUserDTO,
    IBulkUser,
    EditUserDTO,
    IPassportProfileDTO,
} from '@/dtos/user.dto';
import User from '@/models/user.model';
import userRepository from '@/repository/user.repository';

import authService from '@/services/auth.service';
import PermissionService from '@/services/permission.service';
import { genSlug } from '../utils/helpers.util';
import { generateRandomChars } from '../utils/helpers.util';
import { OAuthProvider } from '@/types/common.enum';
import { SocialIdKey } from '@/types/common.types';
import { genUserCode } from '../utils/helpers.util';
import storageService from '@/services/storage.service';
import { AWS_BUCKETS_STORAGE } from '@/configs/aws.config';
import { IFile } from '@/interfaces/common.interface';
import roleService from '@/services/role.service';
import emailService from '@/services/email.service';
import listenerService from '@/services/core/listener.service';
import ministerService from '@/services/core/minister.service';
import creatorService from '@/services/core/creator.service';
import libraryService from '@/services/core/library.service';
import recommendationService from '@/services/core/recommendation.service';
import subscriptionRepository from '@/repository/subscription.repository';
import { SubscriptionStatus, Currency, BillingFrequency } from '@/interfaces/subscription.interface';
import Plan from '@/models/plan.model';
import { FREE_PLAN_CODE } from '@/utils/helpers.util';
import { PlanType } from '@/interfaces/plan.interface';
import type { IListenerDoc } from '@/interfaces/core/listener.interface';


type ObjectId = Types.ObjectId;

class UserService {
    public result: IResult;
    public today: IDateToday;

    constructor() {
        this.today = dateToday(new Date());
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    /**
     * @name createUser
     * @param data
     * @returns
     */
    public async createUser(data: createUserDTO): Promise<IUserDoc> {
        const {
            firstName,
            lastName,
            email,
            password,
            passwordType,
            userType,
            createdBy,
        } = data;

        let finalPasswordType = passwordType;
        let creatorId = createdBy;

        if (userType === UserType.USER) {
            finalPasswordType = PasswordType.USERGENERATED;
        }

        if (
            userType === UserType.ADMIN ||
            userType === UserType.SUPERADMIN
        ) {
            throw new Error('Forbidden');
        }

        const userCode = genUserCode(userType);

        const payload: Partial<IUserDoc> & { password?: string } = {
            code: userCode,
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            passwordType: finalPasswordType,
            userType: UserType.USER,
            createdBy: creatorId,
            isActivated: false,
            isActive: false,
            onboard: {
                step: 1,
                stage: '',
                status: OnboardStatus.NOT_STARTED,
            },
        };

        const createResult = await userRepository.createUser(payload);
        if (createResult.error) {
            throw new Error(createResult.message);
        }

        let user: IUserDoc = createResult.data as IUserDoc;

        if (!creatorId) {
            user.createdBy = user._id;
            const updateResult = await userRepository.updateUser(
                String(user._id),
                { createdBy: user._id },
            );
            if (updateResult.error) {
                throw new Error(updateResult.message);
            }
            user = updateResult.data as IUserDoc;
        }

        await authService.updateUserType(user, userType);

        const attachRole = await roleService.attachRole(user, userType);
        if (!attachRole.error && attachRole.data) {
            let updatedUser = attachRole.data as IUserDoc;
            const permResult =
                await PermissionService.initiatePermissionData(updatedUser);
            if (!permResult.error && permResult.data) {
                updatedUser = permResult.data as IUserDoc;
            }
            user = updatedUser;
        }

        await authService.encryptUserPassword(user, password);
        user.markModified('password');
        await user.save();

        await this.createDomainProfile(user, userType);

        return user;
    }

    /**
     * Orchestrates domain profile creation based on userType.
     * For LISTENER: creates listener profile, library, free subscription, and cold-start recommendations.
     * For MINISTER/CREATOR: creates the respective profile only.
     */
    private async createDomainProfile(
        user: IUserDoc,
        userType: UserType,
    ): Promise<void> {
        const userId = String(user._id);

        switch (userType) {
            case UserType.LISTENER: {
                const listenerResult = await listenerService.createListener({
                    user,
                    userType: UserType.LISTENER,
                    email: user.email,
                    createdBy: userId,
                });
                if (listenerResult.error) {
                    throw new Error(listenerResult.message);
                }
                const listener = listenerResult.data
                    .listener as IListenerDoc;
                const listenerId = String(listener._id);

                const libResult =
                    await libraryService.getOrCreateLibrary(listenerId);
                if (!libResult.error && libResult.data) {
                    listener.Library = (libResult.data as any)._id || libResult.data;
                    await (listener as any).save();
                }

                await this.assignFreeSubscription(listenerId, listener);

                try {
                    await recommendationService.seedColdStart(
                        listenerId,
                        (user as any).country || '',
                    );
                } catch {
                    // non-critical -- listener can still use the app
                }
                break;
            }

            case UserType.MINISTER: {
                const ministerResult = await ministerService.createMinister({
                    user,
                    userType: UserType.MINISTER,
                    email: user.email,
                    createdBy: user._id as any,
                });
                if (ministerResult.error) {
                    throw new Error(ministerResult.message);
                }
                break;
            }

            case UserType.CREATOR: {
                const creatorResult = await creatorService.createCreator({
                    user,
                    email: user.email,
                    createdBy: userId,
                });
                if (creatorResult.error) {
                    throw new Error(creatorResult.message);
                }
                break;
            }

            default:
                break;
        }
    }

    /**
     * Finds the free plan and creates an active subscription for the listener.
     */
    private async assignFreeSubscription(
        listenerId: string,
        listener: IListenerDoc,
    ): Promise<void> {
        try {
            const freePlan = await Plan.findOne({
                code: FREE_PLAN_CODE,
                planType: PlanType.FOR_LISTENER,
                isEnabled: true,
            });
            if (!freePlan) return;

            const subResult = await subscriptionRepository.addNewSubscription({
                listener: listenerId as any,
                plan: freePlan._id as any,
                status: SubscriptionStatus.ACTIVE,
                currency: Currency.NGN,
                billing: {
                    retries: 0,
                    amount: 0,
                    frequency: BillingFrequency.MONTHLY,
                    isPaid: true,
                    startAt: new Date(),
                    paidAt: new Date(),
                    dueAt: new Date(),
                    graceAt: new Date(),
                },
            });

            if (!subResult.error && subResult.data) {
                listener.subscription = (subResult.data as any)._id || subResult.data;
                await (listener as any).save();
            }
        } catch {
            // non-critical -- listener can still use the app without a subscription record
        }
    }

    /**
     * @name createBulkUsers
     * @param data - Array of IBulkUser objects
     * @param options - Options for bulk creation
     * @description Creates multiple users from IBulkUser array. Only uses fields defined in IBulkUser interface.
     */
    public async createBulkUsers(
        data: Array<IBulkUser>,
        options: { isNew: boolean },
    ): Promise<void> {
        if (data && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                const bulk = data[i] as IBulkUser;
                const existResult = await userRepository.findOne({
                    email: bulk.email,
                });

                if ((existResult.error || !existResult.data) && options.isNew) {
                    try {
                        // Create the user using only IBulkUser fields
                        // Generate user code for bulk creation
                        const bulkUserCode = genUserCode(
                            bulk.userType || UserType.USER,
                        );

                        const bulkPayload: Partial<IUserDoc> & { password?: string } = {
                            code: bulkUserCode,
                            email: bulk.email.toLowerCase(),
                            password: bulk.password,
                            passwordType: bulk.passwordType,
                            userType: bulk.userType,
                            createdBy: bulk.createdBy,
                        };
                        const createUser = await userRepository.createUser(bulkPayload);

                        if (createUser.error) {
                            continue; // Skip this user if creation failed
                        }

                        let user = createUser.data as IUserDoc;

                        // Encrypt password
                        await authService.encryptUserPassword(
                            user,
                            bulk.password,
                        );
                        await user.save();

                        if (bulk.userType && bulk.userType !== UserType.USER) {
                            try {
                                const roleAttachResult =
                                    await roleService.attachRole(
                                        user,
                                        bulk.userType,
                                    );
                                if (
                                    !roleAttachResult.error &&
                                    roleAttachResult.data
                                ) {
                                    let updatedUser =
                                        roleAttachResult.data as IUserDoc;
                                    const permResult =
                                        await PermissionService.initiatePermissionData(
                                            updatedUser,
                                        );
                                    if (!permResult.error && permResult.data) {
                                        updatedUser =
                                            permResult.data as IUserDoc;
                                    }
                                    user = updatedUser;

                                    const userId = updatedUser?._id || user._id;
                                    if (userId) {
                                        await PermissionService.clearUserCache(
                                            String(userId),
                                        );
                                    }
                                }

                                await this.createDomainProfile(
                                    user,
                                    bulk.userType,
                                );
                            } catch (error) {
                                console.error(
                                    `Failed to initialize profile for ${bulk.email}:`,
                                    error,
                                );
                            }
                        }
                    } catch (error) {
                        // Skip this user if creation failed
                        continue;
                    }
                }
            }
        }
    }

    /**
     * @name updateUserProfile
     * @description Updates user profile including avatar and coverImage with image upload support
     * @param userId - User ID
     * @param data - EditUserDTO containing fields to update
     * @returns Promise<IResult>
     */
    public async updateUserProfile(
        userId: string,
        data: EditUserDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        // Find the user
        const findResult = await userRepository.findById(userId);
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'User not found';
            return result;
        }

        const user = findResult.data as IUserDoc;
        const updateData: Partial<IUserDoc> = {};

        // Handle basic fields
        if (data.firstName !== undefined)
            updateData.firstName = data.firstName.trim();
        if (data.lastName !== undefined)
            updateData.lastName = data.lastName.trim();
        if (data.email !== undefined)
            updateData.email = data.email.toLowerCase().trim();
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        // Handle phone fields
        if (data.phoneNumber !== undefined) {
            updateData.phoneNumber = data.phoneNumber;
        }
        if (data.phoneCode !== undefined) {
            updateData.phoneCode = data.phoneCode;
        }

        // Handle location fields
        if (data.country || data.location) {
            updateData.location = {
                ...user.location,
                address: data.location?.address || user.location?.address || '',
                city: data.location?.city || user.location?.city || '',
                state: data.location?.state || user.location?.state || '',
                country: data.location?.country || user.location?.country || '',
                postalCode:
                    data.location?.postalCode ||
                    user.location?.postalCode ||
                    '',
            };
        }

        // Handle avatar upload
        if (data.avatar) {
            const oldAvatar = user.avatar;

            // If there's an old avatar, delete it from S3
            if (oldAvatar?.s3Key) {
                try {
                    await storageService.deleteFile(
                        oldAvatar.s3Key,
                        AWS_BUCKETS_STORAGE,
                    );
                } catch (error) {
                    console.error('Failed to delete old avatar:', error);
                }
            }

            // If avatar is an IFile with stream, upload it
            if (
                typeof data.avatar === 'object' &&
                (data.avatar as IFile).stream
            ) {
                const uploadResult = await storageService.uploadFile(
                    data.avatar as IFile,
                );

                if (uploadResult.error) {
                    result.error = true;
                    result.code = uploadResult.code;
                    result.message = uploadResult.message;
                    return result;
                }

                updateData.avatar = {
                    fileName: uploadResult.data.fileName,
                    s3Key: uploadResult.data.s3Key,
                };
            } else if (typeof data.avatar === 'object') {
                // If it's already uploaded, check if it has s3Key
                const avatarWithS3Key = data.avatar as any;
                if (avatarWithS3Key.s3Key) {
                    updateData.avatar = {
                        fileName: avatarWithS3Key.fileName,
                        s3Key: avatarWithS3Key.s3Key,
                    };
                } else {
                    result.error = true;
                    result.code = 400;
                    result.message =
                        'Avatar s3Key is required for already uploaded images';
                    return result;
                }
            } else if (typeof data.avatar === 'string') {
                // Legacy support: if it's a string (URL), we can't handle it here
                // This would need to be handled differently or converted to IFile format
                result.error = true;
                result.code = 400;
                result.message =
                    'Avatar must be provided as a file upload or object with s3Key';
                return result;
            }
        }

        // Handle banner upload
        if (data.banner) {
            const oldBanner = user.banner;

            // If there's an old banner, delete it from S3
            if (oldBanner?.s3Key) {
                try {
                    await storageService.deleteFile(
                        oldBanner.s3Key,
                        AWS_BUCKETS_STORAGE,
                    );
                } catch (error) {
                    console.error('Failed to delete old banner:', error);
                }
            }

            // If banner is an IFile with stream, upload it
            if (
                typeof data.banner === 'object' &&
                (data.banner as IFile).stream
            ) {
                const uploadResult = await storageService.uploadFile(
                    data.banner as IFile,
                );

                if (uploadResult.error) {
                    result.error = true;
                    result.code = uploadResult.code || 500;
                    result.message = uploadResult.message;
                    return result;
                }

                updateData.banner = {
                    fileName: uploadResult.data.fileName || '',
                    s3Key: uploadResult.data.s3Key || '',
                };
            } else if (typeof data.banner === 'object') {
                const bannerWithS3Key = data.banner as any;
                if (bannerWithS3Key.s3Key) {
                    updateData.banner = {
                        fileName: bannerWithS3Key.fileName || '',
                        s3Key: bannerWithS3Key.s3Key || '',
                    };
                } else {
                    result.error = true;
                    result.code = 400;
                    result.message =
                        'Banner s3Key is required for already uploaded images';
                    return result;
                }
            } else if (typeof data.banner === 'string') {
                result.error = true;
                result.code = 400;
                result.message =
                    'Banner must be provided as a file upload or object with s3Key';
                return result;
            }
        }

        if (data.middleName !== undefined) {
            updateData.middleName = String(data.middleName).trim();
        }
        if (data.gender !== undefined) {
            updateData.gender = data.gender;
        }
        if (data.dateOfBirth !== undefined) {
            updateData.dateOfBirth = data.dateOfBirth;
        }
        if (data.countryPhone !== undefined) {
            updateData.countryPhone = data.countryPhone;
        }
        if (data.altPhone !== undefined) {
            updateData.altPhone = data.altPhone;
        }
        if (data.slug !== undefined) {
            updateData.slug = String(data.slug).trim().toLowerCase();
        }
        if (data.country !== undefined) {
            (updateData as any).country = data.country;
        }
        if (data.homeCountry !== undefined) {
            (updateData as any).homeCountry = data.homeCountry;
        }

        // Update the user
        const updateResult = await userRepository.updateUser(
            userId,
            updateData,
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'User profile updated successfully';
        result.data = updateResult.data;
        return result;
    }

    public async findRole(userId: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const userResult = await userRepository.findById(String(userId));
        if (userResult.error || !userResult.data) {
            result.error = true;
            result.code = 400;
            result.message = 'user not found';
            return result;
        }
        const user = userResult.data as IUserDoc;
        if ((user as any).isAdmin) {
            result.data = true;
            result.message = 'user is an admin';
        } else if ((user as any).isCreator) {
            result.data = true;
            result.message = 'user is a creator';
        } else {
            result.data = false;
            result.message = 'user is neither an admin nor a creator';
        }
        return result;
    }

    public async createSocialUser(
        data: createSocialUserDTO,
    ): Promise<IUserDoc> {
        const {
            firstName,
            lastName,
            email,
            userType,
            googleId,
            githubId,
            appleId,
        } = data;

        const existingUser = await userRepository.findByEmail(
            email.toLowerCase(),
        );
        if (!existingUser.error && existingUser.data) {
            throw new Error('User already exists');
        }

        let user: IUserDoc = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: generateRandomChars(24),
            passwordType: PasswordType.OAUTH,
            userType,
            googleId,
            githubId,
            appleId,
            isActive: true,
            isActivated: true,
        });

        await authService.updateUserType(user, userType);
        const roleAttach = await roleService.attachRole(user, userType);
        if (!roleAttach.error && roleAttach.data) {
            user = roleAttach.data as IUserDoc;
        }
        const permResult =
            await PermissionService.initiatePermissionData(user);
        if (!permResult.error && permResult.data) {
            user = permResult.data as IUserDoc;
        }

        await user.save();

        await this.createDomainProfile(user, userType);

        const welcomeEmail = await emailService.sendUserWelcomeEmail(user);
        if (welcomeEmail.error) {
            console.error(
                'Failed to send welcome email:',
                welcomeEmail.message,
            );
        }

        return user;
    }

    public async findOrCreateSocialUser(
        profile: IPassportProfileDTO,
        provider: OAuthProvider,
        req: any,
    ): Promise<IUserDoc | null> {
        const email = profile.emails?.[0]?.value.toLowerCase();
        const socialId = profile.id;
        let user: IUserDoc | null = null;

        const idField = `${provider}Id`;

        const socialQuery = { [idField]: socialId };
        const socialResult = await userRepository.findOne(socialQuery);
        if (!socialResult.error && socialResult.data) {
            user = socialResult.data as IUserDoc;
        }

        if (!user) {
            if (!email) {
                throw new Error('OAuth profile did not include an email');
            }
            const userResult = await userRepository.findByEmail(email);
            if (!userResult.error && userResult.data) {
                user = userResult.data as IUserDoc;
                user = await this.linkSocialAccount(user, idField, socialId);
            } else {
                user = await this.createSocialUser({
                    firstName: profile.name?.givenName ?? '',
                    lastName: profile.name?.familyName ?? '',
                    email,
                    userType: UserType.USER,
                    [idField]: socialId,
                } as createSocialUserDTO);
            }
        }

        if (user) {
            await authService.activateAccount(user);
            await authService.updateLastLogin(user);
            await user.save();
            return user;
        }

        return null;
    }

    private async linkSocialAccount(
        user: IUserDoc,
        idField: string,
        socialId: string,
    ): Promise<IUserDoc> {
        const key = idField as SocialIdKey;
        (user as any)[key] = socialId;
        user.passwordType = PasswordType.OAUTH;
        await user.save();
        return user;
    }
}


export default new UserService();
