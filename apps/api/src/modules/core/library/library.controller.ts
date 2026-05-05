import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import { pathParam } from '../../../utils/route-params.util';
import { getAuthUserId } from '../../../utils/auth-request.util';
import { userIsStaff } from '../../users/user/user.staff.util';
import type { ILibraryDoc } from './library.interface';
import libraryRepository from './library.repository';

async function assertStaff(req: Request) {
    const id = getAuthUserId(req);
    if (!id) {
        throw new ErrorResponse('Unauthorized', 401, []);
    }
    if (!(await userIsStaff(id))) {
        throw new ErrorResponse('Forbidden: staff only', 403, []);
    }
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

/**
 * @name createLibrary
 * @description Create a new user library document
 * @route POST /api/v1/library
 * @access Private
 */
export const createLibrary = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const actorId = getAuthUserId(req);
        if (!actorId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        let { user } = req.body as { user?: string };
        if (user == null || user === '') {
            user = actorId;
        } else if (user !== actorId && !(await userIsStaff(actorId))) {
            return next(
                new ErrorResponse(
                    'You can only create a library for your own account',
                    403,
                    [],
                ),
            );
        }

        const library = await libraryRepository.createLibrary({ user });
        if (library.error) {
            return next(new ErrorResponse(library.message, library.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Library created successfully',
            status: 200,
            data: library.data,
        });
    },
);

/**
 * @name getLibraryByUser
 * @description Get a user's library document
 * @route GET /api/v1/library/user/:userId
 * @access Private
 */
export const getLibraryByUser = asyncHandler(
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

        const library = await libraryRepository.findByUser(userId);

        if (library.error) {
            return next(new ErrorResponse(library.message, library.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Library fetched successfully',
            status: 200,
            data: library.data,
        });
    },
);

/**
 * @name getLibraryById
 * @description Get a library document by Mongo id (must belong to :userId)
 * @route GET /api/v1/library/user/:userId/:libraryId
 * @access Private
 */
export const getLibraryById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = pathParam(req.params.userId);
        const libraryId = pathParam(req.params.libraryId);
        if (!userId || !libraryId) {
            return next(
                new ErrorResponse('userId and libraryId are required', 400, []),
            );
        }

        try {
            await assertSelfOrStaff(req, userId);
        } catch (e) {
            return next(e);
        }

        const library = await libraryRepository.findById(libraryId);
        if (library.error) {
            return next(new ErrorResponse(library.message, library.code, []));
        }

        const lib = library.data as ILibraryDoc;
        const ownerId =
            lib.user != null &&
            typeof (lib.user as { toString?: () => string }).toString ===
                'function'
                ? (lib.user as { toString: () => string }).toString()
                : String(lib.user);

        if (!ownerId || ownerId !== userId) {
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
 * @description Get all user library documents (staff)
 * @route GET /api/v1/library
 * @access Private (staff)
 */
export const getAllLibraries = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await assertStaff(req);
        } catch (e) {
            return next(e);
        }

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
            message: 'All user libraries fetched successfully',
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
 * @description Update fields in a user's library (keyed by user id)
 * @route PUT /api/v1/library/user/:userId
 * @access Private
 */
export const updateLibrary = asyncHandler(
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

        const updates = { ...req.body };
        delete (updates as { user?: unknown }).user;

        const library = await libraryRepository.updateLibrary(userId, updates);

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
 * @description Delete a user's library document (keyed by user id)
 * @route DELETE /api/v1/library/user/:userId
 * @access Private
 */
export const deleteLibrary = asyncHandler(
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

        const deleted = await libraryRepository.deleteLibrary(userId);
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
