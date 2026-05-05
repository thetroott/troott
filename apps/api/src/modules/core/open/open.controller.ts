import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import { pathParam } from '../../../utils/route-params.util';
import sermonRepository from '../sermon/sermon.repository';
import {
    buildSermonTeaserPayload,
    isSermonPublicTeaserEligible,
} from './sermon-teaser.util';
import logger from '../../../utils/logger.util';

/**
 * Public teaser for marketing / universal links (no auth).
 * See specs/api/deep-links.md.
 *
 * @route GET /api/v1/open/sermon/:id
 */
export const getPublicSermonTeaser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = pathParam(req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }

        const result =
            await sermonRepository.findSermonWithMinisterForTeaser(id);
        if (result.error) {
            logger.log({
                label: 'deep_link_open',
                type: 'info',
                data: {
                    surface: 'open_sermon_teaser',
                    outcome: 'repository_error',
                    code: result.code,
                },
            });
            return next(new ErrorResponse(result.message, result.code, []));
        }

        const doc = result.data as Record<string, unknown>;
        if (!isSermonPublicTeaserEligible(doc)) {
            logger.log({
                label: 'deep_link_open',
                type: 'info',
                data: { surface: 'open_sermon_teaser', outcome: 'not_public' },
            });
            return next(new ErrorResponse('Not found', 404, []));
        }

        logger.log({
            label: 'deep_link_open',
            type: 'info',
            data: { surface: 'open_sermon_teaser', outcome: 'ok' },
        });

        res.setHeader('Cache-Control', 'public, max-age=300');
        res.status(200).json({
            error: false,
            errors: [],
            message: 'Sermon teaser',
            status: 200,
            data: buildSermonTeaserPayload(doc),
        });
    },
);
