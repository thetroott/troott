import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import customResults from '../../../middlewares/customResult.mdw';
import ErrorResponse from '../../../utils/error.util';
import Sermon from '../sermon/sermon.model';
import Minister from '../../users/minister/minister.model';
import { ICustomResponse } from '../../shared/interfaces.util';

type SearchScope = 'sermon' | 'minister' | 'all';

function parseScope(raw: unknown): SearchScope {
    const s = typeof raw === 'string' ? raw.toLowerCase() : 'all';
    if (s === 'sermon' || s === 'minister' || s === 'all') {
        return s;
    }
    return 'all';
}

/**
 * @route GET /api/v1/search?q=&scope=sermon|minister|all&limit=&skip=
 * @access Public (catalogue only; no user context required)
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
        const page = Math.floor(skip / limit) + 1;
        const perScopeLimit = scope === 'all' ? Math.ceil(limit / 2) : limit;
        const regex = { $regex: q, $options: 'i' };

        const runCustomSearch = async <T>(
            middleware: (
                req: Request,
                res: ICustomResponse<T>,
                next: NextFunction,
            ) => Promise<void> | void,
            query: Record<string, unknown>,
        ): Promise<T[]> => {
            const customReq = { query } as unknown as Request;
            const customRes = {} as ICustomResponse<T>;

            await new Promise<void>((resolve, reject) => {
                middleware(customReq, customRes, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });

            return customRes.customResults?.data ?? [];
        };

        let sermons: unknown[] = [];
        let ministers: unknown[] = [];
        const errors: string[] = [];

        if (scope === 'sermon' || scope === 'all') {
            try {
                sermons = await runCustomSearch(
                    customResults(Sermon as any, 'minister series category'),
                    {
                        page: String(page),
                        limit: String(perScopeLimit),
                        $or: [
                            { title: regex },
                            { description: regex },
                            { topic: regex },
                            { tags: regex },
                        ],
                    },
                );
            } catch (_error) {
                errors.push('sermon search failed');
            }
        }

        if (scope === 'minister' || scope === 'all') {
            try {
                ministers = await runCustomSearch(
                    customResults(Minister as any),
                    {
                        page: String(page),
                        limit: String(perScopeLimit),
                        $or: [
                            { firstName: regex },
                            { lastName: regex },
                            { ministerialName: regex },
                            { ministryName: regex },
                            { email: regex },
                        ],
                    },
                );
            } catch (_error) {
                errors.push('minister search failed');
            }
        }

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
