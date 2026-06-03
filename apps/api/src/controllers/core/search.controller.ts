import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../middlewares/async.mdw';
import ErrorResponse from '../../utils/error.util';
import searchService from '@/services/core/search.service';
import ministerRepository from '@/repository/core/minister.repository';
import { SearchScope, SearchQueryOptions } from '@/dtos/core/search.dto';

function parseScope(raw: unknown): SearchScope {
    const s = typeof raw === 'string' ? raw.toLowerCase() : 'all';
    const valid: SearchScope[] = [
        'all',
        'sermon',
        'series',
        'minister',
        'playlist',
        'topic',
    ];
    return valid.includes(s as SearchScope) ? (s as SearchScope) : 'all';
}

function buildOptions(query: Record<string, any>): SearchQueryOptions {
    return {
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 25,
        sort: query.sort,
        order: query.order === 'desc' ? 'desc' : 'asc',
        from: query.from,
        to: query.to,
    };
}

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
        const options = buildOptions(req.query);

        const result = await searchService.search(q, scope, options);

        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

export const searchSermons = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const q = (req.query.q as string) || '';
        if (!q.trim()) {
            return next(
                new ErrorResponse('Query parameter q is required', 400, []),
            );
        }
        const options = buildOptions(req.query);
        const result = await searchService.searchSermons(q, options);
        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

export const searchMinisters = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const q = (req.query.q as string) || '';
        const options = buildOptions(req.query);
        const result = q.trim()
            ? await searchService.searchMinisters(q, options)
            : await searchService.listActiveMinistersForOnboarding(options);
        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

export const searchSeries = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const q = (req.query.q as string) || '';
        if (!q.trim()) {
            return next(
                new ErrorResponse('Query parameter q is required', 400, []),
            );
        }
        const options = buildOptions(req.query);
        const result = await searchService.searchSeries(q, options);
        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

export const searchPlaylists = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const q = (req.query.q as string) || '';
        if (!q.trim()) {
            return next(
                new ErrorResponse('Query parameter q is required', 400, []),
            );
        }
        const options = buildOptions(req.query);
        const result = await searchService.searchPlaylists(q, options);
        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

export const searchTopics = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const q = (req.query.q as string) || '';
        const options = buildOptions(req.query);
        const result = q.trim()
            ? await searchService.searchTopics(q, options)
            : await searchService.listActiveInterestTopics(options);
        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

export const searchWithinMinister = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const ministerParam = String(req.params.ministerId ?? '').trim();
        if (!ministerParam) {
            return next(new ErrorResponse('ministerId is required', 400, []));
        }
        const ministerId =
            await ministerRepository.resolveMinisterMongoId(ministerParam);
        if (!ministerId) {
            return next(new ErrorResponse('Minister not found', 404, []));
        }
        const q = (req.query.q as string) || '';
        if (!q.trim()) {
            return next(
                new ErrorResponse('Query parameter q is required', 400, []),
            );
        }
        const options = buildOptions(req.query);
        const result = await searchService.searchWithinMinister(
            ministerId,
            q,
            options,
        );
        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

export const searchWithinSeries = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const seriesId = (Array.isArray(req.params.seriesId) ? req.params.seriesId[0] : req.params.seriesId);
        const q = (req.query.q as string) || '';
        if (!seriesId) {
            return next(
                new ErrorResponse('seriesId is required', 400, []),
            );
        }
        if (!q.trim()) {
            return next(
                new ErrorResponse('Query parameter q is required', 400, []),
            );
        }
        const options = buildOptions(req.query);
        const result = await searchService.searchWithinSeries(
            seriesId,
            q,
            options,
        );
        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

export const autocomplete = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const q = (req.query.q as string) || '';
        const result = await searchService.autocomplete(q);
        res.status(result.code).json({
            error: result.error,
            message: 'Autocomplete results',
            status: result.code,
            data: result.data,
        });
    },
);

export const getTrending = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const limit = Number(req.query.limit) || 10;
        const result = await searchService.getTrending(limit);
        res.status(result.code).json({
            error: result.error,
            message: 'Trending searches',
            status: result.code,
            data: result.data,
        });
    },
);

export const getPopular = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const limit = Number(req.query.limit) || 10;
        const result = await searchService.getPopular(limit);
        res.status(result.code).json({
            error: result.error,
            message: 'Popular searches',
            status: result.code,
            data: result.data,
        });
    },
);

export const getRecentSearches = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const listenerId = (req as any).user?.listenerId || (req as any).user?.listener;
        if (!listenerId) {
            return res.status(401).json({
                error: true,
                message: 'Listener context required',
                status: 401,
                data: [],
            });
        }
        const limit = Number(req.query.limit) || 20;
        const result = await searchService.getRecentSearches(listenerId, limit);
        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

export const saveRecentSearch = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const listenerId = (req as any).user?.listenerId || (req as any).user?.listener;
        if (!listenerId) {
            return res.status(401).json({
                error: true,
                message: 'Listener context required',
                status: 401,
                data: {},
            });
        }
        const { query } = req.body;
        const result = await searchService.saveRecentSearch(listenerId, query);
        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

export const clearRecentSearches = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const listenerId = (req as any).user?.listenerId || (req as any).user?.listener;
        if (!listenerId) {
            return res.status(401).json({
                error: true,
                message: 'Listener context required',
                status: 401,
                data: {},
            });
        }
        const result = await searchService.clearRecentSearches(listenerId);
        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

export const deleteRecentSearch = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const listenerId = (req as any).user?.listenerId || (req as any).user?.listener;
        if (!listenerId) {
            return res.status(401).json({
                error: true,
                message: 'Listener context required',
                status: 401,
                data: {},
            });
        }
        const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }
        const result = await searchService.deleteRecentSearch(listenerId, id);
        res.status(result.code).json({
            error: result.error,
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);
