import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import { pathParam } from '../../../utils/route-params.util';
import { getAuthUserId } from '../../../utils/auth-request.util';
import sermonRepository from './sermon.repository';
import { DeleteSermonDTO, UpdateSermonDTO } from './sermon.dto';
import { IFile } from '../../../utils/interfaces.util';
import { mediaConfig } from '../../../configs/media.config';
import type { ISermonDoc } from './sermon.interface';
import { ContentState, ContentStatus } from '../../../utils/enums.util';
import sermonService from './sermon.service';
import sermonMapper from './sermon.mapper';
import { canAccessSermonDocument } from './sermon-access.util';
import { isSermonPublicTeaserEligible } from '../open/sermon-teaser.util';
import redisWrapper from '../../../middlewares/redis.mdw';
import { createHash } from 'crypto';

const SERMON_CACHE_TTL_DETAIL = 300;
const SERMON_CACHE_TTL_LIST = 180;


/**
 * @name uploadSermom
 * @description A method to handle sermon file uploads.
 * Processes the multipart form data, validates the upload,
 * and initiates the upload session.
 * @route POST /api/v1/sermon/start-upload
 * @access Public
 * @param {File} file
 * @returns {Object} uplaod sermon details
 */
export const uploadSermon = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const files: IFile[] = (req as any).files;
        const file: IFile | undefined =
            files && files.length > 0 ? files[0] : undefined;

        if (!file) {
            return next(new ErrorResponse('No file found in request', 400, []));
        }

        const mime = (file.mimeType || '').toLowerCase();
        if (!mediaConfig.sermonAudioMimeAllowlist.has(mime)) {
            return next(
                new ErrorResponse('Unsupported sermon audio type', 400, []),
            );
        }

        const uid = getAuthUserId(req);
        if (uid) {
            file.uploadedBy = uid;
        }

        const upload = await sermonService.handleUploadSermon(file);
        if (upload.error || !upload.data) {
            return next(new ErrorResponse(upload.message, 500, []));
        }

        const response = await sermonMapper.mapSermon(
            upload.data as ISermonDoc,
        );
        const createdSermon = upload.data as ISermonDoc;
        if (createdSermon?._id) {
            await invalidateSermonDetailCache(
                String(createdSermon._id),
                getAuthUserId(req),
            );
            await invalidateCommonSermonListCaches({
                ministerId: String(
                    (createdSermon as unknown as Record<string, unknown>)
                        ?.minister || '',
                ).trim(),
                topic: String(
                    (createdSermon as unknown as Record<string, unknown>)
                        ?.topic || '',
                ).trim(),
                userId: getAuthUserId(req) || undefined,
            });
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: response,
            message: upload.message,
            status: 200,
        });
    },
);

/**
 * @name uploadSermomCover
 * @description A method to handle sermon image file uploads.
 * Processes the multipart form data, validates the upload,
 * and initiates the upload session.
 * @route POST /api/v1/sermon/image-upload
 * @access Public
 * @param {File} file
 * @returns {Object} uploaded file
 */
export const uploadSermonCover = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const files: IFile[] = (req as any).files;
        const file: IFile | undefined =
            files && files.length > 0 ? files[0] : undefined;

        if (!file) {
            return next(new ErrorResponse('No file found in request', 400, []));
        }

        const upload = await sermonService.handleUploadImage(file);
        if (upload.error || !upload.data) {
            return next(new ErrorResponse(upload.message, 500, []));
        }

        const response = await sermonMapper.mapSermon(
            upload.data as ISermonDoc,
        );
        const updatedSermon = upload.data as ISermonDoc;
        if (updatedSermon?._id) {
            await invalidateSermonDetailCache(
                String(updatedSermon._id),
                getAuthUserId(req),
            );
            await invalidateCommonSermonListCaches({
                ministerId: String(
                    (updatedSermon as unknown as Record<string, unknown>)
                        ?.minister || '',
                ).trim(),
                topic: String(
                    (updatedSermon as unknown as Record<string, unknown>)
                        ?.topic || '',
                ).trim(),
                userId: getAuthUserId(req) || undefined,
            });
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: response,
            message: upload.message,
            status: 200,
        });
    },
);

