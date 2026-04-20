import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import creatorService from './creator.service';
import creatorRepository from './creator.repository';
import {
    CreateCreatorDTO,
    UpdateCreatorDTO,
    InviteCreatorDTO,
    AcceptCreatorInvitationDTO,
    SetCreatorPasswordDTO,
    SubmitCreatorVerificationDTO,
    UpdateCreatorVerificationStatusDTO,
} from './creator.dto';
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
import { VerificationStatus } from '../../../utils/enums.util';

export const inviteCreator: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { email, resourceId }: InviteCreatorDTO = req.body;

        if (!email || email.trim().length === 0) {
            return next(new ErrorResponse('Email is required', 400, []));
        }

        const mailCheck = await authService.checkEmail(email);
        if (!mailCheck) {
            return next(new ErrorResponse('Invalid email format', 400, []));
        }

        const invitationResult = await invitationService.newInvitation({
            invitedBy: userId,
            inviteeEmail: email.trim().toLowerCase(),
            inviteType: InvitationType.CREATOR,
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

        const invitationUrl = `${EMAIL_CONFIG.clientUrl}/creator/invite/accept?token=${token}&email=${encodeURIComponent(email.trim().toLowerCase())}`;

        const inviteeUser = {
            email: email.trim().toLowerCase(),
            firstName: email.split('@')[0] || 'Creator',
            lastName: '',
        } as any;

        const emailResult = await emailService.sendInvitationEmail(
            inviteeUser,
            inviter?.firstName || 'A team member',
            invitationUrl,
            'Creator',
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
                'Creator invitation sent successfully.',
            status: 201,
        });
    },
);

export const createCreator: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const userResult = await userRepository.findById(String(userId));
        if (userResult.error || !userResult.data) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        const data: CreateCreatorDTO = {
            ...req.body,
            user: userResult.data,
            createdBy: String(userId),
        };

        const result = await creatorService.createCreator(data);
        if (result.error) {
            return next(new ErrorResponse(result.message, result.code || 500, []));
        }

        res.status(201).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 201,
        });
    },
);

export const acceptCreatorInvitation: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { token, email, password }: AcceptCreatorInvitationDTO =
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
                    userType: UserType.CREATOR,
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
                'Creator invitation accepted successfully. Please complete your profile.',
            status: 201,
        });
    },
);

export const getCreator: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id: idParam } = req.params;
        const id = String(Array.isArray(idParam) ? idParam[0] : idParam);
        if (!id) {
            return next(new ErrorResponse('Creator id is required', 400, []));
        }

        const cacheKey = `creator:${id}`;
        const cacheTTL = 300;
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Creator retrieved successfully (cached).',
                status: 200,
            });
        }

        const result = await creatorService.getCreator(id);
        if (result.error || !result.data) {
            return next(
                new ErrorResponse(
                    result.message || 'Creator not found',
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
            message: result.message || 'OK',
            status: 200,
        });
    },
);

export const getCreators: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            page = 1,
            limit = 25,
            sort = '-createdAt',
            select,
            populate,
            ...filters
        } = req.query;

        const cacheKey = `creators:list:${JSON.stringify({ page, limit, sort, select, filters })}`;
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
                message: 'Creators retrieved successfully (cached).',
                status: 200,
            });
        }

        const options: {
            page: number;
            limit: number;
            sort: string;
            select?: string;
            populate?: string;
        } = {
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

        const result = await creatorRepository.getCreators(
            filters as any,
            options as any,
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

export const getCreatorProfile: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const cacheKey = `creator:profile:${userId}`;
        const cacheTTL = 300;

        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Creator profile retrieved successfully (cached).',
                status: 200,
            });
        }

        const result = await creatorService.getCreatorProfile(String(userId));
        if (result.error || !result.data) {
            return next(
                new ErrorResponse(
                    result.message || 'Creator profile not found',
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

export const updateCreator: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const data: UpdateCreatorDTO = req.body;
        const result = await creatorService.updateCreator(String(userId), data);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        try {
            await redisWrapper.deleteData(`creator:profile:${userId}`);
            const doc = result.data as { _id?: { toString: () => string } };
            if (doc?._id) {
                await redisWrapper.deleteData(`creator:${String(doc._id)}`);
            }
        } catch (e) {
            console.error('Cache invalidation failed:', e);
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

export const setCreatorPassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { password }: SetCreatorPasswordDTO = req.body;

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

        if (user.userType !== UserType.CREATOR) {
            return next(
                new ErrorResponse(
                    'This endpoint is only for creator users',
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
            data: { message: 'Password set successfully' },
            message: 'Password set successfully. Please proceed to onboarding.',
            status: 200,
        });
    },
);

export const revokeCreatorInvitation: RequestHandler = asyncHandler(
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
                'Creator invitation revoked successfully',
            status: 200,
        });
    },
);

export const submitCreatorVerification: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { documents }: SubmitCreatorVerificationDTO = req.body;
        if (!documents || !Array.isArray(documents) || !documents.length) {
            return next(
                new ErrorResponse(
                    'documents must be a non-empty string array',
                    400,
                    [],
                ),
            );
        }

        const result = await creatorService.submitVerification(
            String(userId),
            documents,
        );
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        try {
            await redisWrapper.deleteData(`creator:profile:${userId}`);
        } catch (e) {
            console.error('Cache invalidation failed:', e);
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

export const updateCreatorVerificationStatus: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { creatorId, status }: UpdateCreatorVerificationStatusDTO =
            req.body;
        if (!creatorId) {
            return next(new ErrorResponse('creatorId is required', 400, []));
        }
        if (
            !status ||
            !Object.values(VerificationStatus).includes(
                status as VerificationStatus,
            )
        ) {
            return next(
                new ErrorResponse('Invalid verification status', 400, []),
            );
        }

        const result = await creatorService.updateVerificationStatus(
            creatorId,
            status,
        );
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
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
