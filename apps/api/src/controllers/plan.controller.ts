import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../middlewares/async.mdw';
import Protect from '../middlewares/checkAuth.mdw';
import planService from '@/services/plan.service';
import ErrorResponse from '../utils/error.util';
import { pathParam } from '../utils/route-params.util';

/**
 * @name getPlans
 * @description Retrieve a list of all available plans.
 * @route GET /plans
 * @access Private (Pacepard Admins only)
 */
export const getPlans: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // get user from request
        const user = (req as any).user;
        if (!user) {
            return next(
                new ErrorResponse(
                    'Not authorized to access this route',
                    401,
                    [],
                ),
            );
        }

        // check if user is pacepard admin
        if (!user.isAdmin) {
            return next(
                new ErrorResponse('Access denied: Admins only', 403, []),
            );
        }

        // Build query parameters
        const { sort, page, limit, type, status } = req.query;

        const filterOptions: any = {
            page: page ? parseInt(String(page), 10) : 1,
            limit: limit ? parseInt(String(limit), 10) : 10,
            sort: sort ? String(sort) : '-createdAt',
        };

        if (type) {
            filterOptions.planType = String(type).toLowerCase(); // e.g. 'business' or 'listener'
        }

        if (status) {
            // convert status to boolean
            if (String(status).toLowerCase() === 'enabled') {
                filterOptions.isEnabled = true;
            } else if (String(status).toLowerCase() === 'disabled') {
                filterOptions.isEnabled = false;
            }
        }

        const result = await planService.getAllPlans(filterOptions);

        res.status(result.code).json({
            error: result.error,
            message: result.message,
            data: result.data,
        });
    },
);

/**
 * @name addNewPlan
 * @description Add a new plan to the system.
 * @route POST /plans
 * @access Private (Pacepard Admins only)
 */
export const addNewPlan: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // get user from request
        const user = (req as any).user;
        if (!user) {
            return next(
                new ErrorResponse(
                    'Not authorized to access this route',
                    401,
                    [],
                ),
            );
        }

        // check if user is pacepard admin
        if (!user.isAdmin) {
            return next(
                new ErrorResponse('Access denied: Admins only', 403, []),
            );
        }

        const planData = req.body;

        // validate planData here as needed
        const validationResult = await planService.validateDto(planData);
        if (validationResult.error) {
            return next(
                new ErrorResponse(
                    validationResult.message,
                    validationResult.code,
                    validationResult.data,
                ),
            );
        }

        const result = await planService.createNewPlan(planData);

        res.status(result.code).json({
            error: result.error,
            message: result.message,
            data: result.data,
        });
    },
);

/**
 * @name updatePlan
 * @description Update an existing plan.
 * @route PATCH /plans/:planId
 * @access Private (Pacepard Admins only)
 */
export const updatePlan: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // get user from request
        const user = (req as any).user;
        if (!user) {
            return next(
                new ErrorResponse(
                    'Not authorized to access this route',
                    401,
                    [],
                ),
            );
        }

        // check if user is pacepard admin
        if (!user.isAdmin) {
            return next(
                new ErrorResponse('Access denied: Admins only', 403, []),
            );
        }

        const planId = pathParam(req.params.planId);
        if (!planId) {
            return next(new ErrorResponse('Plan ID is required', 400, []));
        }
        const updates = req.body;

        // validate for acceptable fields
        const fieldValidationResult =
            await planService.validateUpdateField(updates);

        if (fieldValidationResult.error) {
            return next(
                new ErrorResponse(
                    fieldValidationResult.message,
                    fieldValidationResult.code,
                    fieldValidationResult.data,
                ),
            );
        }

        const result = await planService.updatePlan({ planId, updates });

        res.status(result.code).json({
            error: result.error,
            message: result.message,
            data: result.data,
        });
    },
);
