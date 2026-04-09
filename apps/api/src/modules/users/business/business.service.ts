import { dateToday, IDateToday } from '@btffamily/pacitude';
import { IBusinessDoc, VerificationType } from './business.interface';
import { CreateBusinessDTO, UpdateBusinessDTO } from './business.dto';
import businessRepository from './business.repository';
import { IResult } from '../../../utils/interfaces.util';
import { IUserDoc, UserType } from '../user/user.interface';
import { genSlug } from '../../../utils/helpers.util';
import { genUserCode } from '../../../utils/code.util';
import roleService from '../../authentication/role/role.service';
import PermissionService from '../../authentication/permission/permission.service';

class BusinessService {
    public result: IResult;
    public today: IDateToday;

    constructor() {
        this.today = dateToday(new Date());
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    /**
     * @method createBusiness
     * @description Creates a new business profile in the system.
     * @param {CreateBusinessDTO} data - The business profile payload.
     * @returns {Promise<IResult>} A structured result object.
     */
    public async createBusiness(
        data: CreateBusinessDTO,
    ): Promise<IResult<{ business: IBusinessDoc; user: IUserDoc }>> {
        let result: IResult<{ business: IBusinessDoc; user: IUserDoc }> = {
            error: false,
            message: '',
            code: 200,
            data: {} as { business: IBusinessDoc; user: IUserDoc },
        };

        const { user, businessName, businessType, industry, createdBy } = data;

        if (!user) {
            result.error = true;
            result.code = 400;
            result.message =
                'User information is required to create a business profile';
            return result;
        }

        if (!businessName || !businessType || !industry) {
            result.error = true;
            result.code = 400;
            result.message = 'Business name, type, and industry are required';
            return result;
        }

        const existingBusinessResult = await businessRepository.findOne({
            user: user._id || user.id,
        });
        if (
            existingBusinessResult.error === false &&
            existingBusinessResult.data
        ) {
            result.error = true;
            result.code = 400;
            result.message = 'Business profile already exists for this user';
            return result;
        }

        const businessData = {
            code: genUserCode(UserType.BUSINESS),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            slug: genSlug(businessName),

            // Business details from DTO
            businessName,
            businessType,
            industry,
            isPublic: false,

            // Relationships
            user: user.id,
            createdBy: createdBy || user._id || user.id,

            // Initialize relationship arrays
            workspaces: [],
            transactions: [],
            templates: [],
            discovery: [],
            customDomain: [],
            hackathons: [],
            entries: [],
            submissions: [],
            projects: [],
            teams: [],
            tasks: [],
        };

        const createResult =
            await businessRepository.createBusiness(businessData);
        if (createResult.error || !createResult.data) {
            result.error = true;
            result.code = 500;
            result.message =
                createResult.message;
            return result;
        }

        // Ensure user has BUSINESS role and permissions
        try {
            // Check if user already has roles
            if (!user.roles || user.roles.length === 0) {
                // Attach BUSINESS role
                const roleAttachResult = await roleService.attachRole(
                    user,
                    UserType.BUSINESS,
                );
                if (!roleAttachResult.error && roleAttachResult.data) {
                    let updatedUser = roleAttachResult.data as IUserDoc;

                    // Initialize permissions for BUSINESS role
                    const permResult =
                        await PermissionService.initiatePermissionData(updatedUser);
                    if (!permResult.error && permResult.data) {
                        updatedUser = permResult.data as IUserDoc;
                    }

                    // Clear permission cache (use updatedUser or fallback to original user)
                    const userId = updatedUser?._id || user._id;
                    if (userId) {
                        await PermissionService.clearUserCache(String(userId));
                    }
                }
            } else {
                // Check if user already has BUSINESS role
                const hasBusinessRole = user.roles.some(
                    (r: any) =>
                        (r?.name || r?.toString()) === UserType.BUSINESS,
                );
                if (!hasBusinessRole) {
                    // Attach BUSINESS role
                    const roleAttachResult = await roleService.attachRole(
                        user,
                        UserType.BUSINESS,
                    );
                    if (!roleAttachResult.error && roleAttachResult.data) {
                        const updatedUser = roleAttachResult.data as IUserDoc;
                        const userId = updatedUser?._id || user._id;
                        if (userId) {
                            await PermissionService.clearUserCache(String(userId));
                        }
                    }
                }
            }
        } catch (error) {
            // Log error but don't fail business creation
            console.error('Failed to initialize roles/permissions for business:', error);
        }

        result.message = 'Business profile created successfully';
        result.code = 201;
        result.data = { business: createResult.data as IBusinessDoc, user };
        return result;
    }

    /**
     * @name updateProfile
     * @description Updates a business profile with new details
     */
    public async updateProfile(
        userId: string,
        data: UpdateBusinessDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        // Find the business by user ID
        const findResult = await businessRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Business profile not found';
            return result;
        }

        const business = findResult.data as IBusinessDoc;
        const businessId = String(business._id || business.id);

        // Update the business
        const updateResult = await businessRepository.updateBusiness(
            businessId,
            data,
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Business profile updated successfully';
        result.data = updateResult.data;
        return result;
    }

    /**
     * @name getBusinessProfile
     * @description Retrieves a full business profile, including populated relations
     */
    public async getBusinessProfile(userId: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const businessResult = await businessRepository.findOne(
            { user: userId },
            {
                populate: [
                    { path: 'workspaces' },
                    { path: 'hackathons' },
                    { path: 'teams' },
                    { path: 'projects' },
                    { path: 'subscription' },
                ],
            },
        );

        if (businessResult.error || !businessResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Business profile not found';
            return result;
        }

        result.data = businessResult.data;
        result.message = 'Business profile retrieved successfully';
        return result;
    }

    /**
     * @name updateTags
     * @description Updates a business's tags
     */
    public async updateTags(userId: string, tags: string[]): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!tags || tags.length === 0) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid tags: must provide at least one tag';
            return result;
        }

        // Find the business by user ID
        const findResult = await businessRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Business profile not found';
            return result;
        }

        const business = findResult.data as IBusinessDoc;
        const businessId = String(business._id || business.id);

        // Update tags
        const updateResult = await businessRepository.updateBusiness(
            businessId,
            { tags },
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Tags updated successfully';
        result.data = (updateResult.data as IBusinessDoc).tags;
        return result;
    }

    /**
     * @name addTag
     * @description Adds a new tag to a business profile
     */
    public async addTag(userId: string, tag: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!tag) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid tag';
            return result;
        }

        // Find the business by user ID
        const findResult = await businessRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Business profile not found';
            return result;
        }

        const business = findResult.data as IBusinessDoc;
        const currentTags = business.tags || [];

        // Check if tag already exists
        if (currentTags.includes(tag)) {
            result.error = true;
            result.code = 400;
            result.message = 'Tag already exists';
            return result;
        }

        // Add tag to array
        const updatedTags = [...currentTags, tag];
        const businessId = String(business._id || business.id);

        const updateResult = await businessRepository.updateBusiness(
            businessId,
            { tags: updatedTags },
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Tag added successfully';
        result.data = (updateResult.data as IBusinessDoc).tags;
        return result;
    }

    /**
     * @name removeTag
     * @description Removes a tag from a business profile
     */
    public async removeTag(userId: string, tag: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        // Find the business by user ID
        const findResult = await businessRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Business profile not found';
            return result;
        }

        const business = findResult.data as IBusinessDoc;
        const currentTags = business.tags || [];

        // Remove tag from array
        const updatedTags = currentTags.filter((t) => t !== tag);
        const businessId = String(business._id || business.id);

        const updateResult = await businessRepository.updateBusiness(
            businessId,
            { tags: updatedTags },
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Tag removed successfully';
        result.data = (updateResult.data as IBusinessDoc).tags;
        return result;
    }

    /**
     * @name updateVerification
     * @description Updates business verification status (admin only)
     */
    public async updateVerification(
        userId: string,
        verification: {
            status: VerificationType;
            verifiedBy?: string;
            reason?: string;
        },
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        // Find the business by user ID
        const findResult = await businessRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Business profile not found';
            return result;
        }

        const business = findResult.data as IBusinessDoc;
        const businessId = String(business._id || business.id);

        const verificationData = {
            ...business.verification,
            status: verification.status,
            verifiedBy:
                verification.verifiedBy || business.verification?.verifiedBy,
            verifiedAt:
                verification.status === VerificationType.VERIFIED
                    ? new Date()
                    : business.verification?.verifiedAt,
            reason: verification.reason || business.verification?.reason || '',
        };

        // Update verification and isPublic status
        const updateResult = await businessRepository.updateBusiness(
            businessId,
            {
                verification: verificationData,
                isPublic: verification.status === VerificationType.VERIFIED,
            },
        );

        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Verification status updated successfully';
        result.data = (updateResult.data as IBusinessDoc).verification;
        return result;
    }
}

export default new BusinessService();
