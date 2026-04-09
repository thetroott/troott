import { Types } from 'mongoose';
import { dateToday, IDateToday } from '@btffamily/pacitude';
import {
    IUserDoc,
    OnboardStatus,
    PasswordType,
    UserType,
} from './user.interface';
import { IResult } from '../../../utils/interfaces.util';
import {
    createUserDTO,
    createUserProfileDTO,
    IBulkUser,
    EditUserDTO,
} from './user.dto';
import User from './user.model';
import userRepository from './user.repository';
import talentService from '../talent/talent.service';
import talentRepository from '../talent/talent.repository';
import businessRepository from '../business/business.repository';
import { GenderType } from '../talent/talent.interface';
import { BusinessType, VerificationType } from '../business/business.interface';
import {
    OnboardUserTypeDTO,
    OnboardBasicInfoDTO,
    OnboardTalentInfoDTO,
    OnboardBusinessInfoDTO,
    OnboardUserInfoDTO,
} from '../../authentication/auth/auth.dto';

import authService from '../../authentication/auth/auth.service';
import PermissionService from '../../authentication/permission/permission.service';
import { genSlug } from '../../../utils/helpers.util';
import { genUserCode } from '../../../utils/code.util';
import storageService from '../../platform/storage/storage.service';
import { IFile } from '../../../utils/interfaces.util';
import roleService from '@/modules/authentication/role/role.service';
import tokenService from '../../../services/token.service';
import emailService from '../../../services/email.service';

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

        // TALENT or BUSINESS: Created by self
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

        await authService.updateUserType(user, userType as UserType);

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
                                if (!roleAttachResult.error && roleAttachResult.data) {
                                    let updatedUser = roleAttachResult.data as IUserDoc;
                                    const permResult = await PermissionService.initiatePermissionData(
                                        updatedUser,
                                    );
                                    if (!permResult.error && permResult.data) {
                                        updatedUser = permResult.data as IUserDoc;
                                    }
                                    
                                    // Update user reference
                                    user = updatedUser;
                                    
                                    // Clear permission cache
                                    const userId = updatedUser?._id || user._id;
                                    if (userId) {
                                        await PermissionService.clearUserCache(String(userId));
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
        if (data.country || data.address || data.city || data.state || data.postalCode) {
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

    // onboarding flow
    /**
     * @description Set user type
     * @param userId - The user ID
     * @param data - OnboardUserTypeDTO containing userType
     */
    async setUserType(
        userId: string | ObjectId,
        data: OnboardUserTypeDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const userDoc = await User.findById(String(userId));
        if (!userDoc) {
            result.error = true;
            result.message = 'User not found';
            result.code = 404;
            return result;
        }
        let user = userDoc as IUserDoc;

        // Validate user type
        if (![UserType.TALENT, UserType.BUSINESS, UserType.USER].includes(data.userType)) {
            result.error = true;
            result.message = 'Invalid user type';
            result.code = 400;
            return result;
        }

        // Update user type and onboarding step
        user.userType = data.userType;
        user.onboard.step = 1;
        user.onboard.status = OnboardStatus.IN_PROGRESS;

        // Set user type flags
        if (data.userType === UserType.TALENT) {
            user.isTalent = true;
            user.isBusiness = false;
            user.isUser = false;
        } else if (data.userType === UserType.BUSINESS) {
            user.isBusiness = true;
            user.isTalent = false;
            user.isUser = false;
        } else if (data.userType === UserType.USER) {
            user.isUser = true;
            user.isTalent = false;
            user.isBusiness = false;
        }

        // Attach role based on user type
        const roleAttachResult = await roleService.attachRole(
            user,
            data.userType,
        );
        if (roleAttachResult.error) {
            result.error = true;
            result.message = roleAttachResult.message;
            result.code = roleAttachResult.code || 500;
            return result;
        }
        if (!roleAttachResult.data) {
            result.error = true;
            result.message = 'Failed to attach role: no user data returned';
            result.code = 500;
            return result;
        }
        let updatedUser = roleAttachResult.data as IUserDoc;

        // Initialize permissions for the user
        const permResult = await PermissionService.initiatePermissionData(updatedUser);
        if (permResult.error) {
            result.error = true;
            result.message = permResult.message;
            result.code = permResult.code || 500;
            return result;
        }
        if (!permResult.data) {
            result.error = true;
            result.message = 'Failed to initialize permissions: no user data returned';
            result.code = 500;
            return result;
        }
        user = permResult.data as IUserDoc;

        await user.save();

        result.error = false;
        result.code = 200;
        result.message = 'User type set successfully';
        result.data = {
            userType: user.userType,
            step: user.onboard.step,
            status: user.onboard.status,
        };

        return result;
    }

    /**
     * @description Set basic user information
     * @param userId - The user ID
     * @param data - OnboardBasicInfoDTO containing firstName, lastName, location, timeZone
     */
    async setBasicInfo(
        userId: string | Types.ObjectId,
        data: OnboardBasicInfoDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const userDoc = await User.findById(String(userId));
        if (!userDoc) {
            result.error = true;
            result.message = 'User not found';
            result.code = 404;
            return result;
        }
        let user = userDoc as IUserDoc;

        // Validate step progression
        if (user.onboard.step < 1) {
            result.error = true;
            result.message = 'Please complete step 1 first';
            result.code = 400;
            return result;
        }

        // Validate required fields
        if (
            !data.firstName ||
            !data.lastName ||
            !data.location.country ||
            !data.timeZone
        ) {
            result.error = true;
            result.message = 'Missing required fields';
            result.code = 400;
            return result;
        }

        // Update user basic information
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.phoneCode = data.phoneCode || '';
        user.phoneNumber = data.phoneNumber || '';
        user.location = {
            address: data.location.address || '',
            city: data.location.city || '',
            state: data.location.state || '',
            country: data.location.country,
            postalCode: data.location.postalCode || '',
        };
        user.timeZone = data.timeZone;
        user.onboard.step = 2;

        await user.save();

        result.error = false;
        result.code = 200;
        result.message = 'Basic information saved successfully';
        result.data = {
            step: user.onboard.step,
            status: user.onboard.status,
        };

        return result;
    }

    /**
     * @description Set talent-specific information
     * @param userId - The user ID
     * @param data - OnboardTalentInfoDTO containing specialty, gender, dateOfBirth
     */
    async setTalentInfo(
        userId: string | Types.ObjectId,
        data: OnboardTalentInfoDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const userDoc = await User.findById(String(userId));
        if (!userDoc) {
            result.error = true;
            result.message = 'User not found';
            result.code = 404;
            return result;
        }
        const user = userDoc as IUserDoc;

        // Validate user type
        if (user.userType !== UserType.TALENT) {
            result.error = true;
            result.message = 'User is not a talent';
            result.code = 400;
            return result;
        }

        // Validate step progression
        if (user.onboard.step < 2) {
            result.error = true;
            result.message = 'Please complete previous steps first';
            result.code = 400;
            return result;
        }

        // Validate required fields
        if (!data.specialty || !data.gender || !data.dateOfBirth) {
            result.error = true;
            result.message = 'Missing required fields';
            result.code = 400;
            return result;
        }

        // Validate gender enum
        if (!Object.values(GenderType).includes(data.gender)) {
            result.error = true;
            result.message = 'Invalid gender value';
            result.code = 400;
            return result;
        }

        // Validate date of birth (must be valid date and user must be at least 13 years old)
        const birthDate = new Date(data.dateOfBirth);
        if (isNaN(birthDate.getTime())) {
            result.error = true;
            result.message = 'Invalid date of birth';
            result.code = 400;
            return result;
        }

        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age < 13) {
            result.error = true;
            result.message = 'User must be at least 13 years old';
            result.code = 400;
            return result;
        }

        // Check if talent document already exists
        const talentResult = await talentRepository.findOne({ user: userId });
        let talent: any = null;

        if (talentResult.error === false && talentResult.data) {
            talent = talentResult.data;
            // Update existing talent
            talent.firstName = user.firstName;
            talent.lastName = user.lastName;
            talent.email = user.email;
            talent.specialties = [data.specialty]; // Initialize with single specialty
            talent.gender = data.gender;
            talent.dateOfBirth = data.dateOfBirth;
        } else {
            // Create new talent document
            const talentcreateUser = await talentService.createTalent({
                code: genUserCode(UserType.TALENT),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                user: user,
                createdBy: String(user._id || user.id),
            });

            if (talentcreateUser.error) {
                result.error = true;
                result.code = talentcreateUser.code;
                result.message = talentcreateUser.message;
                return result;
            }

            talent = talentcreateUser.data.talent;
        }

        // Update existing talent if needed
        if (talent && talentResult.error === false && talentResult.data) {
            const talentId = String((talent as any)._id || (talent as any).id);
            await talentRepository.updateTalent(talentId, {
                specialties: [data.specialty],
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
            } as any);
        }

        // Update user onboarding step
        user.onboard.step = 3;
        await user.save();

        result.error = false;
        result.code = 200;
        result.message = 'Talent information saved successfully';
        result.data = {
            talent: {
                id: talent.id,
                code: talent.code,
                specialties: talent.specialties || [data.specialty],
            },
            step: user.onboard.step,
            status: user.onboard.status,
        };

        return result;
    }

    /**
     * @description Set business-specific information
     * @param userId - The user ID
     * @param data - OnboardBusinessInfoDTO containing businessName, businessType, industry, tags
     */
    async setBusinessInfo(
        userId: string | Types.ObjectId,
        data: OnboardBusinessInfoDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const userDoc = await User.findById(String(userId));
        if (!userDoc) {
            result.error = true;
            result.message = 'User not found';
            result.code = 404;
            return result;
        }
        const user = userDoc as IUserDoc;

        // Validate user type
        if (user.userType !== UserType.BUSINESS) {
            result.error = true;
            result.message = 'User is not a BUSINESS';
            result.code = 400;
            return result;
        }

        // Validate step progression
        if (user.onboard.step < 2) {
            result.error = true;
            result.message = 'Please complete previous steps first';
            result.code = 400;
            return result;
        }

        // Validate required fields
        if (!data.businessName || !data.businessType || !data.industry) {
            result.error = true;
            result.message = 'Missing required fields';
            result.code = 400;
            return result;
        }

        // Validate business type enum
        // if (!Object.values(BusinessType).includes(data.businessType)) {
        //     result.error = true;
        //     result.message = 'Invalid business type';
        //     result.code = 400;
        //     return result;
        // }

        // Check if business document already exists
        const businessResult = await businessRepository.findOne({
            user: userId,
        });
        let business: any = null;

        if (businessResult.error === false && businessResult.data) {
            business = businessResult.data;
            // Update existing business
            business.firstName = user.firstName;
            business.lastName = user.lastName;
            business.email = user.email;
            business.businessName = data.businessName;
            business.businessType = data.businessType;
            business.industry = data.industry;
            business.tags = data.tags || [];
        } else {
            // Create new business document
            const createBusinessResult =
                await businessRepository.createBusiness({
                    code: genUserCode(UserType.BUSINESS),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    slug: genSlug(data.businessName),
                    email: user.email,
                    businessName: data.businessName,
                    businessType: data.businessType,
                    industry: data.industry,
                    tags: data.tags || [],
                    description: '', // Can be updated later
                    size: '', // Can be updated later
                    website: '', // Can be updated later
                    socials: [],
                    verification: {
                        status: VerificationType.UNVERIFIED,
                        verifiedBy: null,
                        verifiedAt: new Date(),
                        reason: '',
                    },
                    isPublic: false, // Set to true after verification
                    user: userId,
                    createdBy: userId,
                });

            if (createBusinessResult.error) {
                result.error = true;
                result.message = createBusinessResult.message;
                result.code = 400;
                return result;
            }
            business = createBusinessResult.data;
        }

        // Update user onboarding step
        user.onboard.step = 3;
        await user.save();

        result.error = false;
        result.code = 200;
        result.message = 'Business information saved successfully';
        result.data = {
            business: {
                id: business._id,
                code: business.code,
                businessName: business.businessName,
                businessType: business.businessType,
            },
            step: user.onboard.step,
            status: user.onboard.status,
        };

        return result;
    }

    /**
     * @description Complete onboarding
     * @param userId - The user ID
     */
    async completeOnboarding(
        userId: string | Types.ObjectId,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const userDoc = await User.findById(String(userId));
        if (!userDoc) {
            result.error = true;
            result.message = 'User not found';
            result.code = 404;
            return result;
        }
        let user = userDoc as IUserDoc;

        // Validate step progression
        if (user.onboard.step < 3) {
            result.error = true;
            result.message = 'Please complete all previous steps first';
            result.code = 400;
            return result;
        }

        // Verify that type-specific profile exists (USER type doesn't need a separate profile)
        if (user.userType === UserType.TALENT) {
            const talentResult = await talentRepository.findOne({
                user: userId,
            });
            if (talentResult.error || !talentResult.data) {
                result.error = true;
                result.message =
                    'Talent profile not found. Please complete step 3.';
                result.code = 400;
                return result;
            }
        } else if (user.userType === UserType.BUSINESS) {
            const businessResult = await businessRepository.findOne({
                user: userId,
            });
            if (businessResult.error || !businessResult.data) {
                result.error = true;
                result.message =
                    'Business profile not found. Please complete step 3.';
                result.code = 400;
                return result;
            }
        }
        // USER type doesn't require a separate profile, so no check needed

        // Ensure roles and permissions are set before completing onboarding
        if (!user.roles || user.roles.length === 0) {
            const roleAttachResult = await roleService.attachRole(
                user,
                user.userType,
            );
            if (roleAttachResult.error) {
                result.error = true;
                result.message = roleAttachResult.message;
                result.code = roleAttachResult.code || 500;
                return result;
            }
            if (!roleAttachResult.data) {
                result.error = true;
                result.message = 'Failed to attach role: no user data returned';
                result.code = 500;
                return result;
            }
            user = roleAttachResult.data as IUserDoc;
        }

        if (!user.permissions || user.permissions.length === 0) {
            const permResult =
                await PermissionService.initiatePermissionData(user);
            if (permResult.error) {
                result.error = true;
                result.message = permResult.message;
                result.code = permResult.code || 500;
                return result;
            }
            if (!permResult.data) {
                result.error = true;
                result.message = 'Failed to initialize permissions: no user data returned';
                result.code = 500;
                return result;
            }
            user = permResult.data as IUserDoc;
        }

        // Mark onboarding as completed
        user.onboard.step = 4;
        user.onboard.status = OnboardStatus.COMPLETED;
        user.isActive = true; // Activate user account

        await user.save();

        // Generate authentication token (moved from activateUserAccount)
        const tokenResult = await tokenService.attachToken(user);
        if (tokenResult.error) {
            result.error = true;
            result.message = tokenResult.message;
            result.code = tokenResult.code || 500;
            return result;
        }

        // Send welcome email (at onboarding completion)
        const welcomeEmailResult = await emailService.sendUserWelcomeEmail(user);
        if (welcomeEmailResult.error) {
            // Log error but don't fail the request
            console.error(
                'Failed to send welcome email:',
                welcomeEmailResult.message,
            );
        }

        // Determine redirect URL based on user type
        let redirectUrl = '/dashboard';
        if (user.userType === UserType.TALENT) {
            redirectUrl = '/dashboard/talent';
        } else if (user.userType === UserType.BUSINESS) {
            redirectUrl = '/dashboard/business';
        } else if (user.userType === UserType.USER) {
            redirectUrl = '/dashboard';
        }

        result.error = false;
        result.code = 200;
        result.message = 'Onboarding completed successfully';
        result.data = {
            step: user.onboard.step,
            status: user.onboard.status,
            redirectUrl,
            userType: user.userType,
            token: tokenResult.data?.token,
        };

        return result;
    }

    /**
     * @description Get current onboarding status
     * @param userId - The user ID
     */
    async getOnboardingStatus(
        userId: string | Types.ObjectId,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const userResult = await userRepository.findById(String(userId));
        if (userResult.error || !userResult.data) {
            result.error = true;
            result.message = 'User not found';
            result.code = 404;
            return result;
        }
        const user = userResult.data as IUserDoc;

        const currentStep = user.onboard.step || 1;
        const status = user.onboard.status || OnboardStatus.NOT_STARTED;
        const totalSteps = 4;

        const progress = {
            completedSteps: currentStep - 1,
            totalSteps,
            percentage: Math.round(((currentStep - 1) / totalSteps) * 100),
        };

        result.error = false;
        result.code = 200;
        result.message = 'Onboarding status retrieved successfully';
        result.data = {
            step: currentStep,
            status,
            progress,
            canProceed:
                status !== OnboardStatus.COMPLETED && currentStep < totalSteps,
            userType: user.userType,
        };

        return result;
    }

    /**
     * @description Set user information (specialty, role, discovery) - works for all user types
     * @param userId - The user ID
     * @param data - OnboardUserInfoDTO containing specialty, role, discovery
     */
    async setUserInfo(
        userId: string | Types.ObjectId,
        data: OnboardUserInfoDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const userDoc = await User.findById(String(userId));
        if (!userDoc) {
            result.error = true;
            result.message = 'User not found';
            result.code = 404;
            return result;
        }
        const user = userDoc as IUserDoc;

        // Validate step progression
        if (user.onboard.step < 2) {
            result.error = true;
            result.message = 'Please complete previous steps first';
            result.code = 400;
            return result;
        }

        // Validate required fields
        if (!data.specialty || !data.role || !data.discovery) {
            result.error = true;
            result.message = 'Missing required fields';
            result.code = 400;
            return result;
        }

        // Store user info in a metadata field or extend user model
        // For now, we'll store it in user metadata if available, or extend the user model
        // Since we don't have a metadata field, we'll update onboarding step and store in user preferences or extend model
        // For simplicity, we'll just update the onboarding step to 3
        // In a production system, you might want to add fields to the user model for specialty, role, discovery

        user.onboard.step = 3;
        await user.save();

        result.error = false;
        result.code = 200;
        result.message = 'User information saved successfully';
        result.data = {
            specialty: data.specialty,
            role: data.role,
            discovery: data.discovery,
            step: user.onboard.step,
            status: user.onboard.status,
        };

        return result;
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
