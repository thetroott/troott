import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import listenerService from './listener.service';
import listenerRepository from './listener.repository';
import {
    UpdateListenerDTO,
    InviteListenerDTO,
    AcceptListenerInvitationDTO,
    SetListenerPasswordDTO,
} from './listener.dto';
import { InvitationType } from '../../platform/Invitation/invitation.interface';
import { InviteTokenDTO } from '../../platform/Invitation/invitation.dto';
import invitationService from '../../platform/Invitation/invitation.service';
import emailService from '../../notifications/email/email.service';
import { EMAIL_CONFIG } from '../../../configs/email.config';
import userRepository from '../user/user.repository';
import userService from '../user/user.service';
import { statusCodeForUserServiceError } from '../user/user.http-error.util';
import authService from '../../authentication/auth/auth.service';
import redisWrapper from '../../../middlewares/redis.mdw';
import { PasswordType, UserType, IUserDoc } from '../user/user.interface';

/**
 * @name inviteListener
 * @route POST /listener/invite
 * @access Private
 */
export const inviteListener: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { email, resourceId }: InviteListenerDTO = req.body;

        if (!email || email.trim().length === 0)
            return next(new ErrorResponse('Email is required', 400, []));

        const mailCheck = await authService.checkEmail(email);
        if (!mailCheck) {
            return next(new ErrorResponse('Invalid email format', 400, []));
        }

        const invitationResult = await invitationService.newInvitation({
            invitedBy: userId,
            inviteeEmail: email.trim().toLowerCase(),
            inviteType: InvitationType.LISTENER,
            resourceId: resourceId || userId,
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

        const inviterResult = await userRepository.findById(userId);
        const inviter = inviterResult.data as any;

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

        const invitationUrl = `${EMAIL_CONFIG.clientUrl}/listener/invite/accept?token=${token}&email=${encodeURIComponent(email.trim().toLowerCase())}`;

        const inviteeUser = {
            email: email.trim().toLowerCase(),
            firstName: email.split('@')[0] || 'Listener',
            lastName: '',
        } as any;

        const emailResult = await emailService.sendInvitationEmail(
            inviteeUser,
            inviter?.firstName || 'A team member',
            invitationUrl,
            'Listener',
        );

        if (emailResult.error) {
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
                'Listener invitation sent successfully.',
            status: 201,
        });
    },
);

/**
 * @name acceptListenerInvitation
 * @route POST /listener/invite/accept
 * @access Public
 */
export const acceptListenerInvitation: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { token, email, password }: AcceptListenerInvitationDTO =
            req.body;

        if (!token || !email || !password) {
            return next(
                new ErrorResponse(
                    'Token, email, and password are required',
                    400,
                    [],
                ),
            );
        }

        const mailCheck = await authService.checkEmail(email);
        if (!mailCheck) {
            return next(new ErrorResponse('Invalid email format', 400, []));
        }

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

        let user: IUserDoc;
        const userExists = await userRepository.findOne({
            email: email.trim().toLowerCase(),
        });

        if (userExists.error === false && userExists.data) {
            user = userExists.data as IUserDoc;
        } else {
            try {
                user = await userService.createUser({
                    email: email.trim().toLowerCase(),
                    password,
                    passwordType: PasswordType.USERGENERATED,
                    userType: UserType.LISTENER,
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
        }

        await authService.activateAccount(user);
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
                'Listener invitation accepted successfully. Please proceed to onboarding to complete your profile.',
            status: 201,
        });
    },
);

/**
 * @name getListener
 * @route GET /listener
 * @access Private
 */
export const getListener: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const cacheKey = `listener:profile:${userId}`;
        const cacheTTL = 300;

        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Listener profile retrieved successfully (cached).',
                status: 200,
            });
        }

        const result = await listenerService.getListenerProfile(String(userId));

        if (result.error || !result.data) {
            return next(
                new ErrorResponse(
                    result.message || 'Listener profile not found',
                    result.code || 404,
                    [],
                ),
            );
        }

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
 * @name getListeners
 * @route GET /listener/list
 * @access Private
 */
export const getListeners: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            page = 1,
            limit = 25,
            sort = '-createdAt',
            select,
            populate,
            ...filters
        } = req.query;

        const cacheKey = `listeners:list:${JSON.stringify({ page, limit, sort, select, filters })}`;
        const cacheTTL = 180;

        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached.data,
                pagination: cached.pagination,
                count: cached.count,
                total: cached.total,
                message: 'Listeners retrieved successfully (cached).',
                status: 200,
            });
        }

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

        const result = await listenerRepository.getListeners(
            filters as any,
            options,
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        const pag = (result as { pagination?: { count: number; total: number } })
            .pagination;

        const responseData = {
            data: result.data,
            pagination: pag,
            count: pag?.count,
            total: pag?.total,
        };

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
 * @name updateListener
 * @route PUT /listener
 * @access Private
 */
export const updateListener: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const data: UpdateListenerDTO = req.body;

        const result = await listenerService.updateListener(String(userId), data);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        try {
            await redisWrapper.deleteData(`listener:profile:${userId}`);
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
 * @route PUT /listener/interests
 * @access Private
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

        const result = await listenerService.updateInterests(
            String(userId),
            interests as string[],
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        try {
            await redisWrapper.deleteData(`listener:profile:${userId}`);
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
 * @name setListenerPassword
 * @route POST /listener/set-password
 * @access Private
 */
export const setListenerPassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { password }: SetListenerPasswordDTO = req.body;

        if (!password) {
            return next(new ErrorResponse('Password is required', 400, []));
        }

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

        const userResult = await userRepository.findById(String(userId));
        if (userResult.error || !userResult.data) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        const user = userResult.data as IUserDoc;

        if (user.userType !== UserType.LISTENER) {
            return next(
                new ErrorResponse(
                    'This endpoint is only for listener users',
                    403,
                    [],
                ),
            );
        }

        await authService.encryptUserPassword(user, password);
        user.passwordType = PasswordType.USERGENERATED;
        await user.save();

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
 * @name revokeListenerInvitation
 * @route POST /listener/invite/revoke
 * @access Private
 */
export const revokeListenerInvitation: RequestHandler = asyncHandler(
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
                new ErrorResponse(revokeResult.message, revokeResult.code, []),
            );
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: {},
            message:
                revokeResult.message ||
                'Listener invitation revoked successfully',
            status: 200,
        });
    },
);
