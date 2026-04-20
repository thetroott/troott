import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import authMapper from '../../authentication/auth/auth.mapper';
import userService from './user.service';
import userRepository from './user.repository';
import { IUserDoc, PasswordType, UserType } from './user.interface';
import redisWrapper from '../../../middlewares/redis.mdw';
import { generatePassword } from '../../../utils/helpers.util';
import emailService from '../../notifications/email/email.service';
import { statusCodeForUserServiceError } from './user.http-error.util';
/** Get authenticated user id from request (supports both id and _id from lean() documents) */
const getUserId = (req: Request): string | undefined =>
    (req as any).user?.id ??
    (req as any).user?._id?.toString?.() ??
    (req as any).user?._id;

/**
 * @name getUser
 * @description Retrieves user information excluding email, password, and permission settings
 * @route GET /user
 * @access  Private
 */
export const getUser: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getUserId(req);
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const cacheKey = `user:profile:${userId}`;
        const cacheTTL = 300; // 5 minutes for user profile data

        // Check cache first
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'User information retrieved successfully (cached).',
                status: 200,
            });
        }

        // Find the user by ID using repository
        const userResult = await userRepository.findById(String(userId), false);
        if (userResult.error || !userResult.data) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        const user = userResult.data as IUserDoc;

        // Map the user information to include only the specified fields
        const userInfo = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            phoneCode: user.phoneCode || '',
            activated: user.isActivated || false,
        };

        // Cache the result
        await redisWrapper.keepData(
            { key: cacheKey, value: userInfo },
            cacheTTL,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: userInfo,
            message: 'User information retrieved successfully.',
            status: 200,
        });
    },
);

/**
 * @name getUsers
 * @description Retrieves a paginated list of users with filtering and sorting
 * @route GET /users
 * @access  Private (Admin only - should add admin check)
 */
export const getUsers: RequestHandler = asyncHandler(
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
        const cacheKey = `users:list:${JSON.stringify({ page, limit, sort, select, filters })}`;
        const cacheTTL = 180; // 3 minutes for user lists (shorter than individual profiles)

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
                message: 'Users retrieved successfully (cached).',
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

        // Get users from repository
        const result = await userRepository.getUsers(filters as any, options);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        const pag = (
            result as { pagination?: { count?: number; total?: number } }
        ).pagination;

        // Prepare response data
        const responseData = {
            data: result.data,
            pagination: pag,
            count: pag?.count,
            total: pag?.total,
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
            pagination: pag,
            count: pag?.count,
            total: pag?.total,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name deactivateAccount
 * @description Deactivates the user account
 * @route DELETE /user/deactivate
 * @access  Private
 */
export const deactivateAccount: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getUserId(req);
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        // Find the user by ID using repository
        const userResult = await userRepository.findById(String(userId), false);
        if (userResult.error || !userResult.data) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        // Deactivate the user account using repository
        const updateResult = await userRepository.updateUser(String(userId), {
            isDeactivated: true,
        } as Partial<IUserDoc>);

        if (updateResult.error) {
            return next(
                new ErrorResponse(
                    updateResult.message,
                    updateResult.code || 500,
                    [],
                ),
            );
        }

        // Invalidate cache for this user
        try {
            await redisWrapper.deleteData(`user:profile:${userId}`);
            // Also invalidate any list caches that might include this user
            // Note: In production, you might want to use pattern matching or maintain a cache key registry
        } catch (cacheError) {
            // Silently fail cache invalidation - don't break the request
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'User account deactivated successfully.',
            status: 200,
        });
    },
);

// [MIGRATION-REVIEW] Handlers merged from flat controllers/user.controller.ts

export const InviteUser: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { firstName, lastName, email, userType } = req.body;
        const invitedBy = (req as any).user.id;

        const userExist = await userRepository.findOne({
            email: email.toLowerCase(),
        });
        if (!userExist.error && userExist.data) {
            return next(new ErrorResponse('Email already exists', 400, []));
        }

        const temporaryPassword = generatePassword(20);

        let user: IUserDoc;
        try {
            user = await userService.createUser({
                email,
                password: temporaryPassword,
                passwordType: PasswordType.SYSTEMGENERATED,
                userType: userType as UserType,
                createdBy: invitedBy,
            });
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to create user';
            return next(
                new ErrorResponse(
                    message,
                    statusCodeForUserServiceError(message),
                    [],
                ),
            );
        }

        if (!user) {
            return next(new ErrorResponse('Failed to create user', 404, []));
        }

        const sendInvite = await emailService.sendUserWelcomeEmail(user);
        if (sendInvite.error) {
            return next(
                new ErrorResponse(sendInvite.message, sendInvite.code!, []),
            );
        }

        res.status(201).json({
            error: false,
            errors: [],
            data: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                userType: user.userType,
            },
            message: 'Invitation sent successfully',
            status: 201,
        });
    },
);

export const editUser: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getUserId(req);
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const data = req.body;
        const result = await userService.updateUserProfile(userId, data);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 400, []),
            );
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: 'User information updated successfully.',
            status: 200,
        });
    },
);

// create user
// get all user account
// get user account by id
// update user account
// deactivate user account
// suspend user account
// delete user account
// get user preferences
// update user preferences
// create user preferences

// follow a user
// unfollow a user

// switch user profile
// update user roles & permissions.
// update user account details
// update user account status
