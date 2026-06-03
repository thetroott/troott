import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../middlewares/async.mdw';
import ErrorResponse from '../../utils/error.util';
import type { ILibraryDoc } from '@/interfaces/core/library.interface';
import libraryRepository from '@/repository/core/library.repository';
import libraryService from '@/services/core/library.service';
import playlistService from '@/services/core/playlist.service';
import Listener from '@/models/core/listener.model';

/**
 * Libraries belong to listener profiles only (not ministers/creators).
 * Route params may be either the auth user's id (legacy clients) or the listener document id.
 */
async function assertListenerOwnedByActor(
    paramId: string,
    actorId: string,
): Promise<{ listenerId: string } | { error: ErrorResponse }> {
    if (!paramId || !actorId) {
        return {
            error: new ErrorResponse('listenerId is required', 400, []),
        };
    }

    const byUser = await Listener.findOne({ user: paramId })
        .select('_id user')
        .lean();
    if (byUser && String(byUser.user) === String(actorId)) {
        return { listenerId: String(byUser._id) };
    }

    const byListener = await Listener.findById(paramId)
        .select('_id user')
        .lean();
    if (
        byListener &&
        byListener.user != null &&
        String(byListener.user) === String(actorId)
    ) {
        return { listenerId: String(byListener._id) };
    }

    return {
        error: new ErrorResponse(
            'Listener profile not found or you do not have access',
            403,
            [],
        ),
    };
}

/**
 * @name createLibrary
 * @description Get or create the library for the signed-in listener (optional body.listenerId must be your profile).
 * @route POST /api/v1/library
 * @access Private
 */
export const createLibrary = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const { listenerId: bodyListenerId } = req.body as {
            listenerId?: string;
        };

        
        if (!bodyListenerId) {
            return next(new ErrorResponse('listenerId is required', 400, []));
        }

        let targetListenerId: string;

        if (bodyListenerId != null && bodyListenerId !== '') {
            const owned = await Listener.findOne({
                _id: bodyListenerId,
                user: actorId,
            })
                .select('_id')
                .lean();
            if (!owned) {
                return next(
                    new ErrorResponse(
                        'You can only create a library for your own listener profile',
                        403,
                        [],
                    ),
                );
            }
            targetListenerId = String(owned._id);
        } else {
            const own = await Listener.findOne({ user: actorId })
                .select('_id')
                .lean();
            if (!own) {
                return next(
                    new ErrorResponse(
                        'A listener profile is required before a library can be created',
                        400,
                        [],
                    ),
                );
            }
            targetListenerId = String(own._id);
        }

        const library = await libraryService.getOrCreateLibrary(targetListenerId);
        if (library.error) {
            return next(
                new ErrorResponse(
                    library.message,
                    library.code || 500,
                    [],
                ),
            );
        }

        const created = library.code === 201;
        res.status(created ? 201 : 200).json({
            error: false,
            errors: [],
            message: created
                ? 'Library created successfully'
                : 'Library already exists',
            status: created ? 201 : 200,
            data: library.data,
        });
    },
);

/**
 * @name getLibraryByUser
 * @description Get the library for a listener. `:userId` may be the auth user id or listener id (must be yours).
 * @route GET /api/v1/library/user/:userId
 * @access Private
 */
export const getLibraryByUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const paramId = (Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
        if (!paramId) {
            return next(new ErrorResponse('userId is required', 400, []));
        }
        const resolved = await assertListenerOwnedByActor(paramId, actorId);
        if ('error' in resolved) {
            return next(resolved.error);
        }

        const library = await libraryRepository.findByListener(
            resolved.listenerId,
        );

        if (library.error) {
            return next(new ErrorResponse(library.message, library.code, []));
        }

        const playlistResult = await playlistService.getUserPlaylists(actorId);
        const userPlaylists = Array.isArray(playlistResult.data)
            ? playlistResult.data
            : [];

        const libPayload =
            library.data != null && typeof library.data === 'object'
                ? {
                      ...(typeof (library.data as { toObject?: () => object }).toObject ===
                      'function'
                          ? (library.data as { toObject: () => object }).toObject()
                          : library.data),
                      userPlaylists,
                      ownedPlaylistCount: userPlaylists.length,
                  }
                : {
                      userPlaylists,
                      ownedPlaylistCount: userPlaylists.length,
                  };

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Library fetched successfully',
            status: 200,
            data: libPayload,
        });
    },
);