/**
 * @name publishSermon
 * @description A method to publish a processed sermon.
 * Makes the sermon publicly accessible and updates its status.
 * @route POST /api/v1/sermon/publish
 * @access Public
 * @returns {Object} publlished sermon
 */
export const publishSermon = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = pathParam(req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }
        const sermonExist = await sermonRepository.findBySermonId(id);
        if (sermonExist.error) {
            return next(
                new ErrorResponse(sermonExist.message, sermonExist.code!, []),
            );
        }

        const {
            title,
            description,
            duration,
            releaseDate,
            releaseYear,
            sermonUrl,
            imageUrl,
            size,
            topic,
            tags,
            isPublic,
            shareableUrl,
            isSeries,
            series,
            state,
            status,
            minister,
            playlist,
            publishedBy,
            versionId,
            changesSummary,
            uploadRef,
            uploadSummary,
        } = req.body;

        const updatePayload: Partial<UpdateSermonDTO> = {
            title,
            description,
            duration,
            releaseDate,
            releaseYear,
            sermonUrl,
            imageUrl,
            size,
            topic,
            tags,
            isPublic,
            shareableUrl,
            isSeries,
            series,
            state,
            status,
            minister,
            playlist,
            publishedBy,
            versionId,
            changesSummary,
            uploadRef,
            uploadSummary,
        };

        const updated = await sermonRepository.updateSermon(
            id,
            updatePayload as Partial<ISermonDoc>,
        );

        if (updated.error) {
            return next(new ErrorResponse(updated.message, updated.code!, []));
        }

        const existingDoc = sermonExist.data as Record<string, unknown>;
        await invalidateSermonDetailCache(id, getAuthUserId(req));
        await invalidateCommonSermonListCaches({
            ministerId: String(
                minister || existingDoc?.minister || '',
            ).trim(),
            topic: String(topic || existingDoc?.topic || '').trim(),
            userId: getAuthUserId(req) || undefined,
        });

        res.status(200).json({
            error: false,
            errors: [],
            data: updated.data,
            message: 'Sermon updated successfully',
            status: 200,
        });
    },
);

/**
 * @name updateSermon
 * @description A method to update an existing sermon by ID.
 * @route PUT /api/v1/sermon/update/:id
 * @access Public
 * @returns {Object} updated sermon
 */
export const updateSermon = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = pathParam(req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }
        const sermonExist = await sermonRepository.findBySermonId(id);
        if (sermonExist.error) {
            return next(
                new ErrorResponse(sermonExist.message, sermonExist.code!, []),
            );
        }

        const {
            title,
            description,
            duration,
            releaseDate,
            releaseYear,
            sermonUrl,
            imageUrl,
            size,
            topic,
            tags,
            isPublic,
            shareableUrl,
            isSeries,
            series,
            state,
            status,
            minister,
            playlist,
            publishedBy,
            versionId,
            changesSummary,
            uploadRef,
            uploadSummary,
        } = req.body;

        const updatePayload: Partial<UpdateSermonDTO> = {
            title,
            description,
            duration,
            releaseDate,
            releaseYear,
            sermonUrl,
            imageUrl,
            size,
            topic,
            tags,
            isPublic,
            shareableUrl,
            isSeries,
            series,
            state,
            status,
            minister,
            playlist,
            publishedBy,
            versionId,
            changesSummary,
            uploadRef,
            uploadSummary,
        };

        const updated = await sermonRepository.updateSermon(
            id,
            updatePayload as Partial<ISermonDoc>,
        );

        if (updated.error) {
            return next(new ErrorResponse(updated.message, updated.code!, []));
        }

        const existingDoc = sermonExist.data as Record<string, unknown>;
        await invalidateSermonDetailCache(id, getAuthUserId(req));
        await invalidateCommonSermonListCaches({
            ministerId: String(
                minister || existingDoc?.minister || '',
            ).trim(),
            topic: String(topic || existingDoc?.topic || '').trim(),
            userId: getAuthUserId(req) || undefined,
        });

        res.status(200).json({
            error: false,
            errors: [],
            data: updated.data,
            message: 'Sermon updated successfully',
            status: 200,
        });
    },
);

