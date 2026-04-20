import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import { getAuthUserId } from '../../../utils/auth-request.util';
import type { PushDevicePlatform } from './push-device.interface';
import pushDeviceRepository from './push-device.repository';

function parsePlatform(raw: unknown): PushDevicePlatform {
    const p = typeof raw === 'string' ? raw.toLowerCase() : 'unknown';
    if (p === 'ios' || p === 'android' || p === 'web' || p === 'unknown') {
        return p;
    }
    return 'unknown';
}

/**
 * Registers or updates a push token for the signed-in user.
 * Honor `IUserPreferencesNotifications.push` from preferences before sending pushes.
 *
 * @route POST /api/v1/notifications/device
 * @body { token, platform?, deviceLabel? }
 */
export const registerPushDevice = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getAuthUserId(req);
        if (!userId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const { token, deviceLabel } = req.body as {
            token?: string;
            deviceLabel?: string;
        };
        if (!token || typeof token !== 'string') {
            return next(new ErrorResponse('token is required', 400, []));
        }

        const platform = parsePlatform(req.body.platform);

        const result = await pushDeviceRepository.register(
            userId,
            token.trim(),
            platform,
            deviceLabel,
        );

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
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
 * @route DELETE /api/v1/notifications/device
 * @body { token }
 */
export const removePushDevice = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getAuthUserId(req);
        if (!userId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const { token } = req.body as { token?: string };
        if (!token || typeof token !== 'string') {
            return next(new ErrorResponse('token is required', 400, []));
        }

        const result = await pushDeviceRepository.remove(userId, token.trim());
        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
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

/** @route GET /api/v1/notifications/device */
export const listPushDevices = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = getAuthUserId(req);
        if (!userId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const result = await pushDeviceRepository.listForUser(userId);
        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
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
