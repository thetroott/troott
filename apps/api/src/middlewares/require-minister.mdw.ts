import { NextFunction, Request, Response } from 'express';
import Minister from '@/models/core/minister.model';
import ErrorResponse from '../utils/error.util';
import asyncHandler from './async.mdw';

/** Restrict route to users linked to a Minister profile (creator uploads). */
export const requireMinisterProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const uid = (req as Request & { user?: { id?: string } }).user?.id;
        if (!uid) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }
        const minister = await Minister.findOne({ user: uid }).select('_id').lean();
        if (!minister) {
            return next(
                new ErrorResponse(
                    'Only ministers can upload sermon audio',
                    403,
                    [],
                ),
            );
        }
        next();
    },
);
