import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import ministerService from './minister.service';
import ministerRepository from './minister.repository';
import {
    UpdateMinisterDTO,
    InviteMinisterDTO,
    BulkInviteMinistersDTO,
    AcceptMinisterInvitationDTO,
    SetMinisterPasswordDTO,
    SubmitMinisterVerificationDTO,
    UpdateMinisterVerificationStatusDTO,
} from './minister.dto';
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

function isAdminOrSuperAdmin(req: Request): boolean {
    const user = (req as any).user ?? {};
    const userType = String(user?.userType ?? '').toLowerCase();
    return (
        user?.isAdmin === true ||
        user?.isSuper === true ||
        userType === UserType.ADMIN ||
        userType === UserType.SUPERADMIN
    );
}

function normalizeInviteEmail(email: string): string {
    return email.trim().toLowerCase();
}

async function invalidateInvitationCachesForEmail(
    email: string,
    resourceId: string,
    inviterId?: string,
) {
    const normalizedEmail = normalizeInviteEmail(email);
    const keys = [
        `invitation:list:invitee:${normalizedEmail}`,
        `invitation:list:resource:${resourceId}`,
    ];
    if (inviterId) {
        keys.push(`invitation:list:inviter:${inviterId}`);
    }
    for (const key of keys) {
        try {
            await redisWrapper.deleteData(key);
        } catch (e) {
            console.error('Invitation cache invalidation failed:', e);
        }
    }
}

export const inviteMinister: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));
        if (!isAdminOrSuperAdmin(req)) {
            return next(
                new ErrorResponse(
                    'Only admin and super admin can invite ministers',
                    403,
                    [],
                ),
            );
        }

        const { email, resourceId }: InviteMinisterDTO = req.body;

        if (!email || email.trim().length === 0) {
            return next(new ErrorResponse('Email is required', 400, []));
        }

        const normalizedEmail = normalizeInviteEmail(email);
        const mailCheck = await authService.checkEmail(normalizedEmail);
        if (!mailCheck) {
            return next(new ErrorResponse('Invalid email format', 400, []));
        }

        const invitationResult = await invitationService.newInvitation({
            invitedBy: userId,
            inviteeEmail: normalizedEmail,
            inviteType: InvitationType.MINISTER,
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

        const invitationUrl = `${EMAIL_CONFIG.clientUrl}/minister/invite/accept?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

        const inviteeUser = {
            email: normalizedEmail,
            firstName: normalizedEmail.split('@')[0] || 'Minister',
            lastName: '',
        } as any;

        const emailResult = await emailService.sendInvitationEmail(
            inviteeUser,
            inviter?.firstName || 'A team member',
            invitationUrl,
            'Minister',
        );

        if (emailResult.error) {
            console.error(
                'Failed to queue invitation email:',
                emailResult.message,
            );
        }

        try {
            await redisWrapper.deleteData(`minister:profile:${userId}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }
        await invalidateInvitationCachesForEmail(
            normalizedEmail,
            String(resourceId || userId),
            String(userId),
        );

        res.status(201).json({
            error: false,
            errors: [],
            data: {
                ...invitationResult.data,
                emailQueued: !emailResult.error,
            },
            message:
                invitationResult.message ||
                'Minister invitation sent successfully.',
            status: 201,
        });
    },
);