/**
 * @name moveSermonToBin
 * @description Soft deletes a sermon by marking its status as DELETED.
 * This does not remove the sermon from the database, but makes it invisible in active listings
 * @route PUT /api/v1/sermon/move-to-bin/:id
 * @access Public
 * @returns {Object} updated sermon
 */
export const moveSermonToBin = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = pathParam(req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }
        const { state, status, publishedBy }: Partial<DeleteSermonDTO> =
            req.body;

        const sermonExist = await sermonRepository.findBySermonId(id);
        if (sermonExist.error) {
            return next(
                new ErrorResponse(sermonExist.message, sermonExist.code!, []),
            );
        }
        const doc = sermonExist.data as Record<string, unknown>;
        const userId = getAuthUserId(req);
        if (!userId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }
        const isOwner = await sermonService.isSermonOwnedByUser(
            userId,
            doc.minister,
        );
        const policy = sermonService.validateDeletePolicy({
            action: 'move-to-bin',
            sermonStatus: doc.status,
            actorRole: (req.user as { role?: unknown } | undefined)?.role,
            isOwner,
        });
        if (policy.error) {
            return next(new ErrorResponse(policy.message, policy.code!, []));
        }

        const deletePayload = {
            state: state || ContentState.DELETED,
            status: status || ContentStatus.DELETED,
            publishedBy: publishedBy,
        };

        const deleted = await sermonRepository.moveSermonToBin(
            id,
            deletePayload,
        );
        if (deleted.error) {
            return next(new ErrorResponse(deleted.message, deleted.code!, []));
        }

        await invalidateSermonDetailCache(id, userId);
        await invalidateCommonSermonListCaches({
            ministerId: String(doc?.minister || '').trim(),
            topic: String(doc?.topic || '').trim(),
            userId,
        });

        res.status(200).json({
            error: false,
            errors: [],
            data: deleted.data,
            message: 'Sermon moved to bin successfully',
            status: 200,
        });
    },
);

/**
 * @name deleteSermon
 * @description deletes a sermon from the database.
 * @route DELETE /api/v1/sermon/deleete/:id
 * @access Private - Admin Only
 * @returns {Object} updated sermon
 */
export const deleteSermon = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = pathParam(req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }
        const sermonExist = await sermonRepository.findBySermonId(id);
        if (sermonExist.error) {
            return next(
                new ErrorResponse(sermonExist.message, sermonExist.code!, []),
            );
        }
        const doc = sermonExist.data as Record<string, unknown>;
        const userId = getAuthUserId(req);
        if (!userId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }
        const isOwner = await sermonService.isSermonOwnedByUser(
            userId,
            doc.minister,
        );
        const policy = sermonService.validateDeletePolicy({
            action: 'delete',
            sermonStatus: doc.status,
            actorRole: (req.user as { role?: unknown } | undefined)?.role,
            isOwner,
            allowPublishedDelete:
                req.query.allowPublishedDelete ??
                (req.body as { allowPublishedDelete?: unknown })
                    ?.allowPublishedDelete,
        });
        if (policy.error) {
            return next(new ErrorResponse(policy.message, policy.code!, []));
        }

        const deleted = await sermonRepository.deleteSermon(id);
        if (deleted.error) {
            return next(new ErrorResponse(deleted.message, deleted.code!, []));
        }

        await invalidateSermonDetailCache(id, userId);
        await invalidateCommonSermonListCaches({
            ministerId: String(doc?.minister || '').trim(),
            topic: String(doc?.topic || '').trim(),
            userId,
        });

        res.status(200).json({
            error: false,
            errors: [],
            data: deleted.data,
            message: 'Sermon deleted successfully',
            status: 200,
        });
    },
);

/**
 * @name getSermonById
 * @description Get a sermon and its metadata by ID
 * @route GET /api/v1/sermon/:id
 * @access Public
 */
