import { Types } from 'mongoose';
import { dateToday, IDateToday } from '@btffamily/pacitude';
import {
    IUserDoc,
    OnboardStatus,
    PasswordType,
    UserType,
} from '@/modules/users/user/user.interface';
import { IResult } from '../utils/interfaces.util';
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
import { OAuthProvider } from '@/modules/authentication/auth/auth.enums';
import { SocialIdKey } from '../utils/types.util';
import { genUserCode } from '../utils/code.util';
import storageService from '@/services/storage.service';
import { IFile } from '../utils/interfaces.util';
import roleService from '@/services/role.service';
import emailService from '@/services/email.service';
import preferenceService from '@/services/preference.service';

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
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const { email, password, passwordType, userType, createdBy } = data;

        let finalPasswordType = passwordType;
        let creatorId = createdBy;

        // Self-created listener-style accounts use USER type
        if (userType === UserType.USER) {
            finalPasswordType = PasswordType.USERGENERATED;
        }

        // do a check
        // For ADMIN must be created by existing admin/superadmin
        if (userType === UserType.ADMIN) {
            throw new Error('Forbidden');
        }

        // Generate user code based on the intended user type
        const userCode = genUserCode(userType);

        const payload: Partial<IUserDoc> = {
            code: userCode,
            email: email.toLowerCase(),
            password,
            passwordType: finalPasswordType,
            userType: UserType.USER,
            createdBy: creatorId,
            isActivated: false,
            isActive: false,
            onboard: {
                step: 1,
                status: OnboardStatus.NOT_STARTED,
            },
        };

        // Create the user object
        const createUser = await userRepository.createUser(payload);

        if (createUser.error) {
            throw new Error(createUser.message);
        }

        let user: IUserDoc = createUser.data as IUserDoc;

        // If it's a self-created account, set createdBy to their own ID
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

        await authService.encryptUserPassword(user, password);

        // Attach role based on userType
        const attachRole = await roleService.attachRole(user, userType);
        if (!attachRole.error && attachRole.data) {
            let updatedUser = attachRole.data as IUserDoc;

            // Initialize permissions for the role
            const permResult =
                await PermissionService.initiatePermissionData(updatedUser);
            if (!permResult.error && permResult.data) {
                updatedUser = permResult.data as IUserDoc;
            }

            // Update user reference
            user = updatedUser;
        }

        await user.save();

        return user;
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

                        const createUser = await userRepository.createUser({
                            code: bulkUserCode,
                            email: bulk.email.toLowerCase(),
                            password: bulk.password,
                            passwordType: bulk.passwordType,
                            userType: bulk.userType,
                            createdBy: bulk.createdBy,
                        });

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

                        // Initialize roles and permissions for bulk users
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

                                    // Update user reference
                                    user = updatedUser;

                                    // Clear permission cache
                                    const userId = updatedUser?._id || user._id;
                                    if (userId) {
                                        await PermissionService.clearUserCache(
                                            String(userId),
                                        );
                                    }
                                }
                            } catch (error) {
                                // Log but don't fail bulk creation
                                console.error(
                                    `Failed to initialize roles/permissions for ${bulk.email}:`,
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
        if (
            data.country ||
            data.address ||
            data.city ||
            data.state ||
            data.postalCode
        ) {
            updateData.location = {
                ...user.location,
                address: data.address || user.location?.address || '',
                city: data.city || user.location?.city || '',
                state: data.state || user.location?.state || '',
                country: data.country || user.location?.country || '',
                postalCode: data.postalCode || user.location?.postalCode || '',
            } as any;
        }

        // Handle avatar upload
        if (data.avatar) {
            const oldAvatar = user.avatar;

            // If there's an old avatar, delete it from S3
            if (oldAvatar?.s3Key) {
                try {
                    await storageService.deleteFile(oldAvatar.s3Key);
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

        // Handle coverImage upload
        if (data.coverImage) {
            const oldCoverImage = user.coverImage;

            // If there's an old coverImage, delete it from S3
            if (oldCoverImage?.s3Key) {
                try {
                    await storageService.deleteFile(oldCoverImage.s3Key);
                } catch (error) {
                    console.error('Failed to delete old coverImage:', error);
                }
            }

            // If coverImage is an IFile with stream, upload it
            if (
                typeof data.coverImage === 'object' &&
                (data.coverImage as IFile).stream
            ) {
                const uploadResult = await storageService.uploadFile(
                    data.coverImage as IFile,
                );

                if (uploadResult.error) {
                    result.error = true;
                    result.code = uploadResult.code || 500;
                    result.message = uploadResult.message;
                    return result;
                }

                updateData.coverImage = {
                    fileName: uploadResult.data.fileName || '',
                    s3Key: uploadResult.data.s3Key || '',
                };
            } else if (typeof data.coverImage === 'object') {
                // If it's already uploaded, check if it has s3Key
                const coverImageWithS3Key = data.coverImage as any;
                if (coverImageWithS3Key.s3Key) {
                    updateData.coverImage = {
                        fileName: coverImageWithS3Key.fileName || '',
                        s3Key: coverImageWithS3Key.s3Key || '',
                    };
                } else {
                    result.error = true;
                    result.code = 400;
                    result.message =
                        'CoverImage s3Key is required for already uploaded images';
                    return result;
                }
            } else if (typeof data.coverImage === 'string') {
                result.error = true;
                result.code = 400;
                result.message =
                    'CoverImage must be provided as a file upload or object with s3Key';
                return result;
            }
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

    // [MIGRATION-REVIEW] Methods merged from flat services/user.service.ts

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

        const existResult = await userRepository.findOne({
            email: email.toLowerCase(),
        });
        if (!existResult.error && existResult.data) {
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
        const permResult = await PermissionService.initiatePermissionData(user);
        if (!permResult.error && permResult.data) {
            user = permResult.data as IUserDoc;
        }

        await user.save();

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
                    email: email,
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

    public async findRole(userId: string): Promise<IResult> {
        let result: IResult = {
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

    public async updateUserPreferences(
        user: IUserDoc,
        preferences: Partial<Pick<any, 'topics' | 'minister'>>,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        if (!preferences.topics && !preferences.minister) {
            result.error = true;
            result.code = 400;
            result.message =
                'Invalid preferences: must provide topics or minister';
            return result;
        }
        const ministerIds = preferences.minister?.map((m: unknown) =>
            typeof m === 'string'
                ? m
                : m &&
                    typeof (m as { toString?: () => string }).toString ===
                        'function'
                  ? (m as { toString: () => string }).toString()
                  : '',
        );
        return preferenceService.patchByUser(
            String(user._id),
            String(user._id),
            {
                topics: preferences.topics,
                minister: ministerIds?.filter(Boolean),
            },
        );
    }

    public async getNotificationPreferences(userId: string): Promise<{
        email: boolean;
        push: boolean;
        sms: boolean;
    }> {
        const prefs = await preferenceService.getByUser(userId, userId);
        if (prefs.error || !prefs.data) {
            throw new Error(prefs.message || 'User not found');
        }
        const data = prefs.data as {
            notifications: { email: boolean; push: boolean; sms: boolean };
        };
        return data.notifications;
    }

    public async updateNotificationPreferences(
        user: IUserDoc,
        notificationPreferences: Partial<{
            email: boolean;
            push: boolean;
            sms: boolean;
        }>,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const hasAnyPreference =
            notificationPreferences.email !== undefined ||
            notificationPreferences.push !== undefined ||
            notificationPreferences.sms !== undefined;
        if (!hasAnyPreference) {
            result.error = true;
            result.code = 400;
            result.message =
                'Invalid notification preferences: must provide at least one setting';
            return result;
        }
        return preferenceService.patchByUser(
            String(user._id),
            String(user._id),
            { notifications: notificationPreferences },
        );
    }

    //   /**
    //    * @name createSocialUser
    //    * @description Creates a new user account specifically from a social login profile.
    //    * @param data - Social user data.
    //    * @returns {Promise<IUserDoc>} The newly created user document.
    //    */
    //   public async createSocialUser(data: createSocialUserDTO): Promise<IUserDoc> {

    //     const { firstName, lastName, email, userType, googleId, githubId, appleId } = data;

    //     // 1. Check if user already exists
    //     const existingUser = await userRepository.findByEmail(email.toLowerCase());
    //     if (existingUser) {
    //       throw new Error(existingUser.message);
    //     }

    //     // 2. Create the user object with placeholder password and social ID
    //     let user: IUserDoc = await User.create({
    //       firstName,
    //       lastName,
    //       email: email.toLowerCase(),
    //       password: generateRandomChars(24), // Placeholder.
    //       passwordType: PasswordType.OAUTH,
    //       userType,
    //       googleId: googleId,
    //       githubId: githubId,
    //       appleId: appleId,
    //       isActive: true,
    //       isActivated: true,
    //     });

    //     await authService.updateUserType(user, userType);
    //     await authService.attachRole(user, userType);
    //    const permResult = await PermissionService.initiatePermissionData(user);
    //       if (permResult.error) {
    //         throw new Error(permResult.message);
    //       }
    //       user = permResult.data as IUserDoc;

    //     // 4. Create profile based on userType (REUSE EXISTING LOGIC)

    //     if (user.userType === UserType.LISTENER) {
    //       const listenerProfile = await listenerService.createListener({
    //         user: user,
    //         type: UserType.LISTENER,
    //       });

    //         if (listenerProfile.error) {
    //           throw new Error(listenerProfile.message);
    //         }
    //         user = listenerProfile.data.user as IUserDoc;
    //       }

    //       if (user.userType === UserType.MINISTER) {

    //         const ministerProfile = await ministerService.createMinister({
    //           user: user,
    //           userType: UserType.MINISTER,
    //           email: user.email,
    //         });

    //         if (ministerProfile.error) {
    //           throw new Error(ministerProfile.message);
    //         }
    //         user = ministerProfile.data.user as IUserDoc;
    //       }

    //     // 5. Save the final user (Mongoose pre-save hook will handle password 'encryption' if needed,
    //     // but for social it's a placeholder, so no real encryption runs)
    //     await user.save();

    //     // 6. Send welcome email (REUSED LOGIC FROM YOUR REGISTRATION SUCCESS BLOCK)
    //     const welcomeEmail = await emailService.sendUserWelcomeEmail(user);
    //     if (welcomeEmail.error) {
    //     }

    //     return user;
    //   }

    //   /**
    //    * @name findOrCreateSocialUser
    //    * @description Handles the core logic for social logins: find by ID, find by email, or create new user.
    //    * @param profile - The Passport profile object from the OAuth provider.
    //    * @param provider - 'google', 'github', or 'apple'.
    //    * @returns {Promise<IUserDoc>} The authenticated or newly created user document.
    //    */
    //   public async findOrCreateSocialUser(
    //     profile: IPassportProfileDTO,
    //     provider: OAuthProvider,
    //     req: Request
    //   ): Promise<IUserDoc | null> {

    //     const email = profile.emails?.[0]?.value.toLowerCase();
    //     const socialId = profile.id;
    //     let user: IUserDoc | null = null;

    //     // 1. Check if user already exists via the social ID (Primary check)
    //     const idField = `${provider}Id`; // e.g., 'googleId'
    //     user = await userRepository.findUserBySocialId(provider, socialId)

    //     if (!user) {

    //       // 2. Check if user exists via email (Attempt to link account)
    //       const userResult = await userRepository.findUser(email);

    //       if (!userResult.data) {
    //         throw new Error(userResult.message);
    //       }

    //       user = userResult.data;

    //       if (user) {

    //         user = await this.linkSocialAccount(user, idField, socialId);

    //       } else {
    //         // 3. User not found - CREATE A NEW SOCIAL USER
    //         user = await this.createSocialUser({
    //           firstName: profile.name?.givenName,
    //           lastName: profile.name?.familyName,
    //           email: email,
    //           userType: UserType.LISTENER,
    //           [idField]: socialId, // Add the specific social ID
    //         });
    //       }
    //     }

    //     if (user) {
    //       // 4. Finalize login (REUSE EXISTING LOGIC)
    //       await authService.activateAccount(user);
    //       await authService.updateLastLogin(user);
    //       //await authService.updateLoginInfo(user, req);

    //       user.save()

    //       return user;
    //     }

    //     return null;
    //   }

    // /**
    //    * @name linkSocialAccount
    //    * @description Links a local user account to a social ID.
    //    */
    //   private async linkSocialAccount(user: IUserDoc, idField: string, socialId: string): Promise<IUserDoc> {

    //     const key = idField as SocialIdKey;
    //     user[key] = socialId;
    //     user.passwordType = PasswordType.OAUTH;
    //     await user.save();
    //     return user;
    //   }
}

export default new UserService();
