import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import businessService from './business.service';
import businessRepository from './business.repository';
import { IBusinessDoc } from './business.interface';
import {
    UpdateBusinessDTO,
    InviteBusinessDTO,
    AcceptBusinessInvitationDTO,
    SetBusinessPasswordDTO,
} from './business.dto';
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
 * @name getBusiness
 * @description Retrieves business profile information
 * @route GET /business
 * @access  Private
 */
export const getBusiness: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const cacheKey = `business:profile:${userId}`;
        const cacheTTL = 300; // 5 minutes for business profile data

        // Check cache first
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message:
                    'Business profile retrieved successfully (cached).',
                status: 200,
            });
        }

        // Get business profile from service
        const result = await businessService.getBusinessProfile(
            String(userId),
        );

        if (result.error || !result.data) {
            return next(
                new ErrorResponse(
                    result.message || 'Business profile not found',
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
            message:
                result.message ||
                'Business profile retrieved successfully.',
            status: 200,
        });
    },
);

/**
 * @name getBusinesses
 * @description Retrieves a paginated list of businesses with filtering and sorting
 * @route GET /businesses
 * @access  Private (Admin only - should add admin check)
 */
export const getBusinesses: RequestHandler = asyncHandler(
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
        const cacheKey = `businesses:list:${JSON.stringify({ page, limit, sort, select, filters })}`;
        const cacheTTL = 180; // 3 minutes for business lists

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
                message: 'Businesses retrieved successfully (cached).',
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

        // Get businesses from repository
        const result = await businessRepository.getBusinesses(
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
            count: result.pagination?.count,
            total: result.pagination?.total,
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
            count: result.pagination?.count,
            total: result.pagination?.total,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name updateBusiness
 * @description Updates business profile information
 * @route PUT /business
 * @access  Private
 */
export const updateBusiness: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const data: UpdateBusinessDTO = req.body;

        const result = await businessService.updateProfile(
            String(userId),
            data,
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`business:profile:${userId}`);
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
 * @name updateTags
 * @description Updates business tags
 * @route PUT /business/tags
 * @access  Private
 */
export const updateTags: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { tags } = req.body;

        if (!tags || !Array.isArray(tags)) {
            return next(new ErrorResponse('Tags must be an array', 400, []));
        }

        const result = await businessService.updateTags(
            String(userId),
            tags,
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`business:profile:${userId}`);
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
 * @name addTag
 * @description Adds a tag to business profile
 * @route POST /business/tags
 * @access  Private
 */
export const addTag: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { tag } = req.body;

        if (!tag || typeof tag !== 'string') {
            return next(new ErrorResponse('Tag must be a string', 400, []));
        }

        const result = await businessService.addTag(String(userId), tag);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`business:profile:${userId}`);
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
 * @name removeTag
 * @description Removes a tag from business profile
 * @route DELETE /business/tags/:tag
 * @access  Private
 */
export const removeTag: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { tag } = req.params;

        if (!tag) {
            return next(new ErrorResponse('Tag is required', 400, []));
        }

        const result = await businessService.removeTag(String(userId), tag);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`business:profile:${userId}`);
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
 * @name inviteBusiness
 * @description Invites a business to the system
 * @route POST /business/invite
 * @access  Private (Admin only)
 */
export const inviteBusiness: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { email, resourceId }: InviteBusinessDTO = req.body;

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
            inviteType: InvitationType.BUSINESS,
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
        const invitationUrl = `${EMAIL_CONFIG.clientUrl}/business/invite/accept?token=${token}&email=${encodeURIComponent(email.trim().toLowerCase())}`;

        // Create a minimal user object for the invitee (they might not be a user yet)
        const inviteeUser = {
            email: email.trim().toLowerCase(),
            firstName: email.split('@')[0] || 'Business', // Use email prefix as fallback
            lastName: '',
        } as any;

        // Send invitation email
        const emailResult = await emailService.sendInvitationEmail(
            inviteeUser,
            inviter?.firstName || 'A team member',
            invitationUrl,
            'Business',
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
                'Business invitation sent successfully.',
            status: 201,
        });
    },
);

/**
 * @name acceptBusinessInvitation
 * @description Accepts a business invitation and creates user account and profile
 * @route POST /business/invite/accept
 * @access Public
 */
export const acceptBusinessInvitation: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            token,
            email,
            password,
        }: AcceptBusinessInvitationDTO = req.body;

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
                    userType: UserType.BUSINESS,
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

        // Business profile will be created during onboarding step 3
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
                'Business invitation accepted successfully. Please proceed to onboarding to complete your profile.',
            status: 201,
        });
    },
);

/**
 * @name setBusinessPassword
 * @description Sets password for an invited business user
 * @route POST /business/set-password
 * @access Private (for invited users who haven't set password yet)
 */
export const setBusinessPassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { password }: SetBusinessPasswordDTO = req.body;

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

        // Check if user is a business
        if (user.userType !== UserType.BUSINESS) {
            return next(
                new ErrorResponse('This endpoint is only for business users', 403, []),
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
 * @name revokeBusinessInvitation
 * @description Revokes a business invitation
 * @route POST /business/invite/revoke
 * @access Private
 */
export const revokeBusinessInvitation: RequestHandler = asyncHandler(
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
                revokeResult.message ||
                'Business invitation revoked successfully',
            status: 200,
        });
    },
);