export const getSermonById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = pathParam(req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }

        const userId = getAuthUserId(req);
        const viewerScope = userId ? `user:${userId}` : 'public';
        const cacheKey = sermonDetailKey(id, viewerScope);
        const cached = await redisWrapper.fetchData<{
            data: unknown;
            teaserEligible: boolean;
        }>(cacheKey);
        if (cached) {
            if (cached.teaserEligible) {
                res.setHeader('Cache-Control', 'public, max-age=120');
            } else {
                res.setHeader('Cache-Control', 'private, no-store');
            }
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached.data,
                message: 'Sermon fetched successfully (cached)',
                status: 200,
            });
        }

        const sermon = await sermonRepository.findBySermonId(id);
        if (sermon.error)
            return next(new ErrorResponse(sermon.message, sermon.code!, []));

        const doc = sermon.data as Record<string, unknown>;
        const allowed = await canAccessSermonDocument(req, doc);
        if (!allowed) {
            return next(new ErrorResponse('sermon not found', 404, []));
        }

        if (isSermonPublicTeaserEligible(doc)) {
            res.setHeader('Cache-Control', 'public, max-age=120');
        } else {
            res.setHeader('Cache-Control', 'private, no-store');
        }

        await redisWrapper.keepData(
            {
                key: cacheKey,
                value: {
                    data: sermon.data,
                    teaserEligible: isSermonPublicTeaserEligible(doc),
                },
            },
            SERMON_CACHE_TTL_DETAIL,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: sermon.data,
            message: 'Sermon fetched successfully',
            status: 200,
        });
    },
);

/**
 * @name getSermonsBytopic
 * @description Get sermons filtered by topic
 * @route GET /api/v1/sermon/topic/:topic
 * @access Public
 * @returns {Object} list of sermons
 */
export const getSermonsByTopic = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const topic = pathParam(req.params.topic);
        if (!topic) {
            return next(new ErrorResponse('topic is required', 400, []));
        }
        const page = toPositiveInt(req.query.page, 1);
        const limit = toPositiveInt(req.query.limit, 25);
        const skip = (page - 1) * limit;
        const sort = normalizeSort(req.query.sort);

        const options = {
            limit,
            skip,
            sort,
            populate: 'minister series topic',
        };

        const cacheKey = sermonListKey('topic', {
            topic,
            page,
            limit,
            sort,
        });
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: `Sermons for topic "${topic}" retrieved successfully (cached)`,
                status: 200,
            });
        }

        const result = await sermonRepository.findByTopic(topic, options);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            SERMON_CACHE_TTL_LIST,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: `Sermons for topic "${topic}" retrieved successfully`,
            status: 200,
        });
    },
);

/**
 * @name getAllSermons
 * @description Get all sermons with pagination, filtering, sorting
 * @route GET /api/v1/sermon
 * @access Public
 * @returns {Object} list of sermons
 */
export const getAllSermons = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = toPositiveInt(req.query.page, 1);
        const limit = toPositiveInt(req.query.limit, 25);
        const skip = (page - 1) * limit;
        const sort = normalizeSort(req.query.sort);

        const filters = {};
        const options = {
            limit,
            skip,
            sort,
            populate: 'minister series topic',
        };

        const cacheKey = sermonListKey('all', { page, limit, sort });
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Sermons retrieved successfully (cached)',
                status: 200,
            });
        }

        const result = await sermonRepository.findAll(filters, options);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            SERMON_CACHE_TTL_LIST,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: 'Sermons retrieved successfully',
            status: 200,
        });
    },
);

/**
 * @name getSermonsByminister
 * @description Get sermons by minister
 * @route GET /api/v1/sermon/minister/:ministerId
 * @access Public
 * @returns {Object} list of sermons
 */