/**
 * @name getLibraryById
 * @description Get a library by Mongo id. `:userId` identifies your listener (auth user id or listener id).
 * @route GET /api/v1/library/user/:userId/:libraryId
 * @access Private
 */
export const getLibraryById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const paramId = (Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
        const libraryId = (Array.isArray(req.params.libraryId) ? req.params.libraryId[0] : req.params.libraryId);
        if (!paramId || !libraryId) {
            return next(
                new ErrorResponse(
                    'userId and libraryId are required',
                    400,
                    [],
                ),
            );
        }

        const resolved = await assertListenerOwnedByActor(paramId, actorId);
        if ('error' in resolved) {
            return next(resolved.error);
        }

        const library = await libraryRepository.findById(libraryId);
        if (library.error) {
            return next(new ErrorResponse(library.message, library.code, []));
        }

        const lib = library.data as ILibraryDoc;
        const ownerId =
            lib.listener != null &&
            typeof (lib.listener as { toString?: () => string }).toString ===
                'function'
                ? (lib.listener as { toString: () => string }).toString()
                : String(lib.listener);

        if (!ownerId || ownerId !== resolved.listenerId) {
            return next(
                new ErrorResponse(
                    'You are not authorized to access this resource',
                    403,
                    [],
                ),
            );
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Library fetched successfully',
            status: 200,
            data: lib,
        });
    },
);

/**
 * @name getAllLibraries
 * @description List library documents (paginated). Intended for staff; protect at router if needed.
 * @route GET /api/v1/library
 * @access Private
 */
export const getAllLibraries = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 25;
        const skip = (page - 1) * limit;

        const filters = {};
        const options = {
            limit,
            skip,
            sort: req.query.sort as string,
            populate: 'likedSermons playlists favouriteministers mostPlayed',
        };

        const result = await libraryRepository.findAll(filters, options);
        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        const total = await libraryRepository.countDocuments(filters);

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Libraries fetched successfully',
            status: 200,
            data: result.data,
            pagination: {
                page,
                limit,
                total,
            },
        });
    },
);

/**
 * @name updateLibrary
 * @description Update fields on your listener library. `:userId` may be auth user id or listener id.
 * @route PUT /api/v1/library/user/:userId
 * @access Private
 */
export const updateLibrary = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const paramId = (Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
        if (!paramId) {
            return next(new ErrorResponse('userId is required', 400, []));
        }
        const resolved = await assertListenerOwnedByActor(paramId, actorId);
        if ('error' in resolved) {
            return next(resolved.error);
        }

        const updates = { ...req.body };
        delete (updates as { user?: unknown }).user;
        delete (updates as { listenerId?: unknown }).listenerId;

        const library = await libraryRepository.updateLibrary(
            resolved.listenerId,
            updates,
        );

        if (library.error) {
            return next(new ErrorResponse(library.message, library.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Library updated successfully',
            status: 200,
            data: library.data,
        });
    },
);

/**
 * @name deleteLibrary
 * @description Delete your listener library. `:userId` may be auth user id or listener id.
 * @route DELETE /api/v1/library/user/:userId
 * @access Private
 */
export const deleteLibrary = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const paramId = (Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
        if (!paramId) {
            return next(new ErrorResponse('userId is required', 400, []));
        }
        const resolved = await assertListenerOwnedByActor(paramId, actorId);
        if ('error' in resolved) {
            return next(resolved.error);
        }

        const deleted = await libraryRepository.deleteLibrary(
            resolved.listenerId,
        );
        if (deleted.error) {
            return next(new ErrorResponse(deleted.message, deleted.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Library deleted successfully',
            status: 200,
            data: {},
        });
    },
);
