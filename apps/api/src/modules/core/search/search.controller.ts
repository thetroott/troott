import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import searchService, { SearchScope } from './search.service';

function parseScope(raw: unknown): SearchScope {
    const s = typeof raw === 'string' ? raw.toLowerCase() : 'all';
    if (s === 'sermon' || s === 'minister' || s === 'all') {
        return s;
    }
    return 'all';
}

/**
 * @route GET /api/v1/search?q=&scope=sermon|minister|all&limit=&skip=
 * @access Private (signed-in catalogue; aligns with mobile-flow no-guest bar)
 */
export const searchCatalog = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const q =
            typeof req.query.q === 'string'
                ? req.query.q
                : Array.isArray(req.query.q)
                  ? String(req.query.q[0])
                  : '';
        if (!q.trim()) {
            return next(
                new ErrorResponse('Query parameter q is required', 400, []),
            );
        }

        const scope = parseScope(req.query.scope);
        const limit = Number(req.query.limit) || 25;
        const skip = Number(req.query.skip) || 0;

        const { sermons, ministers, errors } = await searchService.search(
            q,
            scope,
            { limit, skip },
        );

        res.status(200).json({
            error: false,
            errors,
            message: 'Search completed',
            status: 200,
            data: {
                scope,
                sermons: sermons ?? [],
                ministers: ministers ?? [],
            },
        });
    },
);