export const getSermonsByminister = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const ministerId = pathParam(req.params.ministerId);
        if (!ministerId) {
            return next(new ErrorResponse('ministerId is required', 400, []));
        }
        const page = toPositiveInt(req.query.page, 1);
        const limit = toPositiveInt(req.query.limit, 25);
        const skip = (page - 1) * limit;

        const sort = sermonService.normalizeMinisterListSort(req.query.sort);
        const publicationStatus = sermonService.parsePublicationStatus(
            req.query.status,
        );
        const search =
            typeof req.query.q === 'string' && req.query.q.trim()
                ? req.query.q.trim()
                : undefined;
        const dateFrom =
            typeof req.query.dateFrom === 'string' && req.query.dateFrom.trim()
                ? req.query.dateFrom.trim()
                : undefined;
        const dateTo =
            typeof req.query.dateTo === 'string' && req.query.dateTo.trim()
                ? req.query.dateTo.trim()
                : undefined;

        const options = {
            limit,
            skip,
            sort,
            populate: 'minister series topic',
            publicationStatus,
            search,
            dateFrom,
            dateTo,
        };

        const cacheKey = sermonListKey('minister', {
            ministerId,
            page,
            limit,
            sort,
            publicationStatus,
            search,
            dateFrom,
            dateTo,
        });
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: `Sermons by minister retrieved successfully (cached)`,
                status: 200,
            });
        }

        const result = await sermonRepository.getSermonsByMinister(
            ministerId,
            options,
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            SERMON_CACHE_TTL_LIST,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: `Sermons by minister retrieved successfully`,
            status: 200,
        });
    },
);

/**
 * @name getSermonsByministerSorted
 * @description Internal helper to fetch sermons by minister with dynamic sort field.
 * Helper to get sermons by minister sorted by various criteria
 * @param {"playCount" | "likeCount" | "shareCount" | "releaseDate"} sortField
 * @returns {Function} Express handler function
 */
const getSermonsByMinisterSorted = (
    sortField: 'playCount' | 'likeCount' | 'shareCount' | 'releaseDate',
) =>
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const ministerId = pathParam(req.params.ministerId);
        if (!ministerId) {
            return next(new ErrorResponse('ministerId is required', 400, []));
        }
        const page = toPositiveInt(req.query.page, 1);
        const limit = toPositiveInt(req.query.limit, 25);
        const skip = (page - 1) * limit;

        const options = {
            limit,
            skip,
            populate: 'minister series topic',
            recentOnly: sortField === 'releaseDate', // for recent filter
        };

        const cacheKey = sermonListKey('minister-ranked', {
            ministerId,
            sortField,
            page,
            limit,
        });
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            const messagesMap: Record<string, string> = {
                playCount: 'Most played sermons retrieved successfully (cached)',
                likeCount: 'Most liked sermons retrieved successfully (cached)',
                shareCount: 'Most shared sermons retrieved successfully (cached)',
                releaseDate:
                    'Recently published sermons retrieved successfully (cached)',
            };
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: messagesMap[sortField],
                status: 200,
            });
        }

        const result = await sermonRepository.findByMinisterSorted(
            ministerId,
            sortField,
            options,
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            SERMON_CACHE_TTL_LIST,
        );

        const messagesMap: Record<string, string> = {
            playCount: 'Most played sermons retrieved successfully',
            likeCount: 'Most liked sermons retrieved successfully',
            shareCount: 'Most shared sermons retrieved successfully',
            releaseDate: 'Recently published sermons retrieved successfully',
        };

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: messagesMap[sortField],
            status: 200,
        });
    });

/**
 * @name getSermonsByministerMostPlayed
 * @description Get most played sermons by minister
 * @route GET /api/v1/sermon/minister/:ministerId/most-played
 * @access Public
 * @returns {Object} list of sermons sorted by most played
 */
export const getSermonsByMinisterMostPlayed =
    getSermonsByMinisterSorted('playCount');

/**
 * @name getSermonsByMinisterMostLiked
 * @description Get most liked sermons by minister
 * @route GET /api/v1/sermon/minister/:ministerId/most-liked
 * @access Public
 * @returns {Object} list of sermons sorted by most liked
 */
export const getSermonsByministerMostLiked =
    getSermonsByMinisterSorted('likeCount');

/**
 * @name getSermonsByMinisterMostShared
 * @description Get most shared sermons by minister
 * @route GET /api/v1/sermon/minister/:ministerId/most-shared
 * @access Public
 * @returns {Object} list of sermons sorted by most shared
 */
export const getSermonsByministerMostShared =
    getSermonsByMinisterSorted('shareCount');

/**
 * @name getSermonsByMinisterRecentlyPublished
 * @description Get recently published sermons by minister (within the last 7 days)
 * @route GET /api/v1/sermon/minister/:ministerId/recently-published
 * @access Public
 * @returns {Object} list of recently published sermons
 */
export const getSermonsByministerRecentlyPublished =
    getSermonsByMinisterSorted('releaseDate');

