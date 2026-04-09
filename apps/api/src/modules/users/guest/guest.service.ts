import { Types } from 'mongoose';
import { dateToday, IDateToday } from '@btffamily/pacitude';
import { IGuestDoc, GuestTypeEnum, MentorContextType, GuestVisibiltyEnum, GuestStatusEnum, GuestInviteStatus } from './guest.interface';
import { CreateGuestDTO, UpdateGuestDTO } from './guest.dto';
import guestRepository from './guest.repository';
import { IResult, IFile } from '../../../utils/interfaces.util';
import { IUserDoc, UserType } from '../user/user.interface';
import { genSlug } from '../../../utils/helpers.util';
import { genGuestCode } from '../../../utils/code.util';
import storageService from '../../platform/storage/storage.service';
import User from '../user/user.model';
import roleService from '../../authentication/role/role.service';
import PermissionService from '../../authentication/permission/permission.service';

class GuestService {
    public result: IResult;
    public today: IDateToday;

    constructor() {
        this.today = dateToday(new Date());
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    /**
     * @method createGuest
     * @description Creates a new guest profile in the system (can be MENTOR, JUDGE, or GUEST type).
     * @param {CreateGuestDTO} data - The guest profile payload.
     * @returns {Promise<IResult>} A structured result object.
     */
    public async createGuest(
        data: CreateGuestDTO,
    ): Promise<IResult<{ guest: IGuestDoc }>> {
        let result: IResult<{ guest: IGuestDoc }> = {
            error: false,
            message: '',
            code: 200,
            data: {} as { guest: IGuestDoc },
        };

        const {
            firstName,
            lastName,
            email,
            type,
            status,
            visibility,
            jobTitle,
            organization,
            bio,
            areasOfExpertise,
            yearsOfExperience,
            guestImage,
            linkedInUrl,
            githubUrl,
            website,
            mentorType,
            invitedBy,
        } = data;

        if (!firstName || !lastName || !email || !type) {
            result.error = true;
            result.code = 400;
            result.message = 'First name, last name, email, and type are required';
            return result;
        }

        // Validate mentorType is only provided for MENTOR type
        if (mentorType && type !== GuestTypeEnum.MENTOR) {
            result.error = true;
            result.code = 400;
            result.message = 'mentorType can only be set when type is MENTOR';
            return result;
        }

        // Check if guest already exists with this email and type
        const existingGuestResult = await guestRepository.findOne({
            email: email.toLowerCase(),
            type: type,
        });
        if (
            existingGuestResult.error === false &&
            existingGuestResult.data
        ) {
            result.error = true;
            result.code = 400;
            result.message = `Guest profile already exists with this email and type (${type})`;
            return result;
        }

        // Generate unique code and slug
        let guestCode = genGuestCode();
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            const existingResult = await guestRepository.findOne({
                code: guestCode,
            });
            if (existingResult.error || !existingResult.data) {
                isUnique = true;
            } else {
                guestCode = genGuestCode();
                attempts++;
            }
        }

        if (!isUnique) {
            result.error = true;
            result.code = 500;
            result.message = 'Failed to generate unique guest code';
            return result;
        }

        const slug = genSlug(`${firstName}-${lastName}`);
        let uniqueSlug = slug;
        let slugAttempts = 0;
        const maxSlugAttempts = 10;

        while (slugAttempts < maxSlugAttempts) {
            const existingSlugResult = await guestRepository.findOne({
                slug: uniqueSlug,
            });
            if (existingSlugResult.error || !existingSlugResult.data) {
                break;
            }
            uniqueSlug = `${slug}-${slugAttempts + 1}`;
            slugAttempts++;
        }

        // Build socials array
        const socials = [];
        if (linkedInUrl) {
            socials.push({
                name: 'linkedin',
                url: linkedInUrl,
                username: linkedInUrl.split('/').pop() || '',
            });
        }
        if (githubUrl) {
            socials.push({
                name: 'github',
                url: githubUrl,
                username: githubUrl.split('/').pop() || '',
            });
        }
        if (website) {
            socials.push({
                name: 'website',
                url: website,
                username: '',
            });
        }

        // Handle image upload if provided
        let imageData = undefined;
        if (guestImage) {
            // If guestImage is an IFile with stream, upload it
            if ((guestImage as IFile).stream) {
                const uploadResult = await storageService.uploadFile(
                    guestImage as IFile,
                );

                if (uploadResult.error) {
                    result.error = true;
                    result.code = uploadResult.code || 500;
                    result.message = uploadResult.message;
                    return result;
                }

                imageData = {
                    fileName: uploadResult.data.fileName || '',
                    s3Key: uploadResult.data.s3Key || '',
                };
            } else {
                // If it's already uploaded, check if it has s3Key (from storage service response)
                const imageWithS3Key = guestImage as any;
                if (imageWithS3Key.s3Key) {
                    imageData = {
                        fileName: imageWithS3Key.fileName || guestImage.fileName || '',
                        s3Key: imageWithS3Key.s3Key || '',
                    };
                } else if (guestImage.fileName) {
                    // If only fileName is provided, we can't use it without s3Key
                    result.error = true;
                    result.code = 400;
                    result.message = 'Image s3Key is required for already uploaded images';
                    return result;
                }
            }
        }

        // Check if a user account exists with this email
        // If user exists, link them
        // If no user exists, create profile-only guest (external, no account)
        let linkedUser: IUserDoc | null = null;
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            linkedUser = existingUser;
        }

