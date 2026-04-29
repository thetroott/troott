import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import preferenceService from './preference.service';
import ErrorResponse from '../../../utils/error.util';
import { getAuthUserId } from '../../../utils/auth-request.util';
import { pathParam } from '../../../utils/route-params.util';
import type { CreatePreferencesDTO, PreferencePatchDTO } from './preference.dto';

/**
 * @name createPreferences
 * @route POST /api/v1/preference
 */
export const createPreferences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body as CreatePreferencesDTO;
        const result = await preferenceService.createInitial(
            getAuthUserId(req),
            body,
        );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(201).json({
            error: false,
            errors: [],
            message: 'Preferences created successfully',
            status: 201,
            data: result.data,
        });
    },
);

/**
 * @name getMyPreferences
 * @route GET /api/v1/preference/me
 */
export const getMyPreferences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = getAuthUserId(req);
        const result = await preferenceService.getByUser(id, id);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Preferences fetched successfully',
            status: 200,
            data: result.data,
        });
    },
);

/**
 * @name patchMyPreferences
 * @route PATCH /api/v1/preference/me
 */
export const patchMyPreferences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = getAuthUserId(req);
        const result = await preferenceService.patchByUser(
            id,
            id,
            req.body as PreferencePatchDTO,
        );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Preferences updated successfully',
            status: 200,
            data: result.data,
        });
    },
);

/**
 * @name getUserPreferences
 * @route GET /api/v1/preference/:userId
 */
export const getUserPreferences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = pathParam(req.params.userId);
        if (!userId) {
            return next(new ErrorResponse('userId is required', 400, []));
        }

        const result = await preferenceService.getByUser(
            getAuthUserId(req),
            userId,
        );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Preferences fetched successfully',
            status: 200,
            data: result.data,
        });
    },
);

/**
 * @name updatePreferences
 * @route PATCH /api/v1/preference/:userId
 */
export const updatePreferences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = pathParam(req.params.userId);
        if (!userId) {
            return next(new ErrorResponse('userId is required', 400, []));
        }

        const result = await preferenceService.patchByUser(
            getAuthUserId(req),
            userId,
            req.body as PreferencePatchDTO,
        );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Preferences updated successfully',
            status: 200,
            data: result.data,
        });
    },
);

/**
 * @name deletePreferences
 * @route DELETE /api/v1/preference/:userId
 */
export const deletePreferences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = pathParam(req.params.userId);
        if (!userId) {
            return next(new ErrorResponse('userId is required', 400, []));
        }

        const result = await preferenceService.clearByUser(
            getAuthUserId(req),
            userId,
        );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Preferences deleted successfully',
            status: 200,
            data: result.data,
        });
    },
);

/**
 * @name getAllPreferences
 * @route GET /api/v1/preference/
 */
export const getAllPreferences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await preferenceService.getAll(getAuthUserId(req));

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            message: 'All user preferences fetched successfully',
            status: 200,
            data: result.data,
        });
    },
);
