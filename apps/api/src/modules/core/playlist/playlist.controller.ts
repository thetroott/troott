import { Request, Response, NextFunction } from 'express';
import playlistRepository from './playlist.repository';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import { pathParam } from '../../../utils/route-params.util';
import { getAuthUserId } from '../../../utils/auth-request.util';
import { userIsStaff } from '../../users/user/user.staff.util';
import type { IPlaylistDoc } from './playlist.interface';

function playlistOwnerId(p: { user?: unknown; createdBy?: unknown }): string {
    const idFrom = (u: unknown): string => {
        if (u == null) return '';
        if (typeof u === 'object' && u !== null && '_id' in u) {
            return String((u as { _id: unknown })._id);
        }
        return String(u);
    };
    return idFrom(p.user) || idFrom(p.createdBy);
}

async function assertSelfOrStaff(
    req: Request,
    targetUserId: string,
): Promise<void> {
    const actorId = getAuthUserId(req);
    if (!actorId) {
        throw new ErrorResponse('Unauthorized', 401, []);
    }
    if (actorId === targetUserId) {
        return;
    }
    if (await userIsStaff(actorId)) {
        return;
    }
    throw new ErrorResponse(
        'You are not authorized to access this resource',
        403,
        [],
    );
}

async function assertPlaylistOwnerOrStaff(
    req: Request,
    playlistId: string,
): Promise<void> {
    const result = await playlistRepository.findById(playlistId);
    if (result.error) {
        throw new ErrorResponse(result.message, result.code, []);
    }
    const owner = playlistOwnerId(result.data as IPlaylistDoc);
    const actorId = getAuthUserId(req);
    if (!actorId) {
        throw new ErrorResponse('Unauthorized', 401, []);
    }
    if (actorId === owner) {
        return;
    }
    if (await userIsStaff(actorId)) {
        return;
    }
    throw new ErrorResponse(
        'You are not authorized to modify this playlist',
        403,
        [],
    );
}

/**
 * @name createPlaylist
 * @route POST /api/v1/playlist
 * @access Private
 */
export const createPlaylist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = getAuthUserId(req);
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const body = { ...req.body } as Record<string, unknown>;
        const staff = await userIsStaff(actorId);
        if (!staff) {
            body.user = actorId;
            body.createdBy = actorId;
        } else {
            if (body.user == null || body.user === '') {
                body.user = actorId;
            }
            if (body.createdBy == null || body.createdBy === '') {
                body.createdBy = actorId;
            }
        }

        const result = await playlistRepository.createPlaylist(
            body as Partial<IPlaylistDoc>,
        );

        if (result.error)
            return next(new ErrorResponse(result.message, result.code, []));
        res.status(result.code).json({
            error: false,
            errors: [],
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

/**
 * @name getPlaylistById
 * @route GET /api/v1/playlists/:id
 * @access Public/Private (depends on your auth)
 */
export const getPlaylistById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = pathParam(req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }

        const result = await playlistRepository.findById(id);
        if (result.error)
            return next(new ErrorResponse(result.message, result.code, []));

        const pl = result.data as IPlaylistDoc;
        const isPublic = pl.isPublic !== false;
        if (!isPublic) {
            const actorId = getAuthUserId(req);
            if (!actorId) {
                return next(new ErrorResponse('Unauthorized', 401, []));
            }
            const owner = playlistOwnerId(pl);
            if (actorId !== owner && !(await userIsStaff(actorId))) {
                return next(new ErrorResponse('Forbidden', 403, []));
            }
        }

        res.status(result.code).json({
            error: false,
            errors: [],
            message: 'Playlist fetched successfully',
            status: result.code,
            data: result.data,
        });
    },
);

/**
 * @name getPlaylistsByUser
 * @route GET /api/v1/playlists/user/:userId
 * @access Private
 */
