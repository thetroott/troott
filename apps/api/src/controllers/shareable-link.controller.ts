import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middlewares/async.mdw';
import ErrorResponse from '../utils/error.util';
import shareableLinkService from '@/services/shareable-link.service';
import logger from '../utils/logger.util';

/**
 * Public resolve for deep links (may return null `resource` if type unsupported).
 *
 * Query: `token` (required), optional `resourceId` for legacy links without `tokenLookupHash`.
 *
 * Mobile deep link example: `troott://share/open?token=<rawToken>&resourceId=<mongoId>` —
 * `resourceId` can be omitted for links created after token lookup hashing was added.
 *
 * @route GET /api/v1/share/resolve
 */
export const resolveShareLink = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const token =
            typeof req.query.token === 'string'
                ? req.query.token
                : Array.isArray(req.query.token)
                  ? String(req.query.token[0])
                  : '';
        const rawResourceId =
            typeof req.query.resourceId === 'string'
                ? req.query.resourceId
                : Array.isArray(req.query.resourceId)
                  ? String(req.query.resourceId[0])
                  : '';
        const resourceId = rawResourceId.trim() || undefined;

        const result = await shareableLinkService.resolveForHttp(
            token,
            resourceId,
        );

        if (result.error) {
            logger.log({
                label: 'deep_link_open',
                type: 'info',
                data: {
                    surface: 'share_resolve',
                    outcome: 'error',
                    code: result.code,
                },
            });
            return next(new ErrorResponse(result.message, result.code, []));
        }

        logger.log({
            label: 'deep_link_open',
            type: 'info',
            data: { surface: 'share_resolve', outcome: 'ok' },
        });

        res.status(200).json({
            error: false,
            errors: [],
            message: result.message,
            status: 200,
            data: result.data,
        });
    },
);