        const guestData: Partial<IGuestDoc> = {
            code: guestCode,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            slug: uniqueSlug,
            email: email.toLowerCase().trim(),
            bio: bio || '',
            jobTitle: jobTitle || '',
            organization: organization || '',
            areasOfExpertise: areasOfExpertise || [],
            yearsOfExperience: yearsOfExperience || '',
            socials: socials,
            image: imageData,
            type: type,
            visibility: visibility || GuestVisibiltyEnum.PUBLIC,
            status: status || GuestStatusEnum.ACTIVE,
            inviteStatus: GuestInviteStatus.PENDING,
            invitedBy: new Types.ObjectId(invitedBy),
            user: linkedUser ? linkedUser._id : undefined,
            settings: {},
            hackathons: [],
            entries: type === GuestTypeEnum.MENTOR ? [] : [], // Only mentors use entries, but keep as array for all types
            projects: [],
            workspace: [],
        };

        // Add mentorType only if type is MENTOR
        if (type === GuestTypeEnum.MENTOR) {
            guestData.mentorType = mentorType || MentorContextType.ENTRY;
        }

        const createResult = await guestRepository.createGuest(guestData);
        if (createResult.error || !createResult.data) {
            result.error = true;
            result.code = 500;
            result.message = createResult.message;
            return result;
        }