/**
 * @name getSermonsAllSorted
 * @description Internal helper to fetch sermons across all ministers with dynamic sort field
 * @param {"playCount" | "likeCount" | "shareCount" | "releaseDate"} sortField
 * @returns {Function} Express route handler function
 */
const getSermonsAllSorted = (
    sortField: 'playCount' | 'likeCount' | 'shareCount' | 'releaseDate',
) =>
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const page = toPositiveInt(req.query.page, 1);
        const limit = toPositiveInt(req.query.limit, 25);
        const skip = (page - 1) * limit;

        const options = {
            limit,
            skip,
            populate: 'minister series topic',
            recentOnly: sortField === 'releaseDate',
        };

        const cacheKey = sermonListKey('global-ranked', {
            sortField,
            page,
            limit,
        });
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            const messagesMap: Record<string, string> = {
                playCount: 'Most played sermons retrieved successfully (cached)',
                likeCount: 'Most liked sermons retrieved successfully (cached)',
                shareCount: 'Most shared sermons retrieved successfully (cached)',
                releaseDate:
                    'Recently published sermons retrieved successfully (cached)',
            };
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: messagesMap[sortField],
                status: 200,
            });
        }

        const result = await sermonRepository.findAllSorted(sortField, options);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            SERMON_CACHE_TTL_LIST,
        );

        const messagesMap: Record<string, string> = {
            playCount: 'Most played sermons retrieved successfully',
            likeCount: 'Most liked sermons retrieved successfully',
            shareCount: 'Most shared sermons retrieved successfully',
            releaseDate: 'Recently published sermons retrieved successfully',
        };

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: messagesMap[sortField],
            status: 200,
        });
    });

/**
 * @name getSermonsMostPlayed
 * @description Get most played sermons across all ministers
 * @route GET /api/v1/sermon/most-played
 * @access Public
 * @returns {Object} List of most played sermons
 */
export const getSermonsMostPlayed = getSermonsAllSorted('playCount');

/**
 * @name getSermonsMostLiked
 * @description Get most liked sermons across all ministers
 * @route GET /api/v1/sermon/most-liked
 * @access Public
 * @returns {Object} List of most liked sermons
 */
export const getSermonsMostLiked = getSermonsAllSorted('likeCount');

/**
 * @name getSermonsMostShared
 * @description Get most shared sermons across all ministers
 * @route GET /api/v1/sermon/most-shared
 * @access Public
 * @returns {Object} List of most shared sermons
 */
export const getSermonsMostShared = getSermonsAllSorted('shareCount');

/**
 * @name getSermonsRecentlyPublished
 * @description Get recently published sermons across all ministers (last 7 days)
 * @route GET /api/v1/sermon/recently-published
 * @access Public
 * @returns {Object} List of recent sermons
 */
export const getSermonsRecentlyPublished = getSermonsAllSorted('releaseDate');

/**
 * @name getRecentlyAddedSermons
 * @description Get sermons released in the last 30 days
 * @returns {Function} Express route handler function
 */
export const getRecentlyAddedSermons = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = toPositiveInt(req.query.page, 1);
        const limit = toPositiveInt(req.query.limit, 25);
        const skip = (page - 1) * limit;
        const cacheKey = sermonListKey('user-recently-added', { page, limit });
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Recently added sermons retrieved successfully (cached)',
                status: 200,
            });
        }

        const options = { limit, skip, populate: 'minister series category' };
        const result = await sermonRepository.findRecentlyAddedMonthly(options);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            SERMON_CACHE_TTL_LIST,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: 'Recently added sermons retrieved successfully',
            status: 200,
        });
    },
);

/**
 * @name getUserRecentlyPlayedSermons
 * @description Get sermons the user recently played
 * @returns {Function} Express route handler function
 */
export const getUserRecentlyPlayedSermons = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getAuthUserId(req);

        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const page = toPositiveInt(req.query.page, 1);
        const limit = toPositiveInt(req.query.limit, 25);
        const skip = (page - 1) * limit;
        const cacheKey = sermonListKey('user-recently-played', {
            userId,
            page,
            limit,
        });
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message:
                    'Recently played sermons retrieved successfully (cached)',
                status: 200,
            });
        }

        const options = { limit, skip, populate: 'minister series category' };
        const result = await sermonRepository.findRecentlyPlayedByUser(
            userId,
            options,
        );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            SERMON_CACHE_TTL_LIST,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: 'Recently played sermons retrieved successfully',
            status: 200,
        });
    },
);

