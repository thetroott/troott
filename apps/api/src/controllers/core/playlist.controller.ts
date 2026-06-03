import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../middlewares/async.mdw';
import ErrorResponse from '../../utils/error.util';
import playlistService from '@/services/core/playlist.service';
import type IUserDoc from '@/interfaces/user.interface';
import type {
    CreatePlaylistDTO,
    UpdatePlaylistDTO,
    AddPlaylistItemDTO,
    RemovePlaylistItemDTO,
} from '@/dtos/core/playlist.dto';
import {
    PlaylistOwnerType,
    PlaylistType,
    PlaylistVisibility,
    PlaylistItemResourceType,
} from '@/interfaces/core/playlist.interface';

function asUserDoc(userId: string): IUserDoc {
    return { _id: userId } as unknown as IUserDoc;
}

function parseStringArray(value: unknown): Array<string> | undefined {
    if (value == null || value === '') return undefined;
    if (Array.isArray(value)) {
        return value.map((v) => String(v)).filter(Boolean);
    }
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value) as unknown;
            if (Array.isArray(parsed)) {
                return parsed.map((v) => String(v)).filter(Boolean);
            }
        } catch {
            return value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
        }
    }
    return undefined;
}

function parseCreatePlaylistBody(body: Record<string, unknown>): CreatePlaylistDTO {
    const title = String(body.title ?? '').trim();
    const playlistType = body.playlistType as PlaylistType;
    const visibility = body.visibility as PlaylistVisibility;
    const ownerType = (body.ownerType as PlaylistOwnerType) ?? PlaylistOwnerType.LISTENER;

    return {
        title,
        description: body.description != null ? String(body.description) : undefined,
        banner: body.banner != null ? String(body.banner) : undefined,
        playlistType,
        visibility,
        ownerType,
        isCollaborative:
            body.isCollaborative === true ||
            body.isCollaborative === 'true' ||
            body.isCollaborative === '1',
        tags: parseStringArray(body.tags),
        genres: parseStringArray(body.genres),
        languages: parseStringArray(body.languages),
    };
}

function parseUpdatePlaylistBody(body: Record<string, unknown>): UpdatePlaylistDTO {
    const dto: UpdatePlaylistDTO = {};
    if (body.title != null) dto.title = String(body.title).trim();
    if (body.description !== undefined) dto.description = String(body.description);
    if (body.banner !== undefined) dto.banner = String(body.banner);
    if (body.playlistType != null) dto.playlistType = body.playlistType as PlaylistType;
    if (body.visibility != null) dto.visibility = body.visibility as PlaylistVisibility;
    if (body.ownerType != null) dto.ownerType = body.ownerType as PlaylistOwnerType;
    if (body.isCollaborative !== undefined) {
        dto.isCollaborative =
            body.isCollaborative === true ||
            body.isCollaborative === 'true' ||
            body.isCollaborative === '1';
    }
    if (body.tags !== undefined) dto.tags = parseStringArray(body.tags) ?? [];
    if (body.genres !== undefined) dto.genres = parseStringArray(body.genres) ?? [];
    if (body.languages !== undefined) {
        dto.languages = parseStringArray(body.languages) ?? [];
    }
    return dto;
}

function parseLimitSkip(req: Request): { limit: number; skip: number } {
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(String(req.query.limit ?? '25'), 10) || 25),
    );
    const skip = Math.max(0, Number.parseInt(String(req.query.skip ?? '0'), 10) || 0);
    return { limit, skip };
}

/**
 * @route POST /api/v1/playlist
 * @access Private
 */
export const createPlaylist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const body = (req.body || {}) as Record<string, unknown>;
        const dto = parseCreatePlaylistBody(body);

        if (!dto.title) {
            return next(new ErrorResponse('title is required', 400, []));
        }
        if (!Object.values(PlaylistType).includes(dto.playlistType)) {
            return next(new ErrorResponse('Invalid playlistType', 400, []));
        }
        if (!Object.values(PlaylistVisibility).includes(dto.visibility)) {
            return next(new ErrorResponse('Invalid visibility', 400, []));
        }
        if (!Object.values(PlaylistOwnerType).includes(dto.ownerType)) {
            return next(new ErrorResponse('Invalid ownerType', 400, []));
        }

        const result = await playlistService.createPlaylist(dto, asUserDoc(actorId));
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        res.status(result.code || 201).json({
            error: false,
            errors: [],
            message: result.message,
            status: result.code || 201,
            data: result.data,
        });
    },
);

