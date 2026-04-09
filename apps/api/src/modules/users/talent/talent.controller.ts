import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import talentService from './talent.service';
import talentRepository from './talent.repository';
import { ITalentDoc } from './talent.interface';
import {
    UpdateTalentDTO,
    InviteTalentDTO,
    AcceptTalentInvitationDTO,
    SetTalentPasswordDTO,
} from './talent.dto';
import { InvitationType } from '../../platform/Invitation/invitation.interface';
import { InviteTokenDTO } from '../../platform/Invitation/invitation.dto';
import invitationService from '../../platform/Invitation/invitation.service';
import emailService from '../../../services/email.service';
import { EMAIL_CONFIG } from '../../../configs/email.config';
import userRepository from '../user/user.repository';
import userService from '../user/user.service';
import authService from '../../authentication/auth/auth.service';
import redisWrapper from '../../../middlewares/redis.mdw';
import {
    PasswordType,
    UserType,
    IUserDoc,
} from '../user/user.interface';


/**
 * @name inviteTalent
 * @description Invites a talent to the system
 * @route POST /talent/invite
 * @access  Private (Admin only)
 */
export const inviteTalent: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { email, resourceId }: InviteTalentDTO = req.body;

        if (!email || email.trim().length === 0)
            return next(new ErrorResponse('Email is required', 400, []));

        // Basic email validation
        const mailCheck = await authService.checkEmail(email);
        if (!mailCheck) {
            return next(new ErrorResponse('Invalid email format', 400, []));
        }

        const invitationResult = await invitationService.newInvitation({
            invitedBy: userId,
            inviteeEmail: email.trim().toLowerCase(),
            inviteType: InvitationType.TALENT,
            resourceId: resourceId || userId, // Use userId as default resourceId if not provided
        } as any);

        if (invitationResult.error) {
            return next(
                new ErrorResponse(
                    invitationResult.message,
                    invitationResult.code,
                    [],
                ),
            );
        }

        // Get the inviter's user details for email personalization
        const inviterResult = await userRepository.findById(userId);
        const inviter = inviterResult.data as any;

        // Extract token from invitation result
        const token = (invitationResult.data as any)?.token;
        if (!token) {
            return next(
                new ErrorResponse(
                    'Failed to generate invitation token',
                    500,
                    [],
                ),
            );
        }

        // Construct invitation URL with token
        const invitationUrl = `${EMAIL_CONFIG.clientUrl}/talent/invite/accept?token=${token}&email=${encodeURIComponent(email.trim().toLowerCase())}`;

        // Create a minimal user object for the invitee (they might not be a user yet)
        const inviteeUser = {
            email: email.trim().toLowerCase(),
            firstName: email.split('@')[0] || 'Talent', // Use email prefix as fallback
            lastName: '',
        } as any;

        // Send invitation email
        const emailResult = await emailService.sendInvitationEmail(
            inviteeUser,
            inviter?.firstName || 'A team member',
            invitationUrl,
            'Talent',
        );

        if (emailResult.error) {
            // Log error but don't fail the request since invitation was created
            console.error(
                'Failed to queue invitation email:',
                emailResult.message,
            );
        }

        res.status(201).json({
            error: false,
            errors: [],
            data: {
                ...invitationResult.data,
                emailQueued: !emailResult.error,
            },
            message:
                invitationResult.message ||
                'Talent invitation sent successfully.',
            status: 201,
        });
    },
);

/**
 * @name acceptTalentInvitation
 * @description Accepts a talent invitation and creates user account and profile
 * @route POST /talent/invite/accept
 * @access Public
 */
export const acceptTalentInvitation: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            token,
            email,
            password,
        }: AcceptTalentInvitationDTO = req.body;

        // Validate input
        if (!token || !email || !password) {
            return next(
                new ErrorResponse(
                    'Token, email, and password are required',
                    400,
                    [],
                ),
            );
        }

        // Validate email format
        const mailCheck = await authService.checkEmail(email);
        if (!mailCheck) {
            return next(new ErrorResponse('Invalid email format', 400, []));
        }

        // Validate password
        const passwordCheck = await authService.checkPassword(password);
        if (!passwordCheck) {
            return next(
                new ErrorResponse(
                    'Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number',
                    400,
                    [],
                ),
            );
        }

        // Validate invitation
        const validateResult = await invitationService.validateInvite({
            token,
            email: email.trim().toLowerCase(),
        });

        if (validateResult.error) {
            return next(
                new ErrorResponse(
                    validateResult.message,
                    validateResult.code,
                    [],
                ),
            );
        }

        const invitedBy = (validateResult.data as any)?.invitedBy;

        // Check if user exists
        let user: IUserDoc;
        const userExists = await userRepository.findOne({
            email: email.trim().toLowerCase(),
        });

        if (userExists.error === false && userExists.data) {
            // User exists, use existing user
            user = userExists.data as IUserDoc;
        } else {
            // Create user account
            try {
                user = await userService.createUser({
                    email: email.trim().toLowerCase(),
                    password,
                    passwordType: PasswordType.USERGENERATED,
                    userType: UserType.TALENT,
                    createdBy: invitedBy,
                });
            } catch (error: any) {
                return next(
                    new ErrorResponse(
                        error.message,
                        500,
                        [],
                    ),
                );
            }
        }

        // Talent profile will be created during onboarding step 3
        // No need to create it here - onboarding flow will handle it with real data

        // Activate account (no OTP needed since email is verified via invitation token)
        await authService.activateAccount(user);

        // Update login information
        await authService.updateLastLogin(user);

        res.status(201).json({
            error: false,
            errors: [],
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    userType: user.userType,
                },
            },
            message:
                'Talent invitation accepted successfully. Please proceed to onboarding to complete your profile.',
            status: 201,
        });
    },
);