/**
 * @name getPopularSermonsRecentlyPlayed
 * @description Get sermons most recently played by users across the app
 * @returns {Function} Express route handler function
 */
export const getPopularSermonsRecentlyPlayed = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = toPositiveInt(req.query.page, 1);
        const limit = toPositiveInt(req.query.limit, 25);
        const skip = (page - 1) * limit;
        const cacheKey = sermonListKey('user-popular', { page, limit });
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Popular sermons retrieved successfully (cached)',
                status: 200,
            });
        }

        const options = { limit, skip, populate: 'minister series topic' };
        const result = await sermonRepository.findMostRecentlyPlayed(options);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            SERMON_CACHE_TTL_LIST,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: 'Popular sermons retrieved successfully',
            status: 200,
        });
    },
);

/**
 * @name getFavoriteMinisterSermons
 * @description Get a random list of sermons from a user's favorite ministers
 * @returns {Function} Express route handler function
 */
export const getFavoriteMinisterSermons = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const q = req.query.ministerIds ?? req.query.ids;
        const rawIds =
            typeof q === 'string'
                ? q
                : Array.isArray(q)
                  ? q.map(String).join(',')
                  : '';
        const favoriteMinisterIds = normalizeCsvQuery(rawIds);
        if (favoriteMinisterIds.length === 0) {
            return next(
                new ErrorResponse(
                    'Query ministerIds (comma-separated) is required',
                    400,
                    [],
                ),
            );
        }

        const page = toPositiveInt(req.query.page, 1);
        const limit = toPositiveInt(req.query.limit, 25);
        const skip = (page - 1) * limit;
        const userId = getAuthUserId(req);
        const cacheKey = sermonListKey('user-favorite-ministers', {
            userId: userId || 'anon',
            ids: favoriteMinisterIds,
            page,
            limit,
        });
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message:
                    'Sermons from favorite ministers retrieved successfully (cached)',
                status: 200,
            });
        }

        const options = { limit, skip, populate: 'minister series topic' };
        const result =
            await sermonRepository.findFavoriteMinistersSermonsRandom(
                favoriteMinisterIds,
                options,
            );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            SERMON_CACHE_TTL_LIST,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: 'Sermons from favorite ministers retrieved successfully',
            status: 200,
        });
    },
);

/**
 * @name getSermonsByUserInterests
 * @description Get sermons based on user interest tags or topics
 * @returns {Function} Express route handler function
 */
export const getSermonsByUserInterests = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const q = req.query.interests ?? req.query.topics;
        const rawInterests =
            typeof q === 'string'
                ? q
                : Array.isArray(q)
                  ? q.map(String).join(',')
                  : '';
        const interests = normalizeCsvQuery(rawInterests);
        if (interests.length === 0) {
            return next(
                new ErrorResponse(
                    'Query interests or topics (comma-separated) is required',
                    400,
                    [],
                ),
            );
        }

        const page = toPositiveInt(req.query.page, 1);
        const limit = toPositiveInt(req.query.limit, 25);
        const skip = (page - 1) * limit;
        const userId = getAuthUserId(req);
        const cacheKey = sermonListKey('user-interests', {
            userId: userId || 'anon',
            interests,
            page,
            limit,
        });
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Sermons based on interests retrieved successfully (cached)',
                status: 200,
            });
        }

        const options = { limit, skip, populate: 'minister series topic' };
        const result = await sermonRepository.findByUserInterests(
            interests,
            options,
        );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            SERMON_CACHE_TTL_LIST,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: 'Sermons based on interests retrieved successfully',
            status: 200,
        });
    },
);


function toPositiveInt(value: unknown, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.trunc(n) : fallback;
}

function normalizeSort(value: unknown, fallback = '-createdAt'): string {
    return typeof value === 'string' && value.trim().length > 0
        ? value.trim()
        : fallback;
}

