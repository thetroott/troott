import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middlewares/async.mdw';
import ErrorResponse from '../utils/error.util';
import { pathParam } from '../utils/route-params.util';
import sermonRepository from '@/repository/core/sermon.repository';
import { buildSermonTeaserPayload } from '@/utils/sermon-teaser.util';

/**
 * @route GET /api/v1/open/sermon/:id
 * @access Public (rate-limited via `openSermonTeaserLimiter` on the mount)
 */
export const getPublicSermonTeaser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = pathParam(req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }

        const sermon = await sermonRepository.findBySermonId(id);
        if (sermon.error) {
            return next(new ErrorResponse(sermon.message, sermon.code!, []));
        }

        const doc = sermon.data as Record<string, unknown>;

        res.setHeader('Cache-Control', 'private, no-store');
        res.status(200).json({
            error: false,
            errors: [],
            data: buildSermonTeaserPayload(doc),
            message: 'Sermon teaser fetched successfully',
            status: 200,
        });
    },
);