/**
 * @name getTalent
 * @description Retrieves talent profile information
 * @route GET /talent
 * @access  Private
 */
export const getTalent: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const cacheKey = `talent:profile:${userId}`;
        const cacheTTL = 300; // 5 minutes for talent profile data

        // Check cache first
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Talent profile retrieved successfully (cached).',
                status: 200,
            });
        }

        // Get talent profile from service
        const result = await talentService.getTalentProfile(String(userId));

        if (result.error || !result.data) {
            return next(
                new ErrorResponse(
                    result.message || 'Talent profile not found',
                    result.code || 404,
                    [],
                ),
            );
        }

        // Cache the result
        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            cacheTTL,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name getTalents
 * @description Retrieves a paginated list of talents with filtering and sorting
 * @route GET /talents
 * @access  Private (Admin only - should add admin check)
 */
export const getTalents: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            page = 1,
            limit = 25,
            sort = '-createdAt',
            select,
            populate,
            ...filters
        } = req.query;

        // Build cache key from query parameters
        const cacheKey = `talents:list:${JSON.stringify({ page, limit, sort, select, filters })}`;
        const cacheTTL = 180; // 3 minutes for talent lists

        // Check cache first
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached.data,
                pagination: cached.pagination,
                count: cached.count,
                total: cached.total,
                message: 'Talents retrieved successfully (cached).',
                status: 200,
            });
        }

        // Build query options
        const options: any = {
            page: parseInt(String(page), 10),
            limit: parseInt(String(limit), 10),
            sort: String(sort),
        };

        if (select) {
            options.select = String(select);
        }

        if (populate) {
            options.populate = String(populate);
        }

        // Get talents from repository
        const result = await talentRepository.getTalents(
            filters as any,
            options,
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Prepare response data
        const responseData = {
            data: result.data,
            pagination: result.pagination,
            count: result.pagination!.count,
            total: result.pagination!.total,
        };

        // Cache the result
        await redisWrapper.keepData(
            { key: cacheKey, value: responseData },
            cacheTTL,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            pagination: result.pagination,
            count: result.pagination!.count,
            total: result.pagination!.total,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name updateTalent
 * @description Updates talent profile information
 * @route PUT /talent
 * @access  Private
 */
export const updateTalent: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const data: UpdateTalentDTO = req.body;

        const result = await talentService.updateProfile(String(userId), data);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`talent:profile:${userId}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name updateInterests
 * @description Updates talent interests
 * @route PUT /talent/interests
 * @access  Private
 */
export const updateInterests: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { interests } = req.body;

        if (!interests || !Array.isArray(interests)) {
            return next(
                new ErrorResponse('Interests must be an array', 400, []),
            );
        }

        // Service uses 'intrests' (typo in service, keeping for consistency)
        const result = await talentService.updateInterests(
            String(userId),
            interests as string[],
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`talent:profile:${userId}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name addSkill
 * @description Adds a skill to talent profile
 * @route POST /talent/skills
 * @access  Private
 */
export const addSkill: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { skill } = req.body;

        if (!skill || typeof skill !== 'string') {
            return next(new ErrorResponse('Skill must be a string', 400, []));
        }

        const result = await talentService.addSkill(String(userId), skill);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`talent:profile:${userId}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name removeSkill
 * @description Removes a skill from talent profile
 * @route DELETE /talent/skills/:skill
 * @access  Private
 */
export const removeSkill: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { skill } = req.params;

        if (!skill) {
            return next(new ErrorResponse('Skill is required', 400, []));
        }

        const result = await talentService.removeSkill(String(userId), skill);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`talent:profile:${userId}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name setTalentPassword
 * @description Sets password for an invited talent user
 * @route POST /talent/set-password
 * @access Private (for invited users who haven't set password yet)
 */
export const setTalentPassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { password }: SetTalentPasswordDTO = req.body;

        if (!password) {
            return next(
                new ErrorResponse('Password is required', 400, []),
            );
        }

        // Validate password
        const passwordCheck = await authService.checkPassword(password);
        if (!passwordCheck) {
            return next(
                new ErrorResponse(
                    'Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number',
                    400,
                    [],
                ),
            );
        }

        // Get user
        const userResult = await userRepository.findById(String(userId));
        if (userResult.error || !userResult.data) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        const user = userResult.data as IUserDoc;

        // Check if user is a talent
        if (user.userType !== UserType.TALENT) {
            return next(
                new ErrorResponse('This endpoint is only for talent users', 403, []),
            );
        }

        // Encrypt and set password
        await authService.encryptUserPassword(user, password);
        user.passwordType = PasswordType.USERGENERATED;
        await user.save();

        // Send password change notification
        await emailService.sendPasswordChangeNotificationEmail(user);

        res.status(200).json({
            error: false,
            errors: [],
            data: {
                message: 'Password set successfully',
            },
            message: 'Password set successfully. Please proceed to onboarding.',
            status: 200,
        });
    },
);

/**
 * @name revokeTalentInvitation
 * @description Revokes a talent invitation
 * @route POST /talent/invite/revoke
 * @access Private
 */
export const revokeTalentInvitation: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { token, email }: InviteTokenDTO = req.body;

        if (!token || !email) {
            return next(
                new ErrorResponse('Token and email are required', 400, []),
            );
        }

        const revokeResult = await invitationService.revokeInvite({
            token,
            email: email.trim().toLowerCase(),
        });

        if (revokeResult.error) {
            return next(
                new ErrorResponse(
                    revokeResult.message,
                    revokeResult.code,
                    [],
                ),
            );
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: {},
            message:
                revokeResult.message || 'Talent invitation revoked successfully',
            status: 200,
        });
    },
);