function normalizeCsvQuery(value: unknown): string[] {
    const raw =
        typeof value === 'string'
            ? value
            : Array.isArray(value)
              ? value.map(String).join(',')
              : '';
    return Array.from(
        new Set(
            raw
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
        ),
    ).sort((a, b) => a.localeCompare(b));
}

function keyHash(payload: Record<string, unknown>): string {
    const serialized = JSON.stringify(payload);
    return createHash('sha1').update(serialized).digest('hex');
}

function sermonListKey(scope: string, payload: Record<string, unknown>): string {
    return `sermon:list:${scope}:${keyHash(payload)}`;
}

function sermonDetailKey(id: string, viewerScope: string): string {
    return `sermon:id:${id}:viewer:${viewerScope}`;
}

async function invalidateSermonDetailCache(
    sermonId: string,
    userId?: string | null,
) {
    try {
        await redisWrapper.deleteData(sermonDetailKey(sermonId, 'public'));
        if (userId) {
            await redisWrapper.deleteData(
                sermonDetailKey(sermonId, `user:${userId}`),
            );
        }
    } catch (cacheError) {
        console.error('Sermon detail cache invalidation failed:', cacheError);
    }
}

async function invalidateCommonSermonListCaches(params: {
    ministerId?: string;
    topic?: string;
    userId?: string;
}) {
    const { ministerId, topic, userId } = params;
    const keys: string[] = [];
    keys.push(sermonListKey('all', { page: 1, limit: 25, sort: '-createdAt' }));
    for (const sortField of [
        'playCount',
        'likeCount',
        'shareCount',
        'releaseDate',
    ] as const) {
        keys.push(
            sermonListKey('global-ranked', { sortField, page: 1, limit: 25 }),
        );
    }
    if (topic) {
        keys.push(
            sermonListKey('topic', {
                topic,
                page: 1,
                limit: 25,
                sort: '-createdAt',
            }),
        );
    }
    if (ministerId) {
        keys.push(
            sermonListKey('minister', {
                ministerId,
                page: 1,
                limit: 25,
                sort: '-releaseDate',
                publicationStatus: 'all',
                search: undefined,
                dateFrom: undefined,
                dateTo: undefined,
            }),
        );
        for (const sortField of [
            'playCount',
            'likeCount',
            'shareCount',
            'releaseDate',
        ] as const) {
            keys.push(
                sermonListKey('minister-ranked', {
                    ministerId,
                    sortField,
                    page: 1,
                    limit: 25,
                }),
            );
        }
    }
    if (userId) {
        keys.push(
            sermonListKey('user-recently-played', { userId, page: 1, limit: 25 }),
        );
        keys.push(sermonListKey('user-popular', { page: 1, limit: 25 }));
    }
    try {
        for (const key of keys) {
            await redisWrapper.deleteData(key);
        }
    } catch (cacheError) {
        console.error('Sermon list cache invalidation failed:', cacheError);
    }
}


// create sermon metadata
// get sermon metadata
// update sermon metadata
// delete sermon metadata
// publish sermon
// edit sermon
// delete sermon

// get all sermon list
// get a sermon + metadata
// get sermon by topic
// get sermon by minister
// get sermon by minister: most played
// get sermon by minister: most liked
// get sermon by minister: most shared
// get sermon by minister: recently published (new release)

// get sermon list by series
// get sermon list by date
// get sermon list by search
// get sermon list by topic
// get most played sermon list
// get most liked sermon list
// get most shared sermon list

// share a sermon

// get catalog for new user
// get trending sermons (week)
// get popuar sermons (quarterly)
// get new release (weekly)
// get recently added (monthly)
// get most recently played (by users) - popular/recommended
// get favourite ministers sermons (randomly) - the lsit
// get sermon based on user interests

// get catalog for returning user
// get trending sermons
// get new release (weekly)
// get recently added (monthly)
// get recently played (by user)
// get most recently played (by users) - popular/recommended
// get favourite ministers sermons (randomly) - the lsit
// get sermon based on user interests

// Recommendations
// get user's listening history (completed, skipped, liked, disliked).
// get user’s interactions (comments, shares, saves).
// get user’s following list (creators, ministers).
