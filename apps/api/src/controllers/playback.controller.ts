import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middlewares/async.mdw';
import ErrorResponse from '../utils/error.util';
import { getAuthUserId } from '../utils/auth-request.util';
import { pathParam } from '../utils/route-params.util';
import playbackRepository from '@/repository/playback.repository';

/**
 * @route POST /api/v1/playback
 * @body { sermonId, positionSeconds, durationSeconds? }
 */
export const savePlaybackProgress = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getAuthUserId(req);
        if (!userId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const { sermonId, positionSeconds, durationSeconds } = req.body as {
            sermonId?: string;
            positionSeconds?: number;
            durationSeconds?: number;
        };

        if (!sermonId || typeof positionSeconds !== 'number') {
            return next(
                new ErrorResponse(
                    'sermonId and positionSeconds are required',
                    400,
                    [],
                ),
            );
        }

        const result = await playbackRepository.upsertProgress(
            userId,
            sermonId,
            Math.max(0, positionSeconds),
            durationSeconds,
        );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: result.message,
            status: 200,
            data: result.data,
        });
    },
);

/** @route GET /api/v1/playback */
export const listPlaybackProgress = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getAuthUserId(req);
        if (!userId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const limit = Number(req.query.limit) || 20;
        const result = await playbackRepository.listForUser(userId, limit);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: result.message,
            status: 200,
            data: result.data,
        });
    },
);

/** @route GET /api/v1/playback/sermon/:sermonId */
export const getPlaybackForSermon = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getAuthUserId(req);
        if (!userId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const sermonId = pathParam(req.params.sermonId);
        if (!sermonId) {
            return next(new ErrorResponse('sermonId is required', 400, []));
        }

        const result = await playbackRepository.getForUserAndSermon(
            userId,
            sermonId,
        );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: result.message,
            status: 200,
            data: result.data,
        });
    },
);