/**
 * @route GET /api/v1/playlist
 * @access Private — public catalog (paginated)
 */
export const getAllPlaylists = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { limit, skip } = parseLimitSkip(req);
        const result = await playlistService.getPublicPlaylists({ limit, skip });
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: result.message || 'OK',
            status: 200,
            data: result.data,
        });
    },
);

/**
 * @route GET /api/v1/playlist/user/:userId
 * @access Private — lists playlists for the given user id (must match caller)
 */
export const getPlaylistsByUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const userId = (Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
        if (!userId) {
            return next(new ErrorResponse('userId is required', 400, []));
        }
        if (userId !== actorId) {
            return next(
                new ErrorResponse('You can only list your own playlists', 403, []),
            );
        }

        const { limit, skip } = parseLimitSkip(req);
        const result = await playlistService.getUserPlaylists(userId, {
            limit,
            skip,
        });
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: result.message || 'OK',
            status: 200,
            data: result.data,
        });
    },
);

/**
 * @route GET /api/v1/playlist/:id
 * @access Private
 */
export const getPlaylistById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }

        const result = await playlistService.getPlaylistById(id);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 404, []),
            );
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: result.message || 'OK',
            status: 200,
            data: result.data,
        });
    },
);

/**
 * @route PUT /api/v1/playlist/:id
 * @access Private
 */
export const updatePlaylist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }

        const body = (req.body || {}) as Record<string, unknown>;
        const dto = parseUpdatePlaylistBody(body);

        const result = await playlistService.updatePlaylist(id, dto, actorId);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
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

/**
 * @route DELETE /api/v1/playlist/:id
 * @access Private
 */
export const deletePlaylist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
        if (!id) {
            return next(new ErrorResponse('id is required', 400, []));
        }

        const result = await playlistService.deletePlaylist(id, actorId);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
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

/**
 * @route PATCH /api/v1/playlist/:playlistId/add
 * @access Private
 */
export const addItemToPlaylist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const playlistId = (Array.isArray(req.params.playlistId) ? req.params.playlistId[0] : req.params.playlistId);
        if (!playlistId) {
            return next(new ErrorResponse('playlistId is required', 400, []));
        }

        const body = (req.body || {}) as Record<string, unknown>;
        const itemId = String(body.itemId ?? '').trim();
        if (!itemId) {
            return next(new ErrorResponse('itemId is required', 400, []));
        }

        const itemTypeRaw = String(body.itemType ?? '').trim();
        if (
            itemTypeRaw !== PlaylistItemResourceType.SERMON &&
            itemTypeRaw !== PlaylistItemResourceType.SERIES
        ) {
            return next(
                new ErrorResponse(
                    'itemType is required and must be "sermon" or "series"',
                    400,
                    [],
                ),
            );
        }
        const itemType = itemTypeRaw as PlaylistItemResourceType;

        const dto: AddPlaylistItemDTO = {
            itemId,
            itemType,
            position:
                body.position !== undefined && body.position !== ''
                    ? Number(body.position)
                    : undefined,
        };

        const result = await playlistService.addItem(playlistId, dto, actorId);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
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

/**
 * @route PATCH /api/v1/playlist/:playlistId/remove
 * @access Private
 */
export const removeItemFromPlaylist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const playlistId = (Array.isArray(req.params.playlistId) ? req.params.playlistId[0] : req.params.playlistId);
        if (!playlistId) {
            return next(new ErrorResponse('playlistId is required', 400, []));
        }

        const body = (req.body || {}) as Record<string, unknown>;
        const itemId = String(body.itemId ?? '').trim();
        if (!itemId) {
            return next(new ErrorResponse('itemId is required', 400, []));
        }

        const dto: RemovePlaylistItemDTO = { itemId };

        const result = await playlistService.removeItem(playlistId, dto, actorId);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
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