export const bulkInviteMinisters: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));
        if (!isAdminOrSuperAdmin(req)) {
            return next(
                new ErrorResponse(
                    'Only admin and super admin can invite ministers',
                    403,
                    [],
                ),
            );
        }

        const { emails, resourceId }: BulkInviteMinistersDTO = req.body;
        if (!Array.isArray(emails) || emails.length === 0) {
            return next(
                new ErrorResponse('Emails must be a non-empty array', 400, []),
            );
        }

        const inviterResult = await userRepository.findById(userId);
        const inviter = inviterResult.data as any;
        const results = {
            successful: [] as Array<{ email: string; token?: string }>,
            failed: [] as Array<{ email: string; error: string }>,
        };

        for (const rawEmail of emails) {
            const normalizedEmail = normalizeInviteEmail(String(rawEmail || ''));
            if (!normalizedEmail) {
                results.failed.push({
                    email: String(rawEmail || ''),
                    error: 'Email is required',
                });
                continue;
            }
            const mailCheck = await authService.checkEmail(normalizedEmail);
            if (!mailCheck) {
                results.failed.push({
                    email: normalizedEmail,
                    error: 'Invalid email format',
                });
                continue;
            }

            const invitationResult = await invitationService.newInvitation({
                invitedBy: userId,
                inviteeEmail: normalizedEmail,
                inviteType: InvitationType.MINISTER,
                resourceId: resourceId || userId,
            } as any);
            if (invitationResult.error) {
                results.failed.push({
                    email: normalizedEmail,
                    error: invitationResult.message,
                });
                continue;
            }

            const token = (invitationResult.data as any)?.token;
            if (!token) {
                results.failed.push({
                    email: normalizedEmail,
                    error: 'Failed to generate invitation token',
                });
                continue;
            }

            const invitationUrl = `${EMAIL_CONFIG.clientUrl}/minister/invite/accept?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
            const inviteeUser = {
                email: normalizedEmail,
                firstName: normalizedEmail.split('@')[0] || 'Minister',
                lastName: '',
            } as any;
            const emailResult = await emailService.sendInvitationEmail(
                inviteeUser,
                inviter?.firstName || 'A team member',
                invitationUrl,
                'Minister',
            );
            if (emailResult.error) {
                console.error(
                    `Failed to queue invitation email for ${normalizedEmail}:`,
                    emailResult.message,
                );
            }

            results.successful.push({ email: normalizedEmail, token });
            await invalidateInvitationCachesForEmail(
                normalizedEmail,
                String(resourceId || userId),
                String(userId),
            );
        }

        res.status(201).json({
            error: false,
            errors: [],
            data: {
                successful: results.successful,
                failed: results.failed,
                total: emails.length,
                successfulCount: results.successful.length,
                failedCount: results.failed.length,
            },
            message: `Bulk minister invitation processed. ${results.successful.length} successful, ${results.failed.length} failed.`,
            status: 201,
        });
    },
);

export const resendMinisterInvite: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));
        if (!isAdminOrSuperAdmin(req)) {
            return next(
                new ErrorResponse(
                    'Only admin and super admin can resend minister invites',
                    403,
                    [],
                ),
            );
        }

        const { token, email }: InviteTokenDTO = req.body;
        if (!token || !email) {
            return next(
                new ErrorResponse('Token and email are required', 400, []),
            );
        }

        const normalizedEmail = normalizeInviteEmail(email);
        const resendResult = await invitationService.resendInvite({
            token,
            email: normalizedEmail,
        });
        if (resendResult.error) {
            return next(
                new ErrorResponse(resendResult.message, resendResult.code, []),
            );
        }

        const inviterResult = await userRepository.findById(userId);
        const inviter = inviterResult.data as any;
        const newToken = (resendResult.data as any)?.newToken;
        if (!newToken) {
            return next(
                new ErrorResponse(
                    'Failed to generate new invitation token',
                    500,
                    [],
                ),
            );
        }

        const invitationUrl = `${EMAIL_CONFIG.clientUrl}/minister/invite/accept?token=${newToken}&email=${encodeURIComponent(normalizedEmail)}`;
        const inviteeUser = {
            email: normalizedEmail,
            firstName: normalizedEmail.split('@')[0] || 'Minister',
            lastName: '',
        } as any;
        const emailResult = await emailService.sendInvitationEmail(
            inviteeUser,
            inviter?.firstName || 'A team member',
            invitationUrl,
            'Minister',
        );
        if (emailResult.error) {
            console.error(
                'Failed to queue invitation email:',
                emailResult.message,
            );
        }

        await invalidateInvitationCachesForEmail(
            normalizedEmail,
            String(userId),
            String(userId),
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: {
                ...resendResult.data,
                emailQueued: !emailResult.error,
            },
            message:
                resendResult.message ||
                'Minister invitation resent successfully.',
            status: 200,
        });
    },
);

export const acceptMinisterInvitation: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { token, email, password }: AcceptMinisterInvitationDTO =
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
                    userType: UserType.MINISTER,
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
        await invalidateInvitationCachesForEmail(
            normalizeInviteEmail(email),
            String(invitedBy || ''),
            String(invitedBy || ''),
        );

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
                'Minister invitation accepted successfully. Please proceed to onboarding to complete your profile.',
            status: 201,
        });
    },
);

export const getMinister: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const cacheKey = `minister:profile:${userId}`;
        const cacheTTL = 300;

        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Minister profile retrieved successfully (cached).',
                status: 200,
            });
        }

        const result = await ministerService.getMinisterProfile(String(userId));

        if (result.error || !result.data) {
            return next(
                new ErrorResponse(
                    result.message || 'Minister profile not found',
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

export const getMinisters: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            page = 1,
            limit = 25,
            sort = '-createdAt',
            select,
            populate,
            ...filters
        } = req.query;

        const cacheKey = `ministers:list:${JSON.stringify({ page, limit, sort, select, filters })}`;
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
                message: 'Ministers retrieved successfully (cached).',
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

        const result = await ministerRepository.getMinisters(
            filters as any,
            options,
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        const pag = (
            result as { pagination?: { count: number; total: number } }
        ).pagination;

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

export const updateMinister: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const data: UpdateMinisterDTO = req.body;

        const result = await ministerService.updateMinister(
            String(userId),
            data,
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        try {
            await redisWrapper.deleteData(`minister:profile:${userId}`);
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

export const setMinisterPassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { password }: SetMinisterPasswordDTO = req.body;

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

        if (user.userType !== UserType.MINISTER) {
            return next(
                new ErrorResponse(
                    'This endpoint is only for minister users',
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

export const revokeMinisterInvitation: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));
        if (!isAdminOrSuperAdmin(req)) {
            return next(
                new ErrorResponse(
                    'Only admin and super admin can revoke minister invites',
                    403,
                    [],
                ),
            );
        }
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

        await invalidateInvitationCachesForEmail(
            normalizeInviteEmail(email),
            String(userId),
            String(userId),
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: {},
            message:
                revokeResult.message ||
                'Minister invitation revoked successfully',
            status: 200,
        });
    },
);

export const submitMinisterVerification: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { documents }: SubmitMinisterVerificationDTO = req.body;
        if (!documents || !Array.isArray(documents) || !documents.length) {
            return next(
                new ErrorResponse(
                    'documents must be a non-empty string array',
                    400,
                    [],
                ),
            );
        }

        const result = await ministerService.submitVerification(
            String(userId),
            documents,
        );
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        try {
            await redisWrapper.deleteData(`minister:profile:${userId}`);
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

export const updateMinisterVerificationStatus: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { ministerId, status }: UpdateMinisterVerificationStatusDTO =
            req.body;
        if (!ministerId) {
            return next(new ErrorResponse('ministerId is required', 400, []));
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

        const result = await ministerService.updateVerificationStatus(
            ministerId,
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
