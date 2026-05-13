import { NextFunction, Request, RequestHandler, Response } from 'express';
import asyncHandler from '../middlewares/async.mdw';
import ErrorResponse from '../utils/error.util';
import invitationService from '@/services/invitation.service';
import { InvitationStatus } from '../interfaces/invitation.interface';
import redisWrapper from '../middlewares/redis.mdw';
import { UserType } from '@/interfaces/user.interface';

const INVITATION_CACHE_TTL_DETAIL = 300;
const INVITATION_CACHE_TTL_LIST = 180;

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

function requireAdminAccess(
    req: Request,
    next: NextFunction,
): boolean | undefined {
    if (!isAdminOrSuperAdmin(req)) {
        next(
            new ErrorResponse(
                'Only admin and super admin can access invitations',
                403,
                [],
            ),
        );
        return false;
    }
    return true;
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export const getInvitationById: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (requireAdminAccess(req, next) === false) return;
        const invitationId = String(req.params.invitationId || '').trim();
        if (!invitationId) {
            return next(new ErrorResponse('invitationId is required', 400, []));
        }

        const cacheKey = `invitation:id:${invitationId}`;
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Invitation retrieved successfully (cached)',
                status: 200,
            });
        }

        const result = await invitationService.getInvitationById(invitationId);
        if (result.error) {
            return next(new ErrorResponse(result.message, result.code || 500, []));
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            INVITATION_CACHE_TTL_DETAIL,
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

export const getInvitationsByInviter: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (requireAdminAccess(req, next) === false) return;
        const inviterId = String(req.params.inviterId || '').trim();
        if (!inviterId) {
            return next(new ErrorResponse('inviterId is required', 400, []));
        }

        const cacheKey = `invitation:list:inviter:${inviterId}`;
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Invitations retrieved successfully (cached)',
                status: 200,
            });
        }

        const result = await invitationService.getInvitationsByInviter(inviterId);
        if (result.error) {
            return next(new ErrorResponse(result.message, result.code || 500, []));
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            INVITATION_CACHE_TTL_LIST,
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

export const getInvitationsByInviteeEmail: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (requireAdminAccess(req, next) === false) return;
        const email = String(req.query.email || '').trim();
        if (!email) {
            return next(new ErrorResponse('query email is required', 400, []));
        }
        const normalizedEmail = normalizeEmail(email);

        const cacheKey = `invitation:list:invitee:${normalizedEmail}`;
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Invitations retrieved successfully (cached)',
                status: 200,
            });
        }

        const result = await invitationService.getInvitationsByInvitee(
            normalizedEmail,
        );
        if (result.error) {
            return next(new ErrorResponse(result.message, result.code || 500, []));
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            INVITATION_CACHE_TTL_LIST,
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

export const getInvitationsByResource: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (requireAdminAccess(req, next) === false) return;
        const resourceId = String(req.params.resourceId || '').trim();
        if (!resourceId) {
            return next(new ErrorResponse('resourceId is required', 400, []));
        }
        const statusQuery = String(req.query.status || '').trim();
        const status =
            statusQuery && Object.values(InvitationStatus).includes(statusQuery as any)
                ? (statusQuery as InvitationStatus)
                : undefined;

        const cacheKey = `invitation:list:resource:${resourceId}:${status || 'all'}`;
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Invitations retrieved successfully (cached)',
                status: 200,
            });
        }

        const result = await invitationService.getInvitationsByResource(
            resourceId,
            status,
        );
        if (result.error) {
            return next(new ErrorResponse(result.message, result.code || 500, []));
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            INVITATION_CACHE_TTL_LIST,
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
