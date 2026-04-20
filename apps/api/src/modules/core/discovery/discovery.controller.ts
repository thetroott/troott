import { Request, Response } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import discoveryService from './discovery.service';

/**
 * @route GET /api/v1/discovery/home
 * @access Private
 */
export const getDiscoveryHome = asyncHandler(
    async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 12;
        const skip = Number(req.query.skip) || 0;

        const data = await discoveryService.homeRails({ limit, skip });

        res.status(200).json({
            error: false,
            errors: [],
            message: 'Discovery rails',
            status: 200,
            data,
        });
    },
);