export const getPlaylistsByUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = pathParam(req.params.userId);
        if (!userId) {
            return next(new ErrorResponse('userId is required', 400, []));
        }

        try {
            await assertSelfOrStaff(req, userId);
        } catch (e) {
            return next(e);
        }

        const result = await playlistRepository.findByUser(userId);
        if (result.error)
            return next(new ErrorResponse(result.message, result.code, []));

        res.status(result.code).json({
            error: false,
            errors: [],
            message: 'User playlists fetched successfully',
            status: result.code,
            data: result.data,
        });
    },
);

/**
 * @name getAllPlaylists
 * @route GET /api/v1/playlists
 * @access Public/Private (depends)
 */
export const getAllPlaylists = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const filters = req.query.filters || {};

        const options = {
            sort: req.query.sort as string,
            skip: Number(req.query.skip) || 0,
            limit: Number(req.query.limit) || 25,
            populate: 'items.itemId user createdBy',
        };

        const result = await playlistRepository.findAll(filters, options);
        if (result.error)
            return next(new ErrorResponse(result.message, result.code, []));

        res.status(result.code).json({
            error: false,
            errors: [],
            message: 'All playlists fetched successfully',
            status: result.code,
            data: result.data,
        });
    },
);

/**
 * @name updatePlaylist
 * @route PUT /api/v1/playlists/:id
 * @access Private
 */
export const updatePlaylist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = pathParam(req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }

        try {
            await assertPlaylistOwnerOrStaff(req, id);
        } catch (e) {
            return next(e);
        }

        const updates = { ...req.body } as Record<string, unknown>;
        const actorId = getAuthUserId(req);
        if (actorId && !(await userIsStaff(actorId))) {
            delete updates.user;
            delete updates.createdBy;
        }

        const result = await playlistRepository.updatePlaylist(
            id,
            updates as Partial<IPlaylistDoc>,
        );
        if (result.error)
            return next(new ErrorResponse(result.message, result.code, []));

        res.status(result.code).json({
            error: false,
            errors: [],
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

/**
 * @name deletePlaylist
 * @route DELETE /api/v1/playlists/:id
 * @access Private
 */
export const deletePlaylist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = pathParam(req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }

        try {
            await assertPlaylistOwnerOrStaff(req, id);
        } catch (e) {
            return next(e);
        }

        const result = await playlistRepository.deletePlaylist(id);
        if (result.error)
            return next(new ErrorResponse(result.message, result.code, []));

        res.status(result.code).json({
            error: false,
            errors: [],
            message: result.message,
            status: result.code,
            data: {},
        });
    },
);

/**
 * @name addItemToPlaylist
 * @route PATCH /api/v1/playlists/:playlistId/add
 * @access Private
 */
export const addItemToPlaylist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const playlistId = pathParam(req.params.playlistId);
        if (!playlistId) {
            return next(new ErrorResponse('playlistId is required', 400, []));
        }

        try {
            await assertPlaylistOwnerOrStaff(req, playlistId);
        } catch (e) {
            return next(e);
        }

        const { itemId, type } = req.body;

        const result = await playlistRepository.addItemToPlaylist(playlistId, {
            itemId,
            type,
        });

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

/**
 * @name removeItemFromPlaylist
 * @route PATCH /api/v1/playlists/:playlistId/remove
 * @access Private
 */
export const removeItemFromPlaylist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const playlistId = pathParam(req.params.playlistId);
        if (!playlistId) {
            return next(new ErrorResponse('playlistId is required', 400, []));
        }

        try {
            await assertPlaylistOwnerOrStaff(req, playlistId);
        } catch (e) {
            return next(e);
        }

        const { itemId } = req.body;

        const result = await playlistRepository.removeItemFromPlaylist(
            playlistId,
            itemId,
        );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: result.message,
            status: result.code,
            data: result.data,
        });
    },
);

// playlist controller

// create playlist
// add to library
// toogle private or public
// get all user library items
// get all user playlist
// get a user playlist
// get a playlist (with items in in)
// add an item to playlist
// sermon
// sermon bites
// minister
// remove an item to playlist
// sermon
// sermon bites
// minister

// update user playlist
// delete user playlist
// follow a playlist
// unfollow a playlist
// share a playlist
