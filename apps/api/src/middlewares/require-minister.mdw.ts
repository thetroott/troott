import { NextFunction, Request, Response } from 'express';
import Minister from '@/models/core/minister.model';
import Creator from '@/models/core/creator.model';
import ErrorResponse from '../utils/error.util';
import asyncHandler from './async.mdw';

/** Restrict route to users with a minister or creator studio profile. */
export const requireMinisterProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const uid = (req as Request & { user?: { id?: string } }).user?.id;
        if (!uid) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }
        const [minister, creator] = await Promise.all([
            Minister.findOne({ user: uid }).select('_id').lean(),
            Creator.findOne({ user: uid }).select('_id').lean(),
        ]);
        if (!minister && !creator) {
            return next(
                new ErrorResponse(
                    'Only studio content owners can upload sermon audio',
                    403,
                    [],
                ),
            );
        }
        next();
    },
);