        result.message = linkedUser 
            ? `Guest profile (${type}) created successfully with linked user account`
            : `Guest profile (${type}) created successfully (profile-only, no user account)`;
        result.code = 201;
        result.data = { guest: createResult.data as IGuestDoc };
        return result;
    }

    /**
     * @name getGuest
     * @description Retrieves a guest by ID, including populated relations
     */
    public async getGuest(guestId: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const guestResult = await guestRepository.findGuest(
            guestId,
            [
                { path: 'user' },
                { path: 'hackathons' },
                { path: 'entries' },
                { path: 'projects' },
                { path: 'workspace' },
                { path: 'invitedBy' },
            ],
        );

        if (guestResult.error || !guestResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Guest not found';
            return result;
        }

        result.data = guestResult.data;
        result.message = 'Guest retrieved successfully';
        return result;
    }

    /**
     * @name getGuests
     * @description Retrieves all guests with optional filtering and pagination
     */
    public async getGuests(
        filter?: any,
        options?: {
            select?: string;
            sort?: string;
            page?: number;
            limit?: number;
            populate?: string | any;
        },
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: [],
        };

        const guestsResult = await guestRepository.getGuests(
            filter,
            options,
        );

        if (guestsResult.error) {
            result.error = true;
            result.code = guestsResult.code || 500;
            result.message = guestsResult.message;
            return result;
        }

        result.data = guestsResult.data;
        result.pagination = guestsResult.pagination;
        result.pagination!.count = guestsResult.pagination?.count || 0;
        result.pagination!.total = guestsResult.pagination?.total || 0;
        result.message = 'Guests retrieved successfully';
        return result;
    }

    /**
     * @name updateGuest
     * @description Updates a guest profile with new details
     */
    public async updateGuest(
        guestId: string,
        data: UpdateGuestDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        // Find the guest
        const findResult = await guestRepository.findGuest(guestId);
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Guest not found';
            return result;
        }

        const guest = findResult.data as IGuestDoc;

        // Validate mentorType is only provided for MENTOR type
        if (data.mentorType && guest.type !== GuestTypeEnum.MENTOR) {
            result.error = true;
            result.code = 400;
            result.message = 'mentorType can only be set when guest type is MENTOR';
            return result;
        }

        const updateData: Partial<IGuestDoc> = {};
        if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
        if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
        if (data.bio !== undefined) updateData.bio = data.bio;
        if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
        if (data.organization !== undefined) updateData.organization = data.organization;
        if (data.areasOfExpertise !== undefined) updateData.areasOfExpertise = data.areasOfExpertise;
        if (data.yearsOfExperience !== undefined) updateData.yearsOfExperience = data.yearsOfExperience;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.visibility !== undefined) updateData.visibility = data.visibility;
        if (data.mentorType !== undefined && guest.type === GuestTypeEnum.MENTOR) {
            updateData.mentorType = data.mentorType;
        }

        // Handle socials update
        if (data.linkedInUrl || data.githubUrl || data.website) {
            const socials = [...(guest.socials || [])];
            
            if (data.linkedInUrl) {
                const linkedInIndex = socials.findIndex(s => s.name === 'linkedin');
                if (linkedInIndex >= 0) {
                    socials[linkedInIndex] = {
                        name: 'linkedin',
                        url: data.linkedInUrl,
                        username: data.linkedInUrl.split('/').pop() || '',
                    };
                } else {
                    socials.push({
                        name: 'linkedin',
                        url: data.linkedInUrl,
                        username: data.linkedInUrl.split('/').pop() || '',
                    });
                }
            }
            if (data.githubUrl) {
                const githubIndex = socials.findIndex(s => s.name === 'github');
                if (githubIndex >= 0) {
                    socials[githubIndex] = {
                        name: 'github',
                        url: data.githubUrl,
                        username: data.githubUrl.split('/').pop() || '',
                    };
                } else {
                    socials.push({
                        name: 'github',
                        url: data.githubUrl,
                        username: data.githubUrl.split('/').pop() || '',
                    });
                }
            }
            if (data.website) {
                const websiteIndex = socials.findIndex(s => s.name === 'website');
                if (websiteIndex >= 0) {
                    socials[websiteIndex] = {
                        name: 'website',
                        url: data.website,
                        username: '',
                    };
                } else {
                    socials.push({
                        name: 'website',
                        url: data.website,
                        username: '',
                    });
                }
            }
            updateData.socials = socials;
        }

        // Handle image update
        if (data.guestImage) {
            const oldImage = guest.image;

            // If there's an old image, delete it from S3
            if (oldImage?.s3Key) {
                try {
                    await storageService.deleteFile(oldImage.s3Key);
                } catch (error) {
                    // Log error but don't fail the update
                    console.error('Failed to delete old image:', error);
                }
            }

            // If guestImage is an IFile with stream, upload it
            if ((data.guestImage as IFile).stream) {
                const uploadResult = await storageService.uploadFile(
                    data.guestImage as IFile,
                );

                if (uploadResult.error) {
                    result.error = true;
                    result.code = uploadResult.code || 500;
                    result.message = uploadResult.message;
                    return result;
                }

                updateData.image = {
                    fileName: uploadResult.data.fileName || '',
                    s3Key: uploadResult.data.s3Key || '',
                };
            } else {
                // If it's already uploaded, check if it has s3Key (from storage service response)
                const imageWithS3Key = data.guestImage as any;
                if (imageWithS3Key.s3Key) {
                    updateData.image = {
                        fileName: imageWithS3Key.fileName || data.guestImage.fileName || '',
                        s3Key: imageWithS3Key.s3Key || '',
                    };
                } else if (data.guestImage.fileName) {
                    // If only fileName is provided, we can't use it without s3Key
                    result.error = true;
                    result.code = 400;
                    result.message = 'Image s3Key is required for already uploaded images';
                    return result;
                }
            }
        }

        // Update the guest
        const updateResult = await guestRepository.updateGuest(
            guestId,
            updateData,
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Guest profile updated successfully';
        result.data = updateResult.data;
        return result;
    }

    /**
     * @name deleteGuest
     * @description Deletes a guest profile
     */
    public async deleteGuest(guestId: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        // Find the guest
        const findResult = await guestRepository.findGuest(guestId);
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Guest not found';
            return result;
        }

        const guest = findResult.data as IGuestDoc;

        // Delete the image from S3 if it exists
        if (guest.image?.s3Key) {
            try {
                await storageService.deleteFile(guest.image.s3Key);
            } catch (error) {
                // Log error but don't fail the delete
                console.error('Failed to delete image from S3:', error);
            }
        }

        // Delete the guest
        const deleteResult = await guestRepository.deleteGuest(guestId);
        if (deleteResult.error) {
            result.error = true;
            result.code = deleteResult.code;
            result.message = deleteResult.message;
            return result;
        }

        result.message = 'Guest profile deleted successfully';
        result.data = deleteResult.data;
        return result;
    }
}

export default new GuestService();
