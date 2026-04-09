import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import guestService from './guest.service';
import { CreateGuestDTO, UpdateGuestDTO } from './guest.dto';
import redisWrapper from '../../../middlewares/redis.mdw';
import userRepository from '../user/user.repository';
import { UserType } from '../user/user.interface';
import { GuestTypeEnum } from './guest.interface';

/**
 * @name createGuest
 * @description Creates a new guest profile (MENTOR, JUDGE, or GUEST type)
 * @route POST /guests
 * @access  Private
 */
export const createGuest: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        // Prevent business users from creating guest profiles
        const userResult = await userRepository.findById(userId);
        if (userResult.error || !userResult.data) {
            return next(new ErrorResponse('User not found', 404, []));
        }
        const user = userResult.data as any;
        if (user.userType === UserType.BUSINESS) {
            return next(
                new ErrorResponse(
                    'Business users cannot create guest profiles',
                    403,
                    [],
                ),
            );
        }

        const { type, guestImage, ...restBody } = req.body;

        // Handle file upload if present
        let imageFile = guestImage;
        if ((req as any).files && (req as any).files.guestImage) {
            imageFile = (req as any).files.guestImage;
        }

        const data: CreateGuestDTO = {
            ...restBody,
            type: type || GuestTypeEnum.GUEST,
            guestImage: imageFile,
            orgId: userId,
            invitedBy: userId,
        };

        const result = await guestService.createGuest(data);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code, []),
            );
        }

        res.status(201).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 201,
        });
    },
);

/**
 * @name getGuest
 * @description Retrieves guest information by ID
 * @route GET /guests/:id
 * @access  Private
 */
export const getGuest: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id)
            return next(new ErrorResponse('Guest ID is required', 400, []));

        const cacheKey = `guest:${id}`;
        const cacheTTL = 300; // 5 minutes

        // Check cache first
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Guest retrieved successfully (cached).',
                status: 200,
            });
        }

        // Get guest from service
        const result = await guestService.getGuest(id);

        if (result.error || !result.data) {
            return next(
                new ErrorResponse(
                    result.message || 'Guest not found',
                    result.code || 404,
                    [],
                ),
            );
        }

        // Cache the result
        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            cacheTTL,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name getGuests
 * @description Retrieves a paginated list of guests with filtering and sorting
 * @route GET /guests
 * @access  Private
 */
export const getGuests: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            page = 1,
            limit = 25,
            sort = '-createdAt',
            select,
            populate,
            type, // Filter by guest type (MENTOR, JUDGE, GUEST)
            ...filters
        } = req.query;

        // Build filter with type if provided
        const filter: any = { ...filters };
        if (type) {
            filter.type = type;
        }

        // Build cache key from query parameters
        const cacheKey = `guests:list:${JSON.stringify({ page, limit, sort, select, filter })}`;
        const cacheTTL = 180; // 3 minutes

        // Check cache first
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached.data,
                pagination: cached.pagination,
                count: cached.count,
                total: cached.total,
                message: 'Guests retrieved successfully (cached).',
                status: 200,
            });
        }

        // Build query options
        const options: any = {
            page: parseInt(String(page), 10),
            limit: parseInt(String(limit), 10),
            sort: String(sort),
        };

        if (select) {
            options.select = String(select);
        }

        if (populate) {
            options.populate = String(populate);
        }

        // Get guests from service
        const result = await guestService.getGuests(
            filter,
            options,
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Prepare response data
        const responseData = {
            data: result.data,
            pagination: result.pagination,
            count: result.pagination?.count,
            total: result.pagination?.total,
        };

        // Cache the result
        await redisWrapper.keepData(
            { key: cacheKey, value: responseData },
            cacheTTL,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            pagination: result.pagination,
            count: result.pagination?.count,
            total: result.pagination?.total,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name updateGuest
 * @description Updates guest profile information
 * @route PUT /guests/:id
 * @access  Private
 */
export const updateGuest: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { id } = req.params;
        if (!id)
            return next(new ErrorResponse('Guest ID is required', 400, []));

        const { guestImage, ...restBody } = req.body;

        // Handle file upload if present
        let imageFile = guestImage;
        if ((req as any).files && (req as any).files.guestImage) {
            imageFile = (req as any).files.guestImage;
        }

        const data: UpdateGuestDTO = {
            ...restBody,
            guestImage: imageFile,
        };

        const result = await guestService.updateGuest(id, data);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`guest:${id}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name deleteGuest
 * @description Deletes a guest profile
 * @route DELETE /guests/:id
 * @access  Private
 */
export const deleteGuest: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { id } = req.params;
        if (!id)
            return next(new ErrorResponse('Guest ID is required', 400, []));

        const result = await guestService.deleteGuest(id);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`guest:${id}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);
