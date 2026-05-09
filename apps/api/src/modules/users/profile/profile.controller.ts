import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import profileService from './profile.service';
import type { UpdateProfilePayloadDTO } from './profile.dto';

const getUserId = (req: Request): string | undefined =>
    (req as any).user?.id ??
    (req as any).user?._id?.toString?.() ??
    (req as any).user?._id;

/**
 * @name getMyProfile
 * @description Returns the unified `ProfileDTO` for the authenticated user.
 * @route GET /profile/me
 * @access Private
 */
export const getMyProfile: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getUserId(req);
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const result = await profileService.getMyProfile(userId);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code ?? 500, []),
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

/**
 * @name updateMyProfile
 * @description Applies a partial profile update for the authenticated user.
 * @route PUT /profile/me
 * @access Private
 */
export const updateMyProfile: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getUserId(req);
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const payload = (req.body ?? {}) as UpdateProfilePayloadDTO;

        const result = await profileService.updateMyProfile(userId, payload);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code ?? 500, []),
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
