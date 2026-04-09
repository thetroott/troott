import { dateToday, IDateToday } from '@btffamily/pacitude';
import { ITalentDoc } from './talent.interface';
import { CreateTalentDTO, UpdateTalentDTO } from './talent.dto';
import talentRepository from './talent.repository';
import { IResult } from '../../../utils/interfaces.util';
import { IUserDoc, UserType } from '../user/user.interface';
import { genSlug } from '../../../utils/helpers.util';
import { genUserCode } from '../../../utils/code.util';
import roleService from '../../authentication/role/role.service';
import PermissionService from '../../authentication/permission/permission.service';

class TalentService {
    public result: IResult;
    public today: IDateToday;

    constructor() {
        this.today = dateToday(new Date());
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    /**
     * @method createTalent
     * @description Creates a new talent profile in the system.
     * @param {CreateTalentDTO} data - The talent profile payload.
     * @returns {Promise<IResult>} A structured result object.
     */
    public async createTalent(
        data: CreateTalentDTO,
    ): Promise<IResult<{ talent: ITalentDoc; user: IUserDoc }>> {
        let result: IResult<{ talent: ITalentDoc; user: IUserDoc }> = {
            error: false,
            message: '',
            code: 200,
            data: {} as { talent: ITalentDoc; user: IUserDoc },
        };

        const { code, firstName, lastName, email, user, createdBy } = data;

        if (!user) {
            result.error = true;
            result.code = 400;
            result.message =
                'User information is required to create a talent profile';
            return result;
        }

        const existingTalentResult = await talentRepository.findOne({
            user: user._id || user.id,
        });
        if (existingTalentResult.error === false && existingTalentResult.data) {
            result.error = true;
            result.code = 400;
            result.message = 'Talent profile already exists for this user';
            return result;
        }

        const talentData = {
            code: code || genUserCode(UserType.TALENT),
            firstName,
            lastName,
            email,
            slug: genSlug(`${firstName} ${lastName}`),

            // Default values for fields not in DTO
            bio: '',
            skils: [],
            specialties: [],
            intrests: [],
            socials: [],

            // Relationships
            user: user._id || user.id,
            createdBy: createdBy || user._id || user.id,

            // Initialize relationship arrays
            workspaces: [],
            transactions: [],
            templates: [],
            hackathons: [],
            entries: [],
            submissions: [],
            squad: [],
            projects: [],
            teams: [],
            tasks: [],
        };

        const createResult = await talentRepository.createTalent(talentData);
        if (createResult.error || !createResult.data) {
            result.error = true;
            result.code = 500;
            result.message =
                createResult.message;
            return result;
        }

        // Check if user already has roles
        if (!user.roles || user.roles.length === 0) {
            // Attach TALENT role
            const roleAttachResult = await roleService.attachRole(
                user,
                UserType.TALENT,
            );
            if (!roleAttachResult.error && roleAttachResult.data) {
                let updatedUser = roleAttachResult.data as IUserDoc;

                // Initialize permissions for TALENT role
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
            // Check if user already has TALENT role
            const hasTalentRole = user.roles.some(
                (r: any) => (r?.name || r?.toString()) === UserType.TALENT,
            );
            if (!hasTalentRole) {
                // Attach TALENT role
                const roleAttachResult = await roleService.attachRole(
                    user,
                    UserType.TALENT,
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

        result.message = 'Talent profile created successfully';
        result.code = 201;
        result.data = { talent: createResult.data as ITalentDoc, user };
        return result;
    }

    /**
     * @name updateProfile
     * @description Updates a talent profile with new details
     */
    public async updateProfile(
        userId: string,
        data: UpdateTalentDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        // Find the talent by user ID
        const findResult = await talentRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Talent profile not found';
            return result;
        }

        const talent = findResult.data as ITalentDoc;
        const talentId = String(talent._id || talent.id);

        // Update the talent
        const updateResult = await talentRepository.updateTalent(
            talentId,
            data as any,
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Talent profile updated successfully';
        result.data = updateResult.data;
        return result;
    }

    /**
     * @name getTalentProfile
     * @description Retrieves a full talent profile, including populated relations
     */
    public async getTalentProfile(userId: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const talentResult = await talentRepository.findOne(
            { user: userId },
            {
                populate: [
                    { path: 'workspaces' },
                    { path: 'hackathons' },
                    { path: 'teams' },
                    { path: 'projects' },
                    { path: 'squad' },
                ],
            },
        );

        if (talentResult.error || !talentResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Talent profile not found';
            return result;
        }

        result.data = talentResult.data;
        result.message = 'Talent profile retrieved successfully';
        return result;
    }

    /**
     * @name updateInterests
     * @description Updates a talent's interests
     */
    public async updateInterests(
        userId: string,
        intrests: string[],
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!intrests || intrests.length === 0) {
            result.error = true;
            result.code = 400;
            result.message =
                'Invalid interests: must provide at least one interest';
            return result;
        }

        // Find the talent by user ID
        const findResult = await talentRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Talent profile not found';
            return result;
        }

        const talent = findResult.data as ITalentDoc;
        const talentId = String(talent._id || talent.id);

        // Update interests
        const updateResult = await talentRepository.updateTalent(talentId, {
            intrests,
        });
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Interests updated successfully';
        result.data = (updateResult.data as ITalentDoc).intrests;
        return result;
    }

    /**
     * @name addSkill
     * @description Adds a new skill to a talent profile
     */
    public async addSkill(userId: string, skill: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!skill) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid skill';
            return result;
        }

        // Find the talent by user ID
        const findResult = await talentRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Talent profile not found';
            return result;
        }

        const talent = findResult.data as ITalentDoc;
        const currentSkills = talent.skils || [];

        // Check if skill already exists
        if (currentSkills.includes(skill)) {
            result.error = true;
            result.code = 400;
            result.message = 'Skill already exists';
            return result;
        }

        // Add skill to array
        const updatedSkills = [...currentSkills, skill];
        const talentId = String(talent._id || talent.id);

        const updateResult = await talentRepository.updateTalent(talentId, {
            skils: updatedSkills,
        });
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Skill added successfully';
        result.data = (updateResult.data as ITalentDoc).skils;
        return result;
    }

    /**
     * @name removeSkill
     * @description Removes a skill from a talent profile
     */
    public async removeSkill(userId: string, skill: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        // Find the talent by user ID
        const findResult = await talentRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Talent profile not found';
            return result;
        }

        const talent = findResult.data as ITalentDoc;
        const currentSkills = talent.skils || [];

        // Remove skill from array
        const updatedSkills = currentSkills.filter((s) => s !== skill);
        const talentId = String(talent._id || talent.id);

        const updateResult = await talentRepository.updateTalent(talentId, {
            skils: updatedSkills,
        });
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Skill removed successfully';
        result.data = (updateResult.data as ITalentDoc).skils;
        return result;
    }
}

export default new TalentService();
